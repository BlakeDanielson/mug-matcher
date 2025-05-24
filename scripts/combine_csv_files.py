#!/usr/bin/env python3
"""
Script to combine sorted_mugshots.csv and master_fdc_analysis.csv files.
Maintains the header row and order as sorted_mugshots.csv.
"""

import pandas as pd
import sys
from pathlib import Path

def combine_csv_files():
    """
    Combine sorted_mugshots.csv and master_fdc_analysis.csv files.
    """
    # Define file paths
    base_dir = Path(__file__).parent.parent
    sorted_mugshots_path = base_dir / "data" / "sorted_mugshots.csv"
    master_fdc_path = base_dir / "mugshotscripts" / "master_fdc_analysis.csv"
    output_path = base_dir / "data" / "combined_mugshots_fdc.csv"
    
    print(f"Reading sorted mugshots from: {sorted_mugshots_path}")
    print(f"Reading master FDC analysis from: {master_fdc_path}")
    
    try:
        # Read the sorted mugshots CSV (this will be our base structure)
        sorted_df = pd.read_csv(sorted_mugshots_path, dtype=str)
        print(f"Loaded sorted mugshots: {len(sorted_df)} rows, {len(sorted_df.columns)} columns")
        print(f"Sorted mugshots columns: {list(sorted_df.columns)}")
        
        # Read the master FDC analysis CSV  
        fdc_df = pd.read_csv(master_fdc_path, dtype=str)
        print(f"Loaded master FDC analysis: {len(fdc_df)} rows, {len(fdc_df.columns)} columns")
        print(f"FDC analysis columns: {list(fdc_df.columns)}")
        
        # Find common columns for merging (likely InmateID or similar)
        common_cols = set(sorted_df.columns) & set(fdc_df.columns)
        print(f"Common columns found: {common_cols}")
        
        # Use InmateID as the merge key if available, otherwise try other common identifiers
        merge_key = None
        potential_keys = ['InmateID', 'ID', 'id', 'Name', 'name']
        
        for key in potential_keys:
            if key in common_cols:
                merge_key = key
                break
                
        if not merge_key:
            print("ERROR: No suitable merge key found between the files")
            print("Available columns in sorted mugshots:", list(sorted_df.columns))
            print("Available columns in FDC analysis:", list(fdc_df.columns))
            return False
            
        print(f"Using merge key: {merge_key}")
        
        # Perform the merge, keeping all records from sorted_mugshots (left join)
        # This maintains the order and structure of sorted_mugshots.csv
        combined_df = pd.merge(
            sorted_df, 
            fdc_df, 
            on=merge_key, 
            how='left',
            suffixes=('', '_fdc')
        )
        
        print(f"Combined dataset: {len(combined_df)} rows, {len(combined_df.columns)} columns")
        
        # Reorder columns to maintain sorted_mugshots order first, then add FDC columns
        sorted_columns = list(sorted_df.columns)
        fdc_only_columns = [col for col in combined_df.columns if col not in sorted_columns]
        
        final_column_order = sorted_columns + fdc_only_columns
        combined_df = combined_df[final_column_order]
        
        # Save the combined file
        combined_df.to_csv(output_path, index=False)
        print(f"Combined file saved to: {output_path}")
        
        # Print summary statistics
        print("\n=== SUMMARY ===")
        print(f"Original sorted mugshots records: {len(sorted_df)}")
        print(f"Master FDC analysis records: {len(fdc_df)}")
        print(f"Combined records: {len(combined_df)}")
        print(f"Total columns in combined file: {len(combined_df.columns)}")
        
        # Show which records from sorted_mugshots had matching FDC data
        matched_records = combined_df[combined_df[fdc_only_columns].notna().any(axis=1)]
        print(f"Records with FDC analysis data: {len(matched_records)}")
        print(f"Records without FDC analysis data: {len(combined_df) - len(matched_records)}")
        
        return True
        
    except FileNotFoundError as e:
        print(f"ERROR: File not found - {e}")
        return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def main():
    """Main function to run the combination process."""
    print("Starting CSV file combination process...")
    success = combine_csv_files()
    
    if success:
        print("✅ CSV files combined successfully!")
        sys.exit(0)
    else:
        print("❌ Failed to combine CSV files")
        sys.exit(1)

if __name__ == "__main__":
    main() 