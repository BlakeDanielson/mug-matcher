#!/usr/bin/env python3
"""
Crime Severity Classifier Script

This script reads the sorted_mugshots.csv file, extracts the Best_Crime field,
and uses OpenAI to classify the severity of each crime as High, Medium, or Low.
"""

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
DEFAULT_MODEL = "gpt-4o-mini"  # Using gpt-4o-mini as it's cost-effective for classification
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
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
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
def call_openai_api(messages, max_tokens=10, temperature=0.1, timeout=30):
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
            if "RateLimitError" in str(e) or "APIConnectionError" in str(e) or "Timeout" in str(e) or "APIError" in str(e) or "InternalServerError" in str(e):
                if attempt < retries - 1:
                    sleep_time = (2 ** attempt) + (0.5 * attempt)  # Exponential backoff with jitter
                    log_message(f"Retrying in {sleep_time:.2f} seconds...")
                    time.sleep(sleep_time)
                else:
                    log_message("Max retries reached for API call. Returning error.")
                    return f"Error: API call failed after {retries} attempts due to: {type(e).__name__}."
            else:  # Non-retryable error
                log_message(f"Non-retryable API error: {type(e).__name__}. Returning error.")
                return f"Error: API call failed due to: {type(e).__name__}."
    return f"Error: API call failed after {retries} attempts."

# --- Crime Severity Classification Function ---
def classify_crime_severity(best_crime):
    """
    Classifies the severity of a crime description as High, Medium, or Low.
    """
    if not best_crime or pd.isna(best_crime) or str(best_crime).strip() == "":
        log_message("  No crime description provided.")
        return "Unknown"

    system_prompt = (
        "You are a criminal justice expert tasked with classifying crime severity. "
        "You will be given a crime description and must classify it as exactly one of these three levels:\n\n"
        "HIGH: Violent crimes, serious felonies, crimes involving weapons, sexual offenses, major drug trafficking, "
        "armed robbery, murder, kidnapping, aggravated assault, domestic violence with weapons, major fraud (>$50k), "
        "crimes against children, human trafficking, arson with injury risk.\n\n"
        "MEDIUM: Property crimes, drug possession (significant amounts), burglary, theft, fraud (<$50k), "
        "non-violent felonies, DUI, stalking, simple assault, probation violations for serious crimes, "
        "identity theft, cybercrime.\n\n"
        "LOW: Minor offenses, misdemeanors, traffic violations, small drug possession, disorderly conduct, "
        "trespassing, minor theft, failure to appear, probation violations for minor crimes, public intoxication.\n\n"
        "Respond with ONLY one word: High, Medium, or Low. Do not include any explanation or additional text."
    )

    user_prompt = f"Classify the severity of this crime: {best_crime}"

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    classification = call_openai_api(messages, max_tokens=10, temperature=0.1)

    if classification.startswith("Error:"):
        log_message(f"  API call failed for crime severity classification.")
        return "Error"
    
    # Clean up the response and validate
    classification = classification.strip().title()
    if classification in ["High", "Medium", "Low"]:
        return classification
    else:
        log_message(f"  Unexpected classification response: {classification}. Defaulting to Medium.")
        return "Medium"

# --- Main Processing Function ---
def process_crime_severity(input_file, output_file, start_row=None, end_row=None):
    """
    Processes the CSV file to add crime severity classifications.
    """
    log_message(f"Reading CSV file: {input_file}")
    
    try:
        df = pd.read_csv(input_file)
        log_message(f"Successfully loaded {len(df)} rows from CSV.")
    except Exception as e:
        log_message(f"ERROR: Could not read CSV file: {e}")
        sys.exit(1)

    # Check if Best_Crime column exists
    if 'Best_Crime' not in df.columns:
        log_message("ERROR: 'Best_Crime' column not found in CSV file.")
        log_message(f"Available columns: {list(df.columns)}")
        sys.exit(1)

    # Add severity column
    if 'Crime_Severity' not in df.columns:
        df['Crime_Severity'] = None
        log_message("Added 'Crime_Severity' column to DataFrame.")

    # Determine processing range
    if start_row is not None:
        start_idx = max(0, start_row - 1)  # Convert to 0-based index
    else:
        start_idx = 0

    if end_row is not None:
        end_idx = min(len(df), end_row)  # Convert to 0-based index
    else:
        end_idx = len(df)

    total_to_process = end_idx - start_idx
    log_message(f"Processing rows {start_idx + 1} to {end_idx} ({total_to_process} total rows)...")

    # Process each row
    for index in range(start_idx, end_idx):
        row = df.iloc[index]
        log_message(f"Processing row {index + 1}/{len(df)}, InmateID: {row.get('InmateID', 'N/A')}")
        
        best_crime = row.get('Best_Crime', '')
        
        if pd.isna(best_crime) or str(best_crime).strip() == "":
            log_message(f"  No Best_Crime data for row {index + 1}. Skipping.")
            df.at[index, 'Crime_Severity'] = "Unknown"
            continue

        log_message(f"  Crime: {best_crime}")
        severity = classify_crime_severity(best_crime)
        df.at[index, 'Crime_Severity'] = severity
        log_message(f"  Classified as: {severity}")

        # Add a small delay to avoid rate limiting
        time.sleep(0.1)

    # Save the updated DataFrame
    log_message(f"Saving results to: {output_file}")
    try:
        df.to_csv(output_file, index=False)
        log_message(f"Successfully saved {len(df)} rows to {output_file}")
    except Exception as e:
        log_message(f"ERROR: Could not save CSV file: {e}")
        sys.exit(1)

    # Print summary statistics
    severity_counts = df['Crime_Severity'].value_counts()
    log_message("Crime Severity Distribution:")
    for severity, count in severity_counts.items():
        log_message(f"  {severity}: {count}")

def main():
    """Main function to handle command line arguments and execute the script."""
    parser = argparse.ArgumentParser(
        description='Classify crime severity from Best_Crime field in sorted_mugshots.csv using OpenAI.'
    )
    parser.add_argument('--input', '-i', type=str, 
                       default='../data/sorted_mugshots.csv',
                       help='Input CSV file path. Default: ../data/sorted_mugshots.csv')
    parser.add_argument('--output', '-o', type=str, 
                       default='../data/sorted_mugshots_with_severity.csv',
                       help='Output CSV file path. Default: ../data/sorted_mugshots_with_severity.csv')
    parser.add_argument('--model', type=str, default=DEFAULT_MODEL, 
                       help=f'OpenAI model to use for classification. Default: {DEFAULT_MODEL}')
    parser.add_argument('--start-row', type=int, 
                       help='Start processing from this row number (1-based)')
    parser.add_argument('--end-row', type=int, 
                       help='End processing at this row number (1-based, inclusive)')

    args = parser.parse_args()

    # Set global model
    global current_model_global
    current_model_global = args.model

    # Check required packages
    check_required_packages()
    
    # Initialize OpenAI client
    initialize_openai_client()

    log_message("=== Crime Severity Classification Script ===")
    log_message(f"Input file: {args.input}")
    log_message(f"Output file: {args.output}")
    log_message(f"Using OpenAI model: {current_model_global}")
    
    if args.start_row:
        log_message(f"Start row: {args.start_row}")
    if args.end_row:
        log_message(f"End row: {args.end_row}")

    # Process the file
    process_crime_severity(args.input, args.output, args.start_row, args.end_row)
    
    log_message("=== Script completed successfully ===")

if __name__ == "__main__":
    main() 