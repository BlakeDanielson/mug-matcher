import pandas as pd
from openai import OpenAI
import os
import csv
from dotenv import load_dotenv
import time
import datetime
import argparse
import sys
import pkg_resources

# --- Globals ---
DEFAULT_MODEL = "gpt-4.1-mini" # Using gpt-4.1-mini as it's a good balance
current_model_global = DEFAULT_MODEL
client_global = None

# --- Helper Functions ---
def log_message(message):
    """Logs a message with a timestamp."""
    timestamp = datetime.datetime.now().strftime("%H:%M:%S.%f")[:-3]
    print(f"[{timestamp}] {message}")

def check_required_packages():
    """Checks if required Python packages are installed."""
    required = {
        "openai": ">=1.0.0",
        "python-dotenv": ">=0.19.0",
        "pandas": ">=1.0.0"
    }
    missing_packages = False
    for package, version_spec in required.items():
        try:
            pkg_version = pkg_resources.get_distribution(package).version
            log_message(f"Found {package} version {pkg_version}.")
        except pkg_resources.DistributionNotFound:
            log_message(f"ERROR: Required package {package} (version {version_spec}) not installed.")
            missing_packages = True
    if missing_packages:
        log_message("Please install missing packages (e.g., pip install -r requirements.txt if available, or pip install <package_name>).")
        sys.exit(1)

def initialize_openai_client():
    """Initializes and returns the OpenAI client."""
    global client_global
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_path):
        load_dotenv(env_path)
        log_message(f"Loaded .env file from: {env_path}")
    else:
        log_message(f"Warning: No .env file found at {env_path}. Attempting to load from default OS environment.")
        load_dotenv()

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        log_message("ERROR: OPENAI_API_KEY not found in .env file or environment variables.")
        log_message("Please ensure an API key is available.")
        sys.exit(1)
    
    client_global = OpenAI(api_key=api_key)
    log_message("OpenAI client initialized successfully.")
    # Verify model access
    try:
        log_message(f"Verifying access to OpenAI model '{current_model_global}'...")
        client_global.models.retrieve(current_model_global)
        log_message(f"Successfully verified access to model '{current_model_global}'.")
    except Exception as e:
        log_message(f"ERROR: Could not access OpenAI model '{current_model_global}'. Error: {e}")
        log_message("Please check your API key, organization ID (if applicable), and model availability.")
        sys.exit(1)

# --- OpenAI API Call Function ---
def call_openai_api(messages, max_tokens=150, temperature=0.3, timeout=45):
    """
    Helper function to call OpenAI Chat Completions API with error handling and retries.
    Uses global client_global and current_model_global.
    """
    retries = 3
    for attempt in range(retries):
        try:
            log_message(f"Calling OpenAI API (model: {current_model_global}, attempt {attempt + 1}/{retries}, timeout: {timeout}s)...")
            start_time = time.time()
            response = client_global.chat.completions.create(
                model=current_model_global,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                timeout=timeout
            )
            elapsed = time.time() - start_time
            log_message(f"API call successful in {elapsed:.2f} seconds.")
            return response.choices[0].message.content.strip()
        except Exception as e:
            log_message(f"OpenAI API error (attempt {attempt + 1}/{retries}): {str(e)}")
            if "RateLimitError" in str(e) or "APIConnectionError" in str(e) or "Timeout" in str(e) or "APIError" in str(e) or "InternalServerError" in str(e): # Specific errors for retry
                if attempt < retries - 1:
                    sleep_time = (2 ** attempt) + (0.5 * attempt) # Exponential backoff with jitter
                    log_message(f"Retrying in {sleep_time:.2f} seconds...")
                    time.sleep(sleep_time)
                else:
                    log_message("Max retries reached for API call. Returning error.")
                    return f"Error: API call failed after {retries} attempts due to: {type(e).__name__}."
            else: # Non-retryable error
                log_message(f"Non-retryable API error: {type(e).__name__}. Returning error.")
                return f"Error: API call failed due to: {type(e).__name__}."
    return f"Error: API call failed after {retries} attempts." # Should be caught by else above

# --- AI Processing Functions ---
def get_consolidated_plain_english_best_crime(raw_charge_list, inmate_name=None):
    """
    Analyzes a list of raw charges, selects the most significant one, 
    and rewords it into a concise, plain English summary.
    Input inmate_name is optional and currently not used in the prompt but available for future enhancements.
    """
    if not raw_charge_list:
        log_message("  No raw charges provided to get_consolidated_plain_english_best_crime.")
        return "No charges to analyze"

    # Prepare the charge list for the prompt
    if len(raw_charge_list) == 1:
        charge_list_str_for_prompt = raw_charge_list[0]
        # If only one charge, the prompt needs to be clear it should still rephrase it.
        instruction_intro = "Here is the raw charge/sentence history description for an individual:"
    else:
        charge_list_str_for_prompt = "\n".join([f"{i + 1}. {charge}" for i, charge in enumerate(raw_charge_list)])
        instruction_intro = "Here is a list of raw charge/sentence history descriptions for an individual:"

    system_prompt = (
        "You are an expert legal analyst and a creative writer for a crime-themed game. "
        "Your task is to summarize complex criminal charges, prison sentences, and legal histories into clear, concise, and impactful plain English that would be engaging for players. "
        "You will be given one or more raw charge descriptions, sentence histories, detainers, or incarceration records for a single individual.\n\n"
        "Your primary goal is to select *up to two* of the most 'exciting', 'unusual', or 'story-worthy' crimes for a game context. "
        "Prioritize charges that describe specific actions, especially those involving harm, significant illicit goods, or dramatic events, over procedural violations or less descriptive offenses.\n\n"
        "Follow these steps:\n"
        "1. Review all provided charge(s)/sentence history for the individual.\n"
        "2. Identify one or, if applicable and distinct enough, two charges that best fit the 'exciting/unusual/story-worthy' criteria. Do not select more than two. For example:\n"
        "   - Prefer charges like 'Murder', 'Armed Robbery', 'Drug Trafficking', 'Burglary', 'Sexual Battery' over 'Probation Violation', 'Failure to Appear', or generic 'Disorderly Conduct' unless the latter are directly linked to a more severe unlisted crime.\n"
        "   - If multiple action-based charges exist, pick the one or two that sound most distinct or severe.\n"
        "3. Rewrite *each selected charge* into a brief, plain English phrase (ideally under 10-15 words per charge, max 20). Make them sound impactful for a game. "
        "   **If the raw charge includes specific details like degrees (1st degree, 2nd degree), quantities, or other severity indicators, try to incorporate them if they enhance the impact (e.g., 'First Degree Murder', 'Armed Robbery with Firearm', 'Drug Trafficking Over 400g').** However, do not force details if they make the description clunky.\n"
        "4. If you selected two charges, join the two rephrased descriptions with a ' | ' delimiter. If you selected only one, return just that single rephrased description.\n"
        "5. Return *only* the resulting plain English phrase(s). Do not include explanations, disclaimers, numbering, or any other text.\n\n"
        "Examples of desired output format (raw input -> your chosen and rephrased output):\n"
        "- ['MURDER IN THE FIRST DEGREE'] -> First Degree Murder\n"
        "- ['ARMED ROBBERY W/FIREARM', 'BURGLARY OF DWELLING'] -> Armed Robbery with Firearm | Home Burglary\n"
        "- ['TRAFFICKING IN COCAINE OVER 400G', 'POSSESSION OF FIREARM BY CONVICTED FELON'] -> Cocaine Trafficking Over 400g\n"
        "- ['SEXUAL BATTERY VICTIM 12 YRS OR MORE'] -> Sexual Battery\n"
        "- ['GRAND THEFT AUTO', 'FLEEING/ELUDING POLICE'] -> Grand Theft Auto | Police Chase\n"
        "- ['DUI MANSLAUGHTER'] -> DUI Manslaughter\n"
        "- ['AGGRAVATED BATTERY WITH DEADLY WEAPON'] -> Aggravated Battery with Weapon"
    )

    user_prompt = f"{instruction_intro}\n{charge_list_str_for_prompt}\n\nPlease provide the rephrased plain English summary for up to two of the most significant charges, delimited by ' | ' if two are selected."

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    selected_and_rephrased_charge = call_openai_api(messages, max_tokens=120, temperature=0.25)

    if selected_and_rephrased_charge.startswith("Error:"):
        log_message(f"  API call failed for consolidating best crime. Fallback needed.")
        # Basic fallback: reword the first charge if possible, or return a generic error.
        if raw_charge_list:
            first_charge_reword_attempt = call_openai_api([
                {"role": "system", "content": "Rewrite the following charge into simple plain English (max 15 words). Example: MURDER IN THE FIRST DEGREE -> First Degree Murder."},
                {"role": "user", "content": raw_charge_list[0]}
            ], max_tokens=30, temperature=0.1)
            if not first_charge_reword_attempt.startswith("Error:"):
                return first_charge_reword_attempt
        return "Could not determine best crime"
    
    return selected_and_rephrased_charge

# --- Main Processing Function ---
def process_fdc_inmate_data(df, output_column_name="Best_Crime"):
    """
    Processes the DataFrame to add the 'Best_Crime' column using the consolidated AI call.
    Adapted for FDC data format with DCNumber, CurrentPrisonSentenceHistory, etc.
    """
    log_message(f"Initializing '{output_column_name}' column...")
    df[output_column_name] = None 

    total_rows = len(df)
    log_message(f"Starting processing of {total_rows} FDC inmates for '{output_column_name}'...")

    for index, row in df.iterrows():
        log_message(f"Processing inmate {index + 1}/{total_rows}, DCNumber: {row.get('DCNumber', 'N/A')}, Name: {row.get('Name', 'N/A')}")
        
        # --- Enhanced Charge Detail Extraction for FDC format ---
        sentence_history_str = str(row.get('CurrentPrisonSentenceHistory', ''))
        detainers_str = str(row.get('Detainers', ''))
        incarceration_history_str = str(row.get('IncarcerationHistory', ''))
        prior_prison_history_str = str(row.get('PriorPrisonHistory', ''))

        # Collect all non-empty crime-related information
        combined_crime_info = []
        
        if sentence_history_str and sentence_history_str.lower() not in ['nan', 'none', '']:
            combined_crime_info.append(f"Current Sentence: {sentence_history_str}")
        
        if detainers_str and detainers_str.lower() not in ['nan', 'none', '']:
            combined_crime_info.append(f"Detainers: {detainers_str}")
        
        if incarceration_history_str and incarceration_history_str.lower() not in ['nan', 'none', '']:
            combined_crime_info.append(f"Incarceration History: {incarceration_history_str}")
        
        if prior_prison_history_str and prior_prison_history_str.lower() not in ['nan', 'none', '']:
            combined_crime_info.append(f"Prior Prison History: {prior_prison_history_str}")

        # If no crime information is available, skip AI processing
        if not combined_crime_info:
            log_message("  No crime information found for this inmate. Skipping AI processing.")
            df.loc[index, output_column_name] = "No crime information listed"
            continue
            
        best_crime_for_row = "No charges to process" # Default if processing fails

        log_message(f'  Processing {len(combined_crime_info)} crime information field(s) for this inmate: "{str(combined_crime_info)[:250]}..."')
        # Call the AI function with the combined crime information
        best_crime_for_row = get_consolidated_plain_english_best_crime(combined_crime_info, row.get('Name', 'N/A'))
        log_message(f'  Consolidated Best Crime: "{best_crime_for_row}"')
        
        df.loc[index, output_column_name] = best_crime_for_row

    log_message(f"Finished processing {total_rows} FDC inmates for '{output_column_name}'.")
    return df

# --- Main Execution ---
def main():
    global current_model_global

    check_required_packages()
    
    parser = argparse.ArgumentParser(description='Consolidated script to sort FDC inmate data by DCNumber, analyze crime information using OpenAI, and identify the "Best Crime".')
    parser.add_argument('--input', type=str, default='fdc_inmate_data.csv', help='Input CSV file path (FDC format). Default: fdc_inmate_data.csv')
    parser.add_argument('--output', type=str, default='master_fdc_analysis.csv', help='Output CSV file path for the consolidated analysis. Default: master_fdc_analysis.csv')
    parser.add_argument('--max-rows', type=int, help='Maximum number of rows to process (for testing purposes).')
    parser.add_argument('--model', type=str, default=DEFAULT_MODEL, help=f'OpenAI model to use for analysis. Default: {DEFAULT_MODEL}')
    parser.add_argument('--save-interval', type=int, default=20, help='Save intermediate progress every N rows. Default: 20. Set to 0 to disable.')
    
    args = parser.parse_args()
    current_model_global = args.model

    initialize_openai_client() # Initialize after parsing args to get model

    script_dir = os.path.dirname(__file__)
    input_csv_path = args.input if os.path.isabs(args.input) else os.path.join(script_dir, args.input)
    output_csv_path = args.output if os.path.isabs(args.output) else os.path.join(script_dir, args.output)

    log_message(f"--- MugMatcher FDC Consolidated Processor ---")
    log_message(f"Input CSV: {input_csv_path}")
    log_message(f"Output CSV: {output_csv_path}")
    log_message(f"Using OpenAI model: {current_model_global}")
    if args.max_rows:
        log_message(f"Processing a maximum of {args.max_rows} rows.")
    if args.save_interval > 0:
        log_message(f"Saving intermediate progress every {args.save_interval} rows.")

    if not os.path.exists(input_csv_path):
        log_message(f"ERROR: Input file '{input_csv_path}' does not exist!")
        sys.exit(1)
    
    output_dir = os.path.dirname(output_csv_path)
    if output_dir and not os.path.exists(output_dir):
        try:
            os.makedirs(output_dir)
            log_message(f"Created output directory: {output_dir}")
        except OSError as e:
            log_message(f"ERROR: Could not create output directory '{output_dir}'. Error: {e.strerror}")
            sys.exit(1)

    try:
        log_message(f"Reading and preparing input CSV: {input_csv_path}")
        # Detect delimiter by peeking at the first line
        try:
            with open(input_csv_path, 'r', encoding='utf-8') as f_peek:
                first_line = f_peek.readline()
                dialect = csv.Sniffer().sniff(first_line, delimiters=[',',';','\t','|'])
                delimiter = dialect.delimiter
                log_message(f"Detected delimiter: '{delimiter}'")
        except Exception as e_sniff:
            log_message(f"Could not automatically detect delimiter: {e_sniff}. Defaulting to ','.")
            delimiter = ','
        
        df = pd.read_csv(input_csv_path, delimiter=delimiter, on_bad_lines='warn', low_memory=False)
        log_message(f"Successfully read {len(df)} rows from {input_csv_path}.")

        # --- Ensure 'DCNumber' column exists ---
        if 'DCNumber' not in df.columns:
            log_message("ERROR: 'DCNumber' column not found in input CSV. This column is required for sorting FDC data.")
            sys.exit(1)
        
        # Check for crime information columns and warn if missing
        crime_columns = ['CurrentPrisonSentenceHistory', 'Detainers', 'IncarcerationHistory', 'PriorPrisonHistory']
        missing_crime_columns = [col for col in crime_columns if col not in df.columns]
        if missing_crime_columns:
            log_message(f"Warning: The following crime information columns are missing: {missing_crime_columns}")
            log_message("AI analysis will proceed with available crime information columns.")
        
        # Ensure required columns are strings
        df['DCNumber'] = df['DCNumber'].astype(str)
        for col in crime_columns:
            if col in df.columns:
                df[col] = df[col].astype(str)

        log_message("Sorting data by 'DCNumber'...")
        # Convert DCNumber to numeric for proper sorting, handling any non-numeric values
        df['DCNumber_numeric'] = pd.to_numeric(df['DCNumber'], errors='coerce')
        df.dropna(subset=['DCNumber_numeric'], inplace=True)
        df.sort_values(by='DCNumber_numeric', inplace=True, kind='mergesort')
        # Drop the temporary numeric column
        df.drop('DCNumber_numeric', axis=1, inplace=True)
        log_message("Data sorted successfully by DCNumber.")

        # --- Limit rows if --max-rows is set ---
        if args.max_rows and args.max_rows < len(df):
            log_message(f"Limiting DataFrame to the first {args.max_rows} rows for processing.")
            df_to_process = df.head(args.max_rows).copy()
        else:
            df_to_process = df.copy()
        
        # --- AI Processing with intermediate saving ---
        if args.save_interval > 0 and len(df_to_process) > args.save_interval:
            num_batches = (len(df_to_process) - 1) // args.save_interval + 1
            processed_dfs = []
            for i in range(num_batches):
                start_idx = i * args.save_interval
                end_idx = min((i + 1) * args.save_interval, len(df_to_process))
                batch_df = df_to_process.iloc[start_idx:end_idx]
                
                log_message(f"Processing batch {i+1}/{num_batches} (rows {start_idx+1}-{end_idx})...")
                processed_batch_df = process_fdc_inmate_data(batch_df.copy())
                processed_dfs.append(processed_batch_df)
                
                # Combine all processed batches so far and save
                current_full_processed_df = pd.concat(processed_dfs, ignore_index=True)
                
                temp_output_path = f"{output_csv_path}.batch_{i+1}_of_{num_batches}.tmp"
                current_full_processed_df.to_csv(temp_output_path, index=False, quoting=csv.QUOTE_ALL)
                log_message(f"Intermediate progress for batch {i+1} saved to {temp_output_path}")
            
            final_df = pd.concat(processed_dfs, ignore_index=True)
        else: # Process all at once
            final_df = process_fdc_inmate_data(df_to_process)

        log_message("Consolidated FDC processing complete.")
        final_df.to_csv(output_csv_path, index=False, quoting=csv.QUOTE_ALL)
        log_message(f"Results saved to {output_csv_path}")
        
        # Clean up temporary batch files if they exist
        if args.save_interval > 0 and len(df_to_process) > args.save_interval:
            for i in range(num_batches):
                 temp_output_path = f"{output_csv_path}.batch_{i+1}_of_{num_batches}.tmp"
                 if os.path.exists(temp_output_path):
                     try:
                         os.remove(temp_output_path)
                         log_message(f"Removed temporary file: {temp_output_path}")
                     except OSError as e_rem:
                         log_message(f"Warning: Could not remove temporary file {temp_output_path}: {e_rem.strerror}")

    except FileNotFoundError:
        log_message(f"ERROR: Input file not found during main execution. Path: {input_csv_path}")
    except pd.errors.EmptyDataError:
        log_message(f"ERROR: Input file {input_csv_path} is empty or not valid CSV.")
    except Exception as e:
        log_message(f"An unexpected error occurred in main execution: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        log_message("--- Script finished ---")

if __name__ == "__main__":
    main() 