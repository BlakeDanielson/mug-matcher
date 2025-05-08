import csv
import os
import sys
import time
import datetime
import io
import argparse
from openai import OpenAI # You'll need to install this: pip install openai
from dotenv import load_dotenv
import pkg_resources  # To check installed packages

# Helper function for logging with timestamps
def log_message(message):
    timestamp = datetime.datetime.now().strftime("%H:%M:%S.%f")[:-3]
    print(f"[{timestamp}] {message}")

# Check for required packages
required_packages = {
    "openai": ">=1.0.0",
    "python-dotenv": ">=0.19.0"
}

for package, version in required_packages.items():
    try:
        pkg_version = pkg_resources.get_distribution(package).version
        log_message(f"Found {package} version {pkg_version}")
    except pkg_resources.DistributionNotFound:
        log_message(f"ERROR: Required package {package} not installed. Please run: pip install {package}{version}")
        sys.exit(1)

# Load environment variables from .env file in the script's directory
log_message("Loading environment variables...")
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
    log_message(f"Loaded .env file from: {env_path}")
else:
    log_message(f"Warning: No .env file found at {env_path}")
    load_dotenv()  # Try default locations

# --- OpenAI API Configuration ---
# Loads the API key from the .env file
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    log_message("Error: OPENAI_API_KEY not found in .env file or environment variables.")
    log_message("Please ensure a .env file exists in the script directory with OPENAI_API_KEY=your_key")
    sys.exit(1)
else:
    log_message("OpenAI API Key loaded successfully.")

client = OpenAI(api_key=api_key)
EXPECTED_MODEL = "gpt-4.1-mini"


# Function already defined above, removing duplicate

def get_plain_english_charge(charge_description):
    """
    Sends a charge description to OpenAI API and returns a plain English explanation.
    """
    # Check for empty charge first
    if not charge_description or charge_description.isspace():
        return "No specific charge provided"
        
    try:
        start_time = time.time()
        log_message(f"Calling OpenAI API with timeout of 30 seconds...")
        
        # Set a timeout for the API call
        response = client.chat.completions.create(
            model=EXPECTED_MODEL,
            messages=[
                {"role": "system", "content": "You are a legal expert hired by Law and Order. Your job is to receive criminal charges and charge descriptions and decide on a short summary of what the crime is (MAX: 50 characters) in plain English for the average person to understand. Never include any explanations, disclaimers, or text outside of the single String structure."},
                {"role": "user", "content": f"Explain this charge so viewers can understand, use a max of 50 characters to descript the charge: \"{charge_description}\""}
            ],
            temperature=0.1, # Adjust for creativity vs. factuality
            max_tokens=50,   # Adjust based on expected length
            timeout=30        # Add 30 second timeout
        )
        explanation = response.choices[0].message.content.strip()
        
        elapsed = time.time() - start_time
        log_message(f"API call completed in {elapsed:.2f} seconds")
        
        # Small delay to avoid rate limiting
        time.sleep(0.5)
        
        return explanation
    except Exception as e:
        log_message(f"Error calling OpenAI API for '{charge_description[:30]}...': {e}")
        return f"Error: Could not get explanation for '{charge_description[:50]}...'"

def peek_csv_file(file_path, num_lines=5):
    """
    Function to examine the first few lines of a CSV file to help with debugging
    """
    try:
        log_message(f"Examining first {num_lines} lines of {file_path}:")
        with open(file_path, 'r', encoding='utf-8') as f:
            for i in range(num_lines):
                line = f.readline().strip()
                if not line:
                    log_message(f"  Line {i+1}: <empty line>")
                    continue
                log_message(f"  Line {i+1}: {line[:100]}{'...' if len(line) > 100 else ''}")
                
            # Try to detect the delimiter
            f.seek(0)
            first_line = f.readline().strip()
            for delim in [',', ';', '\t', '|']:
                if delim in first_line:
                    count = first_line.count(delim)
                    log_message(f"  Potential delimiter '{delim}' found {count} times in header")
    except Exception as e:
        log_message(f"Error examining CSV file: {e}")

def process_mugshots(input_csv_path, output_csv_path, max_rows=None):
    """
    Reads mugshot data, gets AI explanations for charges, and writes to a new CSV.
    """
    processed_rows = []
    header = []
    
    log_message(f"Starting to process mugshots from: {input_csv_path}")
    log_message(f"Will save results to: {output_csv_path}")
    
    # First, peek at the file to examine structure
    peek_csv_file(input_csv_path)

    try:
        log_message(f"Attempting to open input file...")
        # Try multiple encodings if utf-8 fails
        encodings_to_try = ['utf-8', 'latin-1', 'cp1252']
        
        for encoding in encodings_to_try:
            try:
                with open(input_csv_path, mode='r', encoding=encoding, newline='') as infile:
                    # Try to read a small part to verify encoding works
                    sample = infile.read(1024)
                    log_message(f"Successfully opened file with {encoding} encoding")
                    break
            except UnicodeDecodeError:
                log_message(f"Failed to open with {encoding} encoding, trying next...")
        
        # Try with the working encoding
        with open(input_csv_path, mode='r', encoding=encoding, newline='') as infile:
            log_message(f"File opened successfully with {encoding} encoding. Loading CSV...")
            
            # First check if the file is empty
            if os.path.getsize(input_csv_path) == 0:
                log_message("Error: Input file is empty!")
                return
                
            # Try to detect the delimiter by examining the first line
            first_line = infile.readline().strip()
            infile.seek(0)  # Reset to start of file
            
            potential_delimiters = [',', ';', '\t', '|']
            delimiter = ','  # Default
            
            for delim in potential_delimiters:
                if delim in first_line:
                    delimiter = delim
                    log_message(f"Detected delimiter: '{delimiter}'")
                    break
            
            # Create CSV reader with detected delimiter
            reader = csv.DictReader(infile, delimiter=delimiter)
            header = reader.fieldnames
            
            # Debug header row
            log_message(f"Raw header: {first_line}")
            
            if not header:
                log_message(f"Error: Could not read header from {input_csv_path}")
                return

            print(f"CSV header found: {', '.join(header)}")
            
            if "Description" not in header:
                log_message(f"Error: 'Description' column not found in {input_csv_path}")
                return
            else:
                log_message(f"'Description' column found in CSV")

            processed_rows.append(header + ["AI_Description_Explanation"])
            log_message("Starting row processing...")
            
            # Instead of counting rows (which can be slow for large files),
            # we'll just track the current position
            log_message("Press Ctrl+C to abort if processing takes too long...")
            
            # Try to count rows for small files, skip for large ones
            file_size = os.path.getsize(input_csv_path)
            if file_size < 1024 * 1024:  # 1MB
                infile.seek(0)
                next(infile)  # Skip header
                row_count_estimate = sum(1 for _ in infile)
                log_message(f"File size: {file_size/1024:.1f}KB, Estimated rows: {row_count_estimate}")
                infile.seek(0)  # Reset file pointer
                next(infile)    # Skip header again
            else:
                log_message(f"Large file detected ({file_size/1024/1024:.1f}MB). Not counting rows.")
                
            row_count = 0
            max_rows_info = f"(limited to {max_rows} rows)" if max_rows else "(processing all rows)"
            log_message(f"Starting row processing {max_rows_info}")

            for i, row in enumerate(reader):
                row_count += 1
                
                # Stop processing if max_rows limit is reached
                if max_rows and row_count > max_rows:
                    log_message(f"Reached maximum row limit ({max_rows}). Stopping processing.")
                    break
                    
                log_message(f"\nProcessing row {row_count}...")
                start_row_time = time.time()
                
                # Ensure all header fields are present in the row, fill with empty string if not
                current_row_values = [row.get(col, '') for col in header]
                
                description_text = row.get("Description", "")
                desc_preview = description_text[:50] + ('...' if len(description_text) > 50 else '')
                log_message(f"Row {row_count} description: {desc_preview}")
                ai_explanations = []

                if description_text and not description_text.isspace():
                    individual_charges = description_text.split('|')
                    log_message(f"Found {len(individual_charges)} charges in this row")
                    
                    for j, charge in enumerate(individual_charges):
                        charge_cleaned = charge.strip()
                        if charge_cleaned: # Ensure charge is not empty after stripping
                            charge_preview = charge_cleaned[:30] + ('...' if len(charge_cleaned) > 30 else '')
                            log_message(f"  Processing charge {j+1}/{len(individual_charges)}: '{charge_preview}'")
                            
                            # Try to get AI explanation with timeout/retry
                            retry_count = 0
                            max_retries = 3
                            ai_explanation = None
                            
                            while retry_count < max_retries and ai_explanation is None:
                                try:
                                    ai_explanation = get_plain_english_charge(charge_cleaned)
                                except Exception as e:
                                    retry_count += 1
                                    log_message(f"  API error on attempt {retry_count}/{max_retries}: {e}")
                                    if retry_count < max_retries:
                                        log_message(f"  Retrying in 2 seconds...")
                                        time.sleep(2)
                                    else:
                                        ai_explanation = f"Error after {max_retries} attempts: Could not get explanation"
                            
                            if ai_explanation:
                                explanation_preview = ai_explanation[:30] + ('...' if len(ai_explanation) > 30 else '')
                                log_message(f"  API response received: {explanation_preview}")
                                ai_explanations.append(ai_explanation)
                        else:
                            log_message(f"  Charge {j+1} is empty after stripping")
                            ai_explanations.append("No specific charge provided") # Handle empty charge after split
                else:
                    log_message(f"  No description found for this row")
                    ai_explanations.append("No description provided")

                processed_rows.append(current_row_values + [" | ".join(ai_explanations)])
                
                row_time = time.time() - start_row_time
                log_message(f"Row {row_count} completed in {row_time:.2f} seconds.")
                
                # Save intermediate results every 10 rows
                if row_count % 10 == 0:
                    try:
                        temp_output = f"{output_csv_path}.partial"
                        log_message(f"Saving intermediate results to {temp_output}...")
                        with open(temp_output, mode='w', encoding='utf-8', newline='') as outfile:
                            writer = csv.writer(outfile)
                            writer.writerows(processed_rows)
                        log_message(f"Intermediate results saved successfully")
                    except Exception as e:
                        log_message(f"Error saving intermediate results: {e}")

    except FileNotFoundError:
        print(f"Error: Input file not found at {input_csv_path}")
        return
    except Exception as e:
        print(f"An error occurred during reading or processing: {e}")
        import traceback
        traceback.print_exc()  # Print full stack trace
        return

    try:
        print(f"Processing complete. Writing results to {output_csv_path}...")
        with open(output_csv_path, mode='w', encoding='utf-8', newline='') as outfile:
            writer = csv.writer(outfile)
            writer.writerows(processed_rows)
        print(f"Successfully processed data and saved to {output_csv_path}")
    except Exception as e:
        print(f"Error writing to output file {output_csv_path}: {e}")
        import traceback
        traceback.print_exc()  # Print full stack trace

if __name__ == "__main__":
    # Set up argument parsing
    parser = argparse.ArgumentParser(description='Process mugshot data with AI explanations.')
    parser.add_argument('--input', type=str, help='Input CSV file path')
    parser.add_argument('--output', type=str, help='Output CSV file path')
    parser.add_argument('--max-rows', type=int, help='Maximum number of rows to process (for testing)')
    parser.add_argument('--model', type=str, help=f'OpenAI model to use (default: {EXPECTED_MODEL})')
    
    args = parser.parse_args()
    
    # Assuming the script is in 'mug-matcher/mugshotscripts/'
    # and the CSV is also in 'mug-matcher/mugshotscripts/'
    input_file = args.input or "sorted_mugshots.csv"
    output_file = args.output or "mugshot_ai_v1.csv"
    
    # Use specified model if provided
    if args.model:
        EXPECTED_MODEL = args.model
        log_message(f"Using custom model: {EXPECTED_MODEL}")

    # For local execution, construct paths relative to the script's directory
    script_dir = os.path.dirname(__file__) # Gets the directory where the script is located
    
    # Handle absolute paths vs relative paths
    if os.path.isabs(input_file):
        input_csv_full_path = input_file
    else:
        input_csv_full_path = os.path.join(script_dir, input_file)
        
    if os.path.isabs(output_file):
        output_csv_full_path = output_file
    else:
        output_csv_full_path = os.path.join(script_dir, output_file)
    
    log_message(f"Input CSV: {input_csv_full_path}")
    log_message(f"Output CSV: {output_csv_full_path}")
    log_message("Starting processing...")
    
    # Check if the input file exists before proceeding
    if not os.path.exists(input_csv_full_path):
        log_message(f"Error: Input file '{input_csv_full_path}' does not exist!")
        sys.exit(1)
    
    # Ensure output directory exists
    output_dir = os.path.dirname(output_csv_full_path)
    if output_dir and not os.path.exists(output_dir):
        try:
            os.makedirs(output_dir)
            log_message(f"Created output directory: {output_dir}")
        except Exception as e:
            log_message(f"Error creating output directory: {e}")
            sys.exit(1)
        
    # Verify OpenAI model before processing
    try:
        log_message(f"Verifying OpenAI model '{EXPECTED_MODEL}'...")
        start_time = time.time()
        
        # Simple test call to verify the model exists and is accessible
        test_response = client.chat.completions.create(
            model=EXPECTED_MODEL,
            messages=[{"role": "user", "content": "Test"}],
            max_tokens=5,
            timeout=20  # Add timeout
        )
        
        elapsed = time.time() - start_time
        log_message(f"OpenAI model '{EXPECTED_MODEL}' verified successfully in {elapsed:.2f} seconds")
    except Exception as e:
        log_message(f"Error: Could not access OpenAI model '{EXPECTED_MODEL}'. Error: {e}")
        log_message("Please check your API key and model availability before proceeding.")
        sys.exit(1)
    
    # Handle potential Windows/WSL path issues
    try:
        max_rows = args.max_rows
        if max_rows:
            log_message(f"TEST MODE: Processing only {max_rows} rows for testing")
            
        log_message("Running process_mugshots function with the provided paths...")
        process_mugshots(input_csv_full_path, output_csv_full_path, max_rows)
        
        log_message("Processing completed successfully!")
        
    except KeyboardInterrupt:
        log_message("\nOperation interrupted by user. Saving partial results if available...")
        
        if 'processed_rows' in locals() and len(processed_rows) > 1:
            try:
                temp_output = f"{output_csv_full_path}.interrupted"
                with open(temp_output, mode='w', encoding='utf-8', newline='') as outfile:
                    writer = csv.writer(outfile)
                    writer.writerows(processed_rows)
                log_message(f"Partial results saved to {temp_output}")
            except Exception as e:
                log_message(f"Error saving partial results: {e}")
        
        log_message("Script terminated by user.")
    except Exception as e:
        log_message(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)