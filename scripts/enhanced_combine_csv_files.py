#!/usr/bin/env python3
"""
Enhanced script to combine sorted_mugshots.csv and master_fdc_analysis.csv files.
Uses multiple matching strategies to improve match rates.
"""

import pandas as pd
import sys
from pathlib import Path
from fuzzywuzzy import fuzz
import re

def normalize_name(name):
    """Normalize name for better matching."""
    if pd.isna(name):
        return ""
    
    # Convert to uppercase and remove extra spaces
    name = str(name).upper().strip()
    
    # Remove common suffixes and prefixes
    name = re.sub(r'\s+(JR\.?|SR\.?|III|II|IV)$', '', name)
    
    # Remove middle initials for basic matching
    parts = name.split(', ')
    if len(parts) == 2:
        last, first = parts
        # Remove middle initials from first name
        first_parts = first.split()
        if len(first_parts) > 1:
            # Keep only first name, remove middle names/initials
            first = first_parts[0]
        name = f"{last}, {first}"
    
    return name

def get_name_variations(name):
    """Generate name variations for fuzzy matching."""
    if pd.isna(name):
        return []
    
    variations = [str(name).upper().strip()]
    
    # Add normalized version
    normalized = normalize_name(name)
    if normalized and normalized not in variations:
        variations.append(normalized)
    
    # If name is in "LAST, FIRST" format, try "FIRST LAST" format
    if ', ' in name:
        parts = name.split(', ')
        if len(parts) == 2:
            last, first = parts
            first_last = f"{first} {last}".strip()
            if first_last not in variations:
                variations.append(first_last)
    
    return variations

def fuzzy_match_names(name1, name2, threshold=80):
    """Check if two names match using fuzzy string matching."""
    if pd.isna(name1) or pd.isna(name2):
        return False
    
    variations1 = get_name_variations(name1)
    variations2 = get_name_variations(name2)
    
    for v1 in variations1:
        for v2 in variations2:
            if fuzz.ratio(v1, v2) >= threshold:
                return True
    
    return False

def enhanced_combine_csv_files():
    """
    Combine sorted_mugshots.csv and master_fdc_analysis.csv files using multiple matching strategies.
    """
    # Define file paths
    base_dir = Path(__file__).parent.parent
    sorted_mugshots_path = base_dir / "data" / "sorted_mugshots.csv"
    master_fdc_path = base_dir / "mugshotscripts" / "master_fdc_analysis.csv"
    output_path = base_dir / "data" / "enhanced_combined_mugshots_fdc.csv"
    
    print(f"Reading sorted mugshots from: {sorted_mugshots_path}")
    print(f"Reading master FDC analysis from: {master_fdc_path}")
    
    try:
        # Read the sorted mugshots CSV (this will be our base structure)
        sorted_df = pd.read_csv(sorted_mugshots_path, dtype=str)
        print(f"Loaded sorted mugshots: {len(sorted_df)} rows, {len(sorted_df.columns)} columns")
        
        # Read the master FDC analysis CSV  
        fdc_df = pd.read_csv(master_fdc_path, dtype=str)
        print(f"Loaded master FDC analysis: {len(fdc_df)} rows, {len(fdc_df.columns)} columns")
        
        # Create normalized name columns for better matching
        sorted_df['normalized_name'] = sorted_df['Name'].apply(normalize_name)
        fdc_df['normalized_name'] = fdc_df['Name'].apply(normalize_name)
        
        # Strategy 1: Exact name match
        print("Strategy 1: Exact name matching...")
        exact_matches = pd.merge(
            sorted_df, 
            fdc_df, 
            left_on='normalized_name',
            right_on='normalized_name',
            how='left',
            suffixes=('', '_fdc')
        )
        exact_match_count = len(exact_matches[exact_matches['Name_fdc'].notna()])
        print(f"Exact matches found: {exact_match_count}")
        
        # Strategy 2: Fuzzy name matching for remaining unmatched records
        print("Strategy 2: Fuzzy name matching for remaining records...")
        
        # Get unmatched records from exact matching
        unmatched_exact = exact_matches[exact_matches['Name_fdc'].isna()].copy()
        matched_exact = exact_matches[exact_matches['Name_fdc'].notna()].copy()
        
        fuzzy_matches = []
        
        if len(unmatched_exact) > 0:
            print(f"Attempting fuzzy matching for {len(unmatched_exact)} unmatched records...")
            
            for idx, row in unmatched_exact.iterrows():
                sorted_name = row['Name']
                best_match = None
                best_score = 0
                
                # Try fuzzy matching against all FDC names
                for _, fdc_row in fdc_df.iterrows():
                    fdc_name = fdc_row['Name']
                    if fuzzy_match_names(sorted_name, fdc_name, threshold=85):
                        # Calculate best score for this match
                        score = max([fuzz.ratio(v1, v2) 
                                   for v1 in get_name_variations(sorted_name)
                                   for v2 in get_name_variations(fdc_name)])
                        if score > best_score:
                            best_score = score
                            best_match = fdc_row
                
                if best_match is not None:
                    # Create matched row
                    matched_row = row.copy()
                    # Add FDC data with _fdc suffix
                    for col in fdc_df.columns:
                        if col not in sorted_df.columns:
                            matched_row[col] = best_match[col]
                        else:
                            matched_row[f"{col}_fdc"] = best_match[col]
                    
                    fuzzy_matches.append(matched_row)
                    print(f"Fuzzy match found: '{sorted_name}' -> '{best_match['Name']}' (score: {best_score})")
                else:
                    # Keep unmatched record
                    fuzzy_matches.append(row)
        
        fuzzy_match_count = len([m for m in fuzzy_matches if pd.notna(m.get('Name_fdc', m.get('DCNumber')))])
        print(f"Additional fuzzy matches found: {fuzzy_match_count}")
        
        # Combine all results
        if fuzzy_matches:
            fuzzy_df = pd.DataFrame(fuzzy_matches)
            combined_df = pd.concat([matched_exact, fuzzy_df], ignore_index=True)
        else:
            combined_df = exact_matches
        
        # Clean up temporary columns
        if 'normalized_name' in combined_df.columns:
            combined_df = combined_df.drop('normalized_name', axis=1)
        
        # Reorder columns to maintain sorted_mugshots order first
        sorted_columns = list(sorted_df.columns)
        if 'normalized_name' in sorted_columns:
            sorted_columns.remove('normalized_name')
            
        fdc_only_columns = [col for col in combined_df.columns if col not in sorted_columns]
        final_column_order = sorted_columns + fdc_only_columns
        combined_df = combined_df[final_column_order]
        
        # Save the combined file
        combined_df.to_csv(output_path, index=False)
        print(f"Enhanced combined file saved to: {output_path}")
        
        # Print summary statistics
        print("\n=== ENHANCED SUMMARY ===")
        print(f"Original sorted mugshots records: {len(sorted_df)}")
        print(f"Master FDC analysis records: {len(fdc_df)}")
        print(f"Combined records: {len(combined_df)}")
        print(f"Total columns in combined file: {len(combined_df.columns)}")
        
        # Count total matches
        fdc_indicator_cols = [col for col in combined_df.columns if 'DCNumber' in col or col.endswith('_fdc')]
        total_matched = len(combined_df[combined_df[fdc_indicator_cols].notna().any(axis=1)])
        
        print(f"Total matched records: {total_matched}")
        print(f"Total unmatched records: {len(combined_df) - total_matched}")
        print(f"Match rate: {total_matched/len(combined_df)*100:.1f}%")
        
        return True
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main function to run the enhanced combination process."""
    print("Starting enhanced CSV file combination process...")
    
    # Check if fuzzywuzzy is available
    try:
        from fuzzywuzzy import fuzz
    except ImportError:
        print("Installing fuzzywuzzy for fuzzy string matching...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "fuzzywuzzy", "python-levenshtein"])
        from fuzzywuzzy import fuzz
    
    success = enhanced_combine_csv_files()
    
    if success:
        print("✅ Enhanced CSV files combined successfully!")
        sys.exit(0)
    else:
        print("❌ Failed to combine CSV files")
        sys.exit(1)

if __name__ == "__main__":
    main() 