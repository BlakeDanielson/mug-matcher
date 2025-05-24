#!/usr/bin/env python3
"""
Script to check the matching results between sorted_mugshots.csv and master_fdc_analysis.csv
"""

import pandas as pd
from pathlib import Path

def check_matching_results():
    """Check what records matched and analyze potential improvements."""
    
    # Load the combined file
    combined_path = Path("data/combined_mugshots_fdc.csv")
    combined_df = pd.read_csv(combined_path, dtype=str)
    
    # Identify FDC columns
    fdc_cols = [col for col in combined_df.columns if col in [
        'DCNumber', 'BirthDate', 'InitialReceiptDate', 'CurrentFacility', 
        'CurrentCustody', 'CurrentReleaseDate', 'Aliases', 'CurrentPrisonSentenceHistory', 
        'Detainers', 'IncarcerationHistory', 'PriorPrisonHistory'
    ]]
    
    print(f"FDC columns found: {fdc_cols}")
    
    # Find matched and unmatched records
    matched = combined_df[combined_df[fdc_cols].notna().any(axis=1)]
    unmatched = combined_df[combined_df[fdc_cols].isna().all(axis=1)]
    
    print(f"\n=== MATCHING ANALYSIS ===")
    print(f"Total records: {len(combined_df)}")
    print(f"Matched records: {len(matched)}")
    print(f"Unmatched records: {len(unmatched)}")
    
    print(f"\n=== SAMPLE MATCHED RECORDS ===")
    if len(matched) > 0:
        display_cols = ['InmateID', 'Name'] + [col for col in ['DCNumber'] if col in matched.columns]
        print(matched[display_cols].head(10))
    else:
        print("No matched records found")
    
    print(f"\n=== SAMPLE UNMATCHED RECORDS ===")
    print(unmatched[['InmateID', 'Name']].head(10))
    
    # Load original files to analyze names for better matching
    print(f"\n=== NAME ANALYSIS ===")
    
    sorted_df = pd.read_csv("data/sorted_mugshots.csv", dtype=str)
    fdc_df = pd.read_csv("mugshotscripts/master_fdc_analysis.csv", dtype=str)
    
    print(f"Sample names from sorted mugshots:")
    print(sorted_df['Name'].head(10).tolist())
    
    print(f"\nSample names from FDC analysis:")
    print(fdc_df['Name'].head(10).tolist())
    
    # Check for potential partial matches
    print(f"\n=== POTENTIAL MATCHING IMPROVEMENTS ===")
    
    # Check if names need preprocessing (last name, first name format vs first last)
    sample_sorted_names = sorted_df['Name'].head(20).tolist()
    sample_fdc_names = fdc_df['Name'].head(20).tolist()
    
    print("First few sorted mugshot names:")
    for name in sample_sorted_names[:5]:
        print(f"  '{name}'")
    
    print("First few FDC analysis names:")  
    for name in sample_fdc_names[:5]:
        print(f"  '{name}'")

if __name__ == "__main__":
    check_matching_results() 