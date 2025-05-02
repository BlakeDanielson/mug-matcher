import pandas as pd
from openai import OpenAI
import os
import csv
from dotenv import load_dotenv
import time

# Load environment variables from .env file
load_dotenv()

# Set up OpenAI API key
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Function to reword charges into plain language
def reword_charges(row):
    # Combine all charge information
    charges = f"Statute: {row['Statute']}, Description: {row['Description']}"
    
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that rewrites legal charges into plain language. For example: 'VIOL OF PROB - FEL' should be rewritten as 'Violation Of Parole (Felony)'."},
                {"role": "user", "content": f"Rewrite these charges into plain language that anyone can understand: {charges}"}
            ],
            max_tokens=250
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        print(f"Error rewording charges for inmate {row['Name']}: {str(e)}")
        return f"Error: {str(e)}"

# Function to identify the most interesting charge
def identify_interesting_charge(plain_language_charges):
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that analyzes criminal charges. Identify the most interesting, unusual, or serious charge from a list."},
                {"role": "user", "content": f"From these reworded charges, identify the single most interesting, unusual, or serious charge: {plain_language_charges}"}
            ],
            max_tokens=150
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        print(f"Error identifying interesting charge: {str(e)}")
        return f"Error: {str(e)}"

# Main function
def main():
    try:
        # Try looking for the file in multiple locations
        file_paths = [
            'sorted_mugshots.csv',  
            'mug-matcher/mugshotscripts/sorted_mugshots.csv',
            '../sorted_mugshots.csv',
            os.path.join(os.path.dirname(__file__), 'sorted_mugshots.csv')
        ]
        
        df = None
        for path in file_paths:
            try:
                print(f"Trying to open file: {path}")
                # Use error_bad_lines=False to skip problematic rows
                df = pd.read_csv(path, quoting=csv.QUOTE_ALL, on_bad_lines='skip')
                print(f"Successfully opened: {path}")
                break
            except FileNotFoundError:
                continue
            except Exception as e:
                print(f"Error with file {path}: {str(e)}")
        
        if df is None:
            raise FileNotFoundError("Could not find or open the CSV file in any of the attempted locations")
            
        # Create a progress counter
        total_rows = len(df)
        print(f"Processing {total_rows} inmates...")
        
        # Create empty columns for the results
        df['Plain_Language_Charges'] = None
        df['Most_Interesting_Charge'] = None
        
        # Process in batches to avoid rate limits
        batch_size = 10
        for i in range(0, len(df), batch_size):
            batch = df.iloc[i:i+batch_size]
            
            # Process each row in the batch
            for idx, row in batch.iterrows():
                print(f"Processing inmate {idx+1}/{total_rows}: {row['Name']}")
                
                # Step 1: Reword all charges
                plain_language = reword_charges(row)
                df.loc[idx, 'Plain_Language_Charges'] = plain_language
                
                # Step 2: Identify most interesting charge
                if not plain_language.startswith("Error:"):
                    most_interesting = identify_interesting_charge(plain_language)
                    df.loc[idx, 'Most_Interesting_Charge'] = most_interesting
                else:
                    df.loc[idx, 'Most_Interesting_Charge'] = "Could not analyze due to error in rewording"
                
                # Small delay to respect rate limits
                time.sleep(1.5)
            
            # Save progress after each batch
            df.to_csv('enhanced_mugshots.csv', index=False, quoting=csv.QUOTE_ALL)
            print(f"Saved progress through inmate {min(i+batch_size, total_rows)}/{total_rows}")
        
        print("Processing complete! Results saved to enhanced_mugshots.csv")
    
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()