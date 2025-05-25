#!/usr/bin/env python3
"""
Extract Prison Sentence Terms from Mugshots CSV Data
This script parses the sorted_mugshots.csv file and extracts sentence length information
from various fields, particularly CurrentPrisonSentenceHistory.
"""

import csv
import re
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from collections import Counter

def extract_sentence_terms(text: str) -> List[str]:
    """
    Extract sentence terms from text using regex patterns.
    Returns list of standardized sentence strings.
    """
    if not text or text.strip() == "":
        return []
    
    sentences = []
    text = text.lower()
    
    # Pattern for years (e.g., "5 years", "10-year", "25 year sentence")
    year_patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:-\s*)?year[s]?',
        r'(\d+(?:\.\d+)?)\s*(?:-\s*)?yr[s]?',
        r'(\d+(?:\.\d+)?)\s*(?:-\s*)?year[s]?\s+(?:sentence|term|prison)',
    ]
    
    # Pattern for months (e.g., "6 months", "18-month")
    month_patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:-\s*)?month[s]?',
        r'(\d+(?:\.\d+)?)\s*(?:-\s*)?mo[s]?',
        r'(\d+(?:\.\d+)?)\s*(?:-\s*)?month[s]?\s+(?:sentence|term|prison)',
    ]
    
    # Pattern for days (e.g., "90 days", "365 day")
    day_patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:-\s*)?day[s]?',
        r'(\d+(?:\.\d+)?)\s*(?:-\s*)?day[s]?\s+(?:sentence|term|prison)',
    ]
    
    # Life sentences
    life_patterns = [
        r'life\s+(?:sentence|imprisonment|prison|term)',
        r'life\s+without\s+parole',
        r'life\s+w/?o\s+parole',
        r'\blife\b',
        r'lwop',
        r'natural\s+life'
    ]
    
    # Death sentences
    death_patterns = [
        r'death\s+(?:sentence|penalty)',
        r'death\s+row',
        r'capital\s+punishment',
        r'execution'
    ]
    
    # Extract years
    for pattern in year_patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            try:
                years = float(match)
                if years > 0 and years <= 200:  # Reasonable bounds
                    sentences.append(f"{int(years) if years.is_integer() else years} years")
            except ValueError:
                continue
    
    # Extract months
    for pattern in month_patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            try:
                months = float(match)
                if months > 0 and months <= 1200:  # Reasonable bounds (100 years in months)
                    sentences.append(f"{int(months) if months.is_integer() else months} months")
            except ValueError:
                continue
    
    # Extract days
    for pattern in day_patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            try:
                days = float(match)
                if days > 0 and days <= 36500:  # Reasonable bounds (100 years in days)
                    sentences.append(f"{int(days) if days.is_integer() else days} days")
            except ValueError:
                continue
    
    # Check for life sentences
    for pattern in life_patterns:
        if re.search(pattern, text):
            sentences.append("Life")
            break
    
    # Check for death sentences
    for pattern in death_patterns:
        if re.search(pattern, text):
            sentences.append("Death")
            break
    
    return list(set(sentences))  # Remove duplicates

def standardize_sentence(sentence: str) -> Tuple[Optional[float], str]:
    """
    Standardize sentence to years as float and return both numeric and display format.
    Returns (years_as_float, display_string)
    """
    if not sentence:
        return None, ""
    
    sentence = sentence.strip().lower()
    
    if sentence == "life":
        return 99.0, "Life"
    
    if sentence == "death":
        return 100.0, "Death"
    
    # Parse years
    if "year" in sentence:
        match = re.search(r'(\d+(?:\.\d+)?)', sentence)
        if match:
            years = float(match.group(1))
            return years, f"{int(years) if years.is_integer() else years} years"
    
    # Parse months (convert to years)
    if "month" in sentence:
        match = re.search(r'(\d+(?:\.\d+)?)', sentence)
        if match:
            months = float(match.group(1))
            years = months / 12
            if months < 12:
                return years, f"{int(months) if months.is_integer() else months} months"
            else:
                return years, f"{int(years) if years.is_integer() else round(years, 1)} years"
    
    # Parse days (convert to years)
    if "day" in sentence:
        match = re.search(r'(\d+(?:\.\d+)?)', sentence)
        if match:
            days = float(match.group(1))
            years = days / 365
            if days < 365:
                return years, f"{int(days) if days.is_integer() else days} days"
            else:
                return years, f"{round(years, 1)} years"
    
    return None, sentence

def process_csv_file(csv_path: Path) -> List[Dict]:
    """
    Process the CSV file and extract sentence information.
    """
    results = []
    sentence_counter = Counter()
    
    print(f"Processing CSV file: {csv_path}")
    
    with open(csv_path, 'r', encoding='utf-8', errors='ignore') as file:
        reader = csv.DictReader(file)
        
        for i, row in enumerate(reader, 1):
            if i % 1000 == 0:
                print(f"Processed {i} rows...")
            
            inmate_id = row.get('InmateID', '')
            name = row.get('Name', '')
            
            # Extract sentences from various fields
            sentence_sources = {
                'CurrentPrisonSentenceHistory': row.get('CurrentPrisonSentenceHistory', ''),
                'PriorPrisonHistory': row.get('PriorPrisonHistory', ''),
                'IncarcerationHistory': row.get('IncarcerationHistory', ''),
                'Detainers': row.get('Detainers', ''),
                'Description': row.get('Description', ''),
            }
            
            all_sentences = []
            extraction_details = {}
            
            for source, text in sentence_sources.items():
                if text and text.strip():
                    sentences = extract_sentence_terms(text)
                    if sentences:
                        all_sentences.extend(sentences)
                        extraction_details[source] = sentences
                        for sentence in sentences:
                            sentence_counter[sentence] += 1
            
            if all_sentences:
                # Pick the most severe/longest sentence
                standardized_sentences = []
                for sentence in all_sentences:
                    years, display = standardize_sentence(sentence)
                    if years is not None:
                        standardized_sentences.append((years, display, sentence))
                
                if standardized_sentences:
                    # Sort by severity (highest years first)
                    standardized_sentences.sort(key=lambda x: x[0], reverse=True)
                    best_sentence = standardized_sentences[0]
                    
                    results.append({
                        'InmateID': inmate_id,
                        'Name': name,
                        'SentenceYears': best_sentence[0],
                        'SentenceDisplay': best_sentence[1],
                        'OriginalSentence': best_sentence[2],
                        'AllSentences': list(set(all_sentences)),
                        'ExtractionDetails': extraction_details,
                        'MugshotURL': row.get('MugshotURL', ''),
                        'BestCrime': row.get('Best_Crime', ''),
                    })
    
    print(f"\nTotal inmates processed: {i}")
    print(f"Inmates with sentence data: {len(results)}")
    print(f"Extraction rate: {len(results)/i*100:.1f}%")
    
    # Print most common sentences
    print(f"\nMost common sentences found:")
    for sentence, count in sentence_counter.most_common(20):
        print(f"  {sentence}: {count}")
    
    return results

def save_results(results: List[Dict], output_dir: Path):
    """
    Save the extracted sentence data in multiple formats.
    """
    output_dir.mkdir(exist_ok=True)
    
    # Save as JSON
    json_path = output_dir / 'extracted_sentences.json'
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"Saved JSON data to: {json_path}")
    
    # Save as CSV
    csv_path = output_dir / 'extracted_sentences.csv'
    if results:
        fieldnames = [
            'InmateID', 'Name', 'SentenceYears', 'SentenceDisplay', 
            'OriginalSentence', 'MugshotURL', 'BestCrime'
        ]
        
        with open(csv_path, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            
            for result in results:
                # Flatten the result for CSV
                csv_row = {key: result.get(key, '') for key in fieldnames}
                writer.writerow(csv_row)
        
        print(f"Saved CSV data to: {csv_path}")
    
    # Save summary statistics
    summary_path = output_dir / 'sentence_extraction_summary.txt'
    with open(summary_path, 'w', encoding='utf-8') as f:
        f.write("Sentence Extraction Summary\n")
        f.write("=" * 30 + "\n\n")
        f.write(f"Total inmates with sentences: {len(results)}\n\n")
        
        # Sentence length distribution
        sentence_lengths = [r['SentenceYears'] for r in results if r['SentenceYears'] is not None]
        if sentence_lengths:
            f.write("Sentence Length Distribution:\n")
            f.write(f"  Average: {sum(sentence_lengths)/len(sentence_lengths):.1f} years\n")
            f.write(f"  Median: {sorted(sentence_lengths)[len(sentence_lengths)//2]:.1f} years\n")
            f.write(f"  Range: {min(sentence_lengths):.1f} - {max(sentence_lengths):.1f} years\n\n")
        
        # Sentence type breakdown
        sentence_types = Counter()
        for result in results:
            display = result.get('SentenceDisplay', '')
            if 'Life' in display:
                sentence_types['Life'] += 1
            elif 'Death' in display:
                sentence_types['Death'] += 1
            elif 'year' in display:
                sentence_types['Years'] += 1
            elif 'month' in display:
                sentence_types['Months'] += 1
            elif 'day' in display:
                sentence_types['Days'] += 1
        
        f.write("Sentence Type Breakdown:\n")
        for sentence_type, count in sentence_types.most_common():
            f.write(f"  {sentence_type}: {count}\n")
    
    print(f"Saved summary to: {summary_path}")

def main():
    """
    Main function to run the sentence extraction.
    """
    print("Prison Sentence Term Extractor")
    print("=" * 40)
    
    # Paths
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    csv_path = project_dir / 'data' / 'sorted_mugshots.csv'
    output_dir = project_dir / 'data' / 'extracted_sentences'
    
    if not csv_path.exists():
        print(f"Error: CSV file not found at {csv_path}")
        return
    
    # Process the CSV file
    results = process_csv_file(csv_path)
    
    # Save results
    if results:
        save_results(results, output_dir)
        print(f"\n✅ Successfully extracted sentence data for {len(results)} inmates")
        print(f"📁 Output saved to: {output_dir}")
    else:
        print("❌ No sentence data could be extracted")

if __name__ == "__main__":
    main() 