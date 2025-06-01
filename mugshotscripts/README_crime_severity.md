# Crime Severity Classifier

This script reads the `sorted_mugshots.csv` file, extracts the `Best_Crime` field from each row, and uses OpenAI to classify the severity of each crime as **High**, **Medium**, or **Low**.

## Features

- Reads CSV files with crime data
- Uses OpenAI GPT-4o-mini for cost-effective classification
- Classifies crimes into three severity levels:
  - **High**: Violent crimes, serious felonies, weapons, sexual offenses, major drug trafficking, armed robbery, murder, kidnapping, etc.
  - **Medium**: Property crimes, drug possession (significant amounts), burglary, theft, fraud (<$50k), non-violent felonies, etc.
  - **Low**: Minor offenses, misdemeanors, traffic violations, small drug possession, disorderly conduct, trespassing, etc.
- Supports batch processing with row range options
- Includes error handling and retry logic
- Provides detailed logging with timestamps

## Requirements

- Python 3.7+
- pandas
- openai
- python-dotenv
- setuptools

## Installation

1. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install required packages:
```bash
pip install pandas openai python-dotenv setuptools
```

3. Ensure you have an OpenAI API key in your `.env` file:
```
OPENAI_API_KEY=your_api_key_here
```

## Usage

### Basic Usage
```bash
# Process the entire file
python3 crime_severity_classifier.py

# Process with custom input/output files
python3 crime_severity_classifier.py --input ../data/sorted_mugshots.csv --output ../data/output_with_severity.csv
```

### Process Specific Row Ranges
```bash
# Process first 100 rows
python3 crime_severity_classifier.py --start-row 1 --end-row 100

# Process rows 500-1000
python3 crime_severity_classifier.py --start-row 500 --end-row 1000
```

### Use Different OpenAI Model
```bash
# Use GPT-4 instead of default gpt-4o-mini
python3 crime_severity_classifier.py --model gpt-4
```

## Command Line Options

- `--input, -i`: Input CSV file path (default: `../data/sorted_mugshots.csv`)
- `--output, -o`: Output CSV file path (default: `../data/sorted_mugshots_with_severity.csv`)
- `--model`: OpenAI model to use (default: `gpt-4o-mini`)
- `--start-row`: Start processing from this row number (1-based)
- `--end-row`: End processing at this row number (1-based, inclusive)

## Output

The script adds a new column called `Crime_Severity` to the CSV file with values:
- `High`
- `Medium` 
- `Low`
- `Unknown` (for rows with no crime data)
- `Error` (for API failures)

## Example Output

```
InmateID,Best_Crime,Crime_Severity
372500084,Trespassing on Critical Infrastructure | Repeat Petit Theft Offense,Medium
372500098,Trespassing on Critical Infrastructure,Medium
372500103,Trespassing on Occupied Property,Low
372500109,Carjacking with Armed Home Invasion | Trafficking Fake Credit Cards,High
372500112,Trespassing on Critical Infrastructure,Medium
```

## Performance Notes

- The script includes a 0.1-second delay between API calls to avoid rate limiting
- Uses gpt-4o-mini by default for cost efficiency
- Includes exponential backoff retry logic for failed API calls
- Processes approximately 600-1000 rows per hour depending on API response times

## Cost Estimation

Using gpt-4o-mini (default model):
- Input cost: ~$0.15 per 1M tokens
- Output cost: ~$0.60 per 1M tokens
- Estimated cost: ~$0.01-0.02 per 1000 crime classifications

## Error Handling

The script includes comprehensive error handling:
- Retries failed API calls up to 3 times with exponential backoff
- Validates API responses and defaults to "Medium" for unexpected responses
- Continues processing even if individual rows fail
- Logs all errors with timestamps for debugging 