#!/usr/bin/env python3
"""
Script to update mugshot URLs in existing CSV by scraping FDC website.
This script reads InmateIDs from the CSV, visits the FDC website for each inmate,
and updates the MugshotURL column with the actual image URLs.
"""

import csv
import requests
from bs4 import BeautifulSoup
import time
import os
import argparse
import re
import sys
from pathlib import Path

# Configuration
FDC_BASE_URL = "https://pubapps.fdc.myflorida.com/offenderSearch/detail.aspx?Page=Detail&TypeSearch=AI&DCNumber="
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:100.0) Gecko/20100101 Firefox/100.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1"
}
REQUEST_DELAY = 2  # Seconds between requests to be respectful
REQUEST_TIMEOUT = 10  # Seconds

def extract_mugshot_url(soup):
    """Extract mugshot URL from FDC inmate page."""
    try:
        # Look for "Offender Picture" text in the page
        offender_pic_label = soup.find(string="Offender Picture")
        if offender_pic_label:
            # Find the parent table cell
            parent_td = offender_pic_label.find_parent("td")
            if parent_td:
                # Look for an img tag in the same cell
                img_tag = parent_td.find("img")
                if img_tag and img_tag.get("src"):
                    mugshot_url = img_tag["src"]
                    # Convert relative URL to absolute if needed
                    if not mugshot_url.startswith("http"):
                        mugshot_url = "https://pubapps.fdc.myflorida.com" + mugshot_url
                    return mugshot_url
        
        # Alternative: Look for any img tag with a src that looks like a mugshot
        img_tags = soup.find_all("img")
        for img in img_tags:
            src = img.get("src", "")
            if src and ("offender" in src.lower() or "inmate" in src.lower() or "mugshot" in src.lower()):
                if not src.startswith("http"):
                    src = "https://pubapps.fdc.myflorida.com" + src
                return src
                
    except Exception as e:
        print(f"    Error extracting mugshot URL: {e}")
    
    return ""

def is_valid_inmate_page(soup):
    """Check if the page contains valid inmate information."""
    return soup.find("h2", string="Inmate Population Information Detail") is not None

def fetch_mugshot_url(inmate_id):
    """Fetch mugshot URL for a given inmate ID from FDC website."""
    try:
        # Convert InmateID to DCNumber format (remove any prefix if needed)
        dc_number = str(inmate_id).strip()
        url = FDC_BASE_URL + dc_number
        
        print(f"  Fetching: {url}")
        response = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")
            
            if is_valid_inmate_page(soup):
                mugshot_url = extract_mugshot_url(soup)
                if mugshot_url:
                    print(f"    ✓ Found mugshot URL: {mugshot_url}")
                    return mugshot_url
                else:
                    print(f"    ⚠ No mugshot found on page")
                    return ""
            else:
                print(f"    ⚠ Invalid inmate page structure")
                return ""
        else:
            print(f"    ✗ HTTP {response.status_code}: {response.reason}")
            return ""
            
    except requests.RequestException as e:
        print(f"    ✗ Request error: {e}")
        return ""
    except Exception as e:
        print(f"    ✗ Unexpected error: {e}")
        return ""

def update_csv_mugshots(input_csv_path, output_csv_path=None, max_records=None, start_from=0, request_delay=REQUEST_DELAY):
    """Update mugshot URLs in the CSV file."""
    
    if not os.path.exists(input_csv_path):
        print(f"Error: Input CSV file not found: {input_csv_path}")
        return False
    
    if output_csv_path is None:
        # Create backup and update original
        backup_path = input_csv_path.replace('.csv', '_backup.csv')
        if not os.path.exists(backup_path):
            os.rename(input_csv_path, backup_path)
            print(f"Created backup: {backup_path}")
        output_csv_path = input_csv_path
        input_csv_path = backup_path
    
    # Read the input CSV
    updated_records = []
    total_processed = 0
    total_updated = 0
    
    print(f"Reading CSV: {input_csv_path}")
    
    try:
        with open(input_csv_path, 'r', encoding='utf-8', newline='') as infile:
            # Detect delimiter
            sample = infile.read(1024)
            infile.seek(0)
            sniffer = csv.Sniffer()
            delimiter = sniffer.sniff(sample).delimiter
            
            reader = csv.DictReader(infile, delimiter=delimiter)
            fieldnames = reader.fieldnames
            
            print(f"CSV columns found: {fieldnames}")
            
            # Check for required columns
            inmate_id_col = None
            mugshot_url_col = None
            
            for col in fieldnames:
                if 'inmate' in col.lower() and 'id' in col.lower():
                    inmate_id_col = col
                elif 'dcnumber' in col.lower().replace(' ', ''):
                    inmate_id_col = col
                elif 'mugshot' in col.lower() and 'url' in col.lower():
                    mugshot_url_col = col
            
            if not inmate_id_col:
                print("Error: Could not find InmateID or DCNumber column")
                return False
                
            if not mugshot_url_col:
                print("Error: Could not find MugshotURL column")
                return False
            
            print(f"Using columns: InmateID='{inmate_id_col}', MugshotURL='{mugshot_url_col}'")
            
            # Process records
            record_count = 0
            for row in reader:
                record_count += 1
                
                # Skip records before start_from
                if record_count <= start_from:
                    updated_records.append(row)
                    continue
                
                inmate_id = row.get(inmate_id_col, '').strip()
                current_mugshot_url = row.get(mugshot_url_col, '').strip()
                
                print(f"\nRecord {record_count}: InmateID={inmate_id}")
                
                # Skip if no inmate ID
                if not inmate_id:
                    print(f"  ⚠ Skipping - no inmate ID")
                    updated_records.append(row)
                    continue
                
                # Skip if already has a mugshot URL (unless it's empty or placeholder)
                if current_mugshot_url and not current_mugshot_url.lower() in ['', 'n/a', 'none', 'null']:
                    print(f"  ⚠ Skipping - already has mugshot URL: {current_mugshot_url}")
                    updated_records.append(row)
                    continue
                
                # Fetch mugshot URL
                mugshot_url = fetch_mugshot_url(inmate_id)
                
                # Update the record
                if mugshot_url:
                    row[mugshot_url_col] = mugshot_url
                    total_updated += 1
                    print(f"  ✓ Updated mugshot URL")
                else:
                    print(f"  ✗ No mugshot URL found")
                
                updated_records.append(row)
                total_processed += 1
                
                # Rate limiting
                time.sleep(request_delay)
                
                # Check if we've hit the max records limit
                if max_records and total_processed >= max_records:
                    print(f"\nReached maximum records limit: {max_records}")
                    break
    
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return False
    
    # Write the updated CSV
    print(f"\nWriting updated CSV: {output_csv_path}")
    try:
        with open(output_csv_path, 'w', encoding='utf-8', newline='') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(updated_records)
        
        print(f"\n✓ Successfully updated CSV!")
        print(f"  Total records processed: {total_processed}")
        print(f"  Total mugshots updated: {total_updated}")
        print(f"  Output file: {output_csv_path}")
        
        return True
        
    except Exception as e:
        print(f"Error writing CSV: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description="Update mugshot URLs in CSV by scraping FDC website",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Update mugshots for first 10 records
  python scripts/update_mugshot_urls.py data/sorted_mugshots.csv --max-records 10

  # Update all records, starting from record 100
  python scripts/update_mugshot_urls.py data/sorted_mugshots.csv --start-from 100

  # Update and save to new file
  python scripts/update_mugshot_urls.py data/sorted_mugshots.csv --output data/updated_mugshots.csv
        """
    )
    
    parser.add_argument(
        'input_csv',
        help='Path to input CSV file with inmate data'
    )
    
    parser.add_argument(
        '--output', '-o',
        help='Path to output CSV file (default: update input file)'
    )
    
    parser.add_argument(
        '--max-records', '-m',
        type=int,
        help='Maximum number of records to process (default: all)'
    )
    
    parser.add_argument(
        '--start-from', '-s',
        type=int,
        default=0,
        help='Record number to start from (default: 0)'
    )
    
    parser.add_argument(
        '--delay', '-d',
        type=float,
        default=REQUEST_DELAY,
        help=f'Delay between requests in seconds (default: {REQUEST_DELAY})'
    )
    
    args = parser.parse_args()
    
    print("FDC Mugshot URL Updater")
    print("=" * 50)
    print(f"Input CSV: {args.input_csv}")
    print(f"Output CSV: {args.output or 'Same as input (with backup)'}")
    print(f"Max records: {args.max_records or 'All'}")
    print(f"Start from: {args.start_from}")
    print(f"Request delay: {args.delay} seconds")
    print("=" * 50)
    
    success = update_csv_mugshots(
        args.input_csv,
        args.output,
        args.max_records,
        args.start_from,
        args.delay
    )
    
    if success:
        print("\n🎉 Mugshot URL update completed successfully!")
    else:
        print("\n❌ Mugshot URL update failed!")
        sys.exit(1)

if __name__ == "__main__":
    main() 