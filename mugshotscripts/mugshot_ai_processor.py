import csv
import os
import openai # You'll need to install this: pip install openai
from dotenv import load_dotenv

# Load environment variables from .env file in the script's directory
script_dir = os.path.dirname(__file__)
dotenv_path = os.path.join(script_dir, '.env')
load_dotenv(dotenv_path=dotenv_path)

# --- OpenAI API Configuration ---
# Loads the API key from the .env file
openai.api_key = os.getenv('OPENAI_API_KEY')
EXPECTED_MODEL = "gpt-4.1-mini" # Or your desired model

if not openai.api_key:
    print("Error: OPENAI_API_KEY not found in .env file or environment variables.")
    print("Please ensure a .env file exists in the script directory with OPENAI_API_KEY=your_key")
    # Optionally exit if the key is crucial
    # exit(1)
else:
    print("OpenAI API Key loaded successfully.")


def get_plain_english_charge(charge_description):
    """
    Sends a charge description to OpenAI API and returns a plain English explanation.
    This is a placeholder function. You need to implement the actual API call.
    """
    # Placeholder: Replace with actual OpenAI API call
    # try:
    #     response = openai.ChatCompletion.create(
    #         model=EXPECTED_MODEL,
    #         messages=[
    #             {"role": "system", "content": "You are a helpful assistant that explains legal charge descriptions in plain English for the average person to understand."},
    #             {"role": "user", "content": f"Explain this charge in plain English: \"{charge_description}\""}
    #         ],
    #         temperature=0.5, # Adjust for creativity vs. factuality
    #         max_tokens=100    # Adjust based on expected length
    #     )
    #     explanation = response.choices[0].message.content.strip()
    #     return explanation
    # except Exception as e:
    #     print(f"Error calling OpenAI API for '{charge_description}': {e}")
    #     return "Error: Could not get explanation"

    # For now, returning a simple transformation for testing without API calls
    if not charge_description or charge_description.isspace():
        return "No specific charge provided"
    return f"Plain English for: {charge_description.strip().capitalize()}"

def process_mugshots(input_csv_path, output_csv_path):
    """
    Reads mugshot data, gets AI explanations for charges, and writes to a new CSV.
    """
    processed_rows = []
    header = []

    try:
        with open(input_csv_path, mode='r', encoding='utf-8', newline='') as infile:
            reader = csv.DictReader(infile)
            header = reader.fieldnames
            if not header:
                print(f"Error: Could not read header from {input_csv_path}")
                return

            if "Description" not in header:
                print(f"Error: 'Description' column not found in {input_csv_path}")
                return

            processed_rows.append(header + ["AI_Description_Explanation"])

            for i, row in enumerate(reader):
                # Ensure all header fields are present in the row, fill with empty string if not
                current_row_values = [row.get(col, '') for col in header]
                
                description_text = row.get("Description", "")
                ai_explanations = []

                if description_text and not description_text.isspace():
                    individual_charges = description_text.split('|')
                    for charge in individual_charges:
                        charge_cleaned = charge.strip()
                        if charge_cleaned: # Ensure charge is not empty after stripping
                            # print(f"Row {i+2}: Processing charge: '{charge_cleaned}'") # For debugging
                            ai_explanation = get_plain_english_charge(charge_cleaned)
                            ai_explanations.append(ai_explanation)
                        else:
                            ai_explanations.append("No specific charge provided") # Handle empty charge after split
                else:
                    ai_explanations.append("No description provided")

                processed_rows.append(current_row_values + [" | ".join(ai_explanations)])
                if (i + 1) % 50 == 0:
                    print(f"Processed {i + 1} rows...")

    except FileNotFoundError:
        print(f"Error: Input file not found at {input_csv_path}")
        return
    except Exception as e:
        print(f"An error occurred during reading or processing: {e}")
        return

    try:
        with open(output_csv_path, mode='w', encoding='utf-8', newline='') as outfile:
            writer = csv.writer(outfile)
            writer.writerows(processed_rows)
        print(f"Successfully processed data and saved to {output_csv_path}")
    except Exception as e:
        print(f"Error writing to output file {output_csv_path}: {e}")

if __name__ == "__main__":
    # Assuming the script is in 'mug-matcher/mugshotscripts/'
    # and the CSV is also in 'mug-matcher/mugshotscripts/'
    input_file = "sorted_mugshots.csv"
    output_file = "mugshot_ai_v1.csv"

    # For local execution, construct paths relative to the script's directory
    script_dir = os.path.dirname(__file__) # Gets the directory where the script is located
    input_csv_full_path = os.path.join(script_dir, input_file)
    output_csv_full_path = os.path.join(script_dir, output_file)
    
    print(f"Input CSV: {input_csv_full_path}")
    print(f"Output CSV: {output_csv_full_path}")

    process_mugshots(input_csv_full_path, output_csv_full_path)

    print("\n--- IMPORTANT ---")
    print("1. Make sure you have the 'openai' and 'python-dotenv' libraries installed (`pip install openai python-dotenv`).")
    print("2. Ensure the .env file in the script's directory contains your OPENAI_API_KEY.")
    print("3. Uncomment the actual OpenAI API call block within the `get_plain_english_charge` function.")
    print("4. The current `get_plain_english_charge` function is a placeholder and does NOT call OpenAI.")
    print("--- --- ---")