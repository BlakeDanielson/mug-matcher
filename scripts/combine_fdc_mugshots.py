#!/usr/bin/env python3
"""
Script to combine master FDC analysis CSV with sorted mugshots CSV.
Appends FDC data to the existing sorted mugshots CSV, including all columns from both datasets.
"""

import pandas as pd
import os

def combine_fdc_with_mugshots():
    """Combine the master FDC analysis CSV with sorted mugshots CSV."""
    
    # File paths
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fdc_file = os.path.join(project_root, 'mugshotscripts', 'master_fdc_analysis.csv')
    mugshots_file = os.path.join(project_root, 'data', 'sorted_mugshots.csv')
    output_file = os.path.join(project_root, 'data', 'combined_mugshots_fdc.csv')
    
    # Check if files exist
    if not os.path.exists(fdc_file):
        print(f"Error: FDC file not found at {fdc_file}")
        return
    
    if not os.path.exists(mugshots_file):
        print(f"Error: Mugshots file not found at {mugshots_file}")
        return
    
    print(f"Reading FDC data from: {fdc_file}")
    print(f"Reading mugshots data from: {mugshots_file}")
    
    try:
        # Read the FDC analysis CSV
        fdc_df = pd.read_csv(fdc_file)
        print(f"FDC data: {len(fdc_df)} rows, {len(fdc_df.columns)} columns")
        print(f"FDC columns: {list(fdc_df.columns)}")
        
        # Read the sorted mugshots CSV
        mugshots_df = pd.read_csv(mugshots_file)
        print(f"Mugshots data: {len(mugshots_df)} rows, {len(mugshots_df.columns)} columns")
        print(f"Mugshots columns: {list(mugshots_df.columns)}")
        
        # Get the common columns and align the data structures
        fdc_columns = set(fdc_df.columns)
        mugshots_columns = set(mugshots_df.columns)
        
        # Find columns that are different
        fdc_only = fdc_columns - mugshots_columns
        mugshots_only = mugshots_columns - fdc_columns
        common_columns = fdc_columns & mugshots_columns
        
        print(f"\nColumn analysis:")
        print(f"Common columns ({len(common_columns)}): {sorted(common_columns)}")
        print(f"FDC-only columns ({len(fdc_only)}): {sorted(fdc_only)}")
        print(f"Mugshots-only columns ({len(mugshots_only)}): {sorted(mugshots_only)}")
        
        # Create a mapping of FDC columns to mugshots columns for renaming
        column_mapping = {}
        
        # Map similar columns (case-insensitive)
        fdc_cols_lower = {col.lower(): col for col in fdc_df.columns}
        mugshots_cols_lower = {col.lower(): col for col in mugshots_df.columns}
        
        for fdc_col_lower, fdc_col in fdc_cols_lower.items():
            if fdc_col_lower in mugshots_cols_lower:
                column_mapping[fdc_col] = mugshots_cols_lower[fdc_col_lower]
        
        # Manual mapping for specific known differences
        manual_mappings = {
            'DCNumber': 'InmateID',
            'BirthDate': 'DOB'
        }
        
        for fdc_col, mugshots_col in manual_mappings.items():
            if fdc_col in fdc_df.columns and mugshots_col in mugshots_df.columns:
                column_mapping[fdc_col] = mugshots_col
        
        print(f"\nColumn mappings: {column_mapping}")
        
        # Rename FDC columns to match mugshots structure where mappings exist
        fdc_df_renamed = fdc_df.rename(columns=column_mapping)
        
        # Get all unique columns from both datasets
        all_columns = list(mugshots_df.columns) + [col for col in fdc_df_renamed.columns if col not in mugshots_df.columns]
        print(f"\nAll columns in final dataset ({len(all_columns)}): {all_columns}")
        
        # Add missing columns to mugshots data with default values
        for col in all_columns:
            if col not in mugshots_df.columns:
                mugshots_df[col] = ""
                
        # Add missing columns to FDC data with default values
        for col in all_columns:
            if col not in fdc_df_renamed.columns:
                fdc_df_renamed[col] = ""
        
        # Reorder both dataframes to match the final column order
        mugshots_df_aligned = mugshots_df[all_columns]
        fdc_df_aligned = fdc_df_renamed[all_columns]
        
        # Combine the dataframes
        combined_df = pd.concat([mugshots_df_aligned, fdc_df_aligned], ignore_index=True)
        
        # Save the combined data
        combined_df.to_csv(output_file, index=False)
        
        print(f"\nCombined data successfully saved to: {output_file}")
        print(f"Total rows: {len(combined_df)} (Mugshots: {len(mugshots_df)} + FDC: {len(fdc_df)} + 1 header)")
        print(f"Total columns: {len(combined_df.columns)}")
        
        # Show breakdown of columns by source
        mugshots_original_cols = set(mugshots_df.columns) - set(fdc_df_renamed.columns)
        fdc_original_cols = set(fdc_df_renamed.columns) - set(mugshots_df.columns)
        shared_cols = set(mugshots_df.columns) & set(fdc_df_renamed.columns)
        
        print(f"\nColumn breakdown:")
        print(f"Original mugshots columns ({len(mugshots_original_cols)}): {sorted(mugshots_original_cols)}")
        print(f"Original FDC columns ({len(fdc_original_cols)}): {sorted(fdc_original_cols)}")
        print(f"Shared/mapped columns ({len(shared_cols)}): {sorted(shared_cols)}")
        
        # Display sample of the combined data
        print(f"\nSample of combined data (first 2 rows):")
        print(combined_df.head(2).to_string())
        
    except Exception as e:
        print(f"Error processing files: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    combine_fdc_with_mugshots() 