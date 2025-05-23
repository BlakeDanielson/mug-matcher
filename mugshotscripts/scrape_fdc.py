import requests
from bs4 import BeautifulSoup
import csv
import time
import os
import argparse
import re

BASE_URL = "https://pubapps.fdc.myflorida.com/offenderSearch/detail.aspx?Page=Detail&TypeSearch=AI&DCNumber="
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:100.0) Gecko/20100101 Firefox/100.0"
}
TIMEOUT = 1  # Seconds for request timeout and delay between requests
DEFAULT_START_ID = 100000  # Example starting DC Number (numeric part)
DEFAULT_SEARCH_COUNT = 100 # Number of IDs to check

def sanitize_filename(name):
    """Remove or replace characters that are invalid in filenames."""
    return re.sub(r'[\\/*?_<>|]', "_", name) # removed : and " from invalid chars as they might be in data

def extract_table_data(soup, table_header_text):
    """Extracts data from a table given the text of its preceding h3 header."""
    is_prior_history = "Prior Prison History:" in table_header_text
    if is_prior_history:
        print(f"--- Debugging extract_table_data for: {table_header_text} ---")

    # Make regex more flexible: match if the string *starts with* table_header_text
    # This handles cases where the h3 might contain additional elements like spans with notes.
    regex_pattern = r"^" + re.escape(table_header_text.strip()) # Ensure the core text is at the beginning
    header_tag = soup.find("h3", string=re.compile(regex_pattern, re.IGNORECASE))

    if is_prior_history:
        print(f"Debug (Prior History): Using regex: '{regex_pattern}'")
        print(f"Debug (Prior History): Found header_tag: {bool(header_tag)}")
        if header_tag:
            print(f"Debug (Prior History): Header_tag HTML: {str(header_tag)[:100]}")

    if not header_tag:
        if is_prior_history:
            print("Debug (Prior History): header_tag not found, returning empty.")
        return ""

    table = header_tag.find_next_sibling("table")
    if is_prior_history:
        print(f"Debug (Prior History): Found table via find_next_sibling: {bool(table)}")
        if table:
            print(f"Debug (Prior History): Table HTML (first 100 chars): {str(table)[:100]}")
        else:
            # Fallback: if direct sibling is not a table, try finding the table within the parent div of the header
            parent_div = header_tag.find_parent("div")
            if parent_div:
                print(f"Debug (Prior History): Trying fallback: looking for table within parent div of header_tag. Parent div id: {parent_div.get('id')}")
                table = parent_div.find("table") # Find the first table within this parent div
                print(f"Debug (Prior History): Found table via fallback in parent div: {bool(table)}")
                if table:
                    print(f"Debug (Prior History): Fallback Table HTML (first 100 chars): {str(table)[:100]}")
            else:
                print("Debug (Prior History): No parent div found for header_tag for fallback.")


    if not table:
        if is_prior_history:
            print("Debug (Prior History): table not found, returning empty.")
        return ""

    rows_data = []
    headers = [th.get_text(strip=True) for th in table.find_all("th")]
    
    for row in table.find("tbody").find_all("tr") if table.find("tbody") else table.find_all("tr")[1:]: # Skip header row if no tbody
        cols = row.find_all("td")
        if not cols:
            continue
        
        row_dict = {}
        for i, col in enumerate(cols):
            header_name = headers[i] if i < len(headers) else f"Column_{i+1}"
            row_dict[header_name] = col.get_text(strip=True)
        
        rows_data.append(", ".join([f"{k}: {v}" for k, v in row_dict.items()]))
        
    return " | ".join(rows_data)


def extract_inmate_data(soup, dc_number):
    """Extracts inmate data from the BeautifulSoup object of the inmate's page."""
    data = {"DCNumber": dc_number}

    offender_pic_label = soup.find(string="Offender Picture")
    mugshot_url = ""
    if offender_pic_label:
        parent_td = offender_pic_label.find_parent("td")
        if parent_td:
            img_tag = parent_td.find("img")
            if img_tag and img_tag.get("src"):
                mugshot_url = img_tag["src"]
                if not mugshot_url.startswith("http"):
                    mugshot_url = "https://pubapps.fdc.myflorida.com" + mugshot_url 
    data["MugshotURL"] = mugshot_url

    details_table = None
    h2_detail = soup.find("h2", string="Inmate Population Information Detail")

    if h2_detail:
        all_following_tables = h2_detail.find_all_next("table")
        for tbl in all_following_tables:
            # Check if any cell in the table contains "DC Number:" (either th or td)
            if tbl.find(lambda tag: (tag.name == "td" or tag.name =="th") and "DC Number:" in tag.get_text(strip=True)):
                details_table = tbl
                break 
    
    if details_table:
        rows = details_table.find_all("tr")
        for i, row in enumerate(rows):
            cells = row.find_all("td") 
            label_cell = None
            value_cell = None

            if len(row.find_all("th")) == 1 and len(row.find_all("td")) == 1:
                label_cell = row.find("th")
                value_cell = row.find("td")
            elif len(cells) == 2:
                label_cell = cells[0]
                value_cell = cells[1]
            
            if label_cell and value_cell:
                label_text = label_cell.get_text(strip=True).replace(":", "")
                label_key = label_text.replace(" ", "").replace("/", "")
                
                current_cell_value = value_cell.get_text(strip=True)

                # Assign to data dictionary, cleaning date fields
                if label_key == "BirthDate":
                    date_match = re.search(r"(\d{2}/\d{2}/\d{4})", current_cell_value)
                    data["BirthDate"] = date_match.group(1) if date_match else current_cell_value
                elif label_key == "InitialReceiptDate":
                    date_match = re.search(r"(\d{2}/\d{2}/\d{4})", current_cell_value)
                    data["InitialReceiptDate"] = date_match.group(1) if date_match else current_cell_value
                elif label_key == "CurrentReleaseDate":
                    date_match = re.search(r"(\d{2}/\d{2}/\d{4})", current_cell_value)
                    data["CurrentReleaseDate"] = date_match.group(1) if date_match else current_cell_value
                    # Note: The VINE legal note is typically in a separate row and would require
                    # more complex logic to associate if it were to be appended here.
                    # This change focuses on ensuring the date itself is clean.
                elif label_key == "Name":
                    data["Name"] = current_cell_value
                elif label_key == "Race":
                    data["Race"] = current_cell_value
                elif label_key == "Sex":
                    data["Sex"] = current_cell_value
                elif label_key == "CurrentFacility":
                    facility_link = value_cell.find('a')
                    data["CurrentFacility"] = facility_link.get_text(strip=True) if facility_link else current_cell_value
                elif label_key == "CurrentCustody":
                    data["CurrentCustody"] = current_cell_value
                # Note: The VINE link click and its accompanying text are in a separate row in the HTML structure,
                # so the old logic for appending it here was likely not functioning as intended.
                # Consider a separate parsing step if that specific note is critical.
    
    aliases_header = soup.find("h3", string="Aliases:")
    if aliases_header:
        # Collect all text from siblings until the next h3 or end of siblings
        aliases_content = []
        next_node = aliases_header.next_sibling
        while next_node and next_node.name != 'h3':
            if isinstance(next_node, str):
                stripped_text = next_node.strip()
                if stripped_text:
                    aliases_content.append(stripped_text)
            elif next_node.name == 'p': # Handle <p> tags if aliases are within them
                 aliases_content.append(next_node.get_text(strip=True))
            elif next_node.name == 'br': # Handle line breaks if they separate aliases
                pass # Often <br> are just for spacing, actual text is usually a string node
            else: # Catch any other tags and get their stripped text if any
                text_from_other_tag = next_node.get_text(strip=True)
                if text_from_other_tag:
                    aliases_content.append(text_from_other_tag)
            next_node = next_node.next_sibling
        
        # Join collected parts, filter out empty strings that might result from stripping
        data["Aliases"] = ", ".join(filter(None, [ac.strip() for ac in aliases_content]))

    data["CurrentPrisonSentenceHistory"] = extract_table_data(soup, "Current Prison Sentence History:")
    data["Detainers"] = extract_table_data(soup, "Detainers:")
    # data["IncarcerationHistory"] = extract_table_data(soup, "Incarceration History:") # Removed as per request
    # data["PriorPrisonHistory"] = extract_table_data(soup, "Prior Prison History:") # Removed as per request

    return data

def is_valid_inmate_page(soup):
    return soup.find("h2", string="Inmate Population Information Detail") is not None

def main():
    parser = argparse.ArgumentParser(description="Scrape inmate data from Florida Department of Corrections.")
    parser.add_argument(
        '--start-id',
        type=int,
        default=DEFAULT_START_ID,
        help=f"Starting numeric DCNumber for scraping. Default: {DEFAULT_START_ID}"
    )
    parser.add_argument(
        '--count',
        type=int,
        default=DEFAULT_SEARCH_COUNT,
        help=f"Number of DCNumbers to scrape. Default: {DEFAULT_SEARCH_COUNT}"
    )
    parser.add_argument(
        '--csv-name',
        type=str,
        default="fdc_inmate_data.csv",
        help="Name of the output CSV file. Default: fdc_inmate_data.csv"
    )
    parser.add_argument(
        '--id-prefix',
        type=str,
        default="",
        help="Optional prefix for DC Numbers (e.g., 'A' for numbers like A12345). Numeric part still controlled by --start-id and --count."
    )
    args = parser.parse_args()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_filename = sanitize_filename(args.csv_name)
    csv_filepath = os.path.join(script_dir, csv_filename)
    
    start_scrape_id_num = args.start_id
    
    print(f"Starting scrape. Numeric part from: {start_scrape_id_num} for {args.count} IDs, with prefix '{args.id_prefix}'")
    print(f"Outputting to: {csv_filepath}")

    file_exists = os.path.exists(csv_filepath)
    is_empty = not file_exists or os.path.getsize(csv_filepath) == 0

    fieldnames = [
        "DCNumber", "Name", "MugshotURL", "Race", "Sex", "BirthDate", 
        "InitialReceiptDate", "CurrentFacility", "CurrentCustody", 
        "CurrentReleaseDate", "Aliases", "CurrentPrisonSentenceHistory", 
        "Detainers" # Removed "IncarcerationHistory" and "PriorPrisonHistory"
    ]

    with open(csv_filepath, mode="a", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames, extrasaction='ignore')

        if is_empty:
            writer.writeheader()
            print("CSV header written.")
        
        for i in range(args.count):
            dc_number_numeric_part = start_scrape_id_num + i
            dc_number_str = f"{args.id_prefix}{dc_number_numeric_part}"

            url = BASE_URL + dc_number_str
            print(f"Scraping DCNumber: {dc_number_str} (URL: {url})")
            
            try:
                resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    if is_valid_inmate_page(soup):
                        inmate_info = extract_inmate_data(soup, dc_number_str)
                        # Only write if name is found, indicating a likely valid populated page
                        if inmate_info.get("Name"):
                            writer.writerow(inmate_info)
                            print(f"  SUCCESS: Data extracted for {dc_number_str} - {inmate_info.get('Name', 'N/A')}")
                        else:
                            print(f"  INFO: DCNumber {dc_number_str} - Page valid but no name found, skipping write.")
                    else:
                        print(f"  INFO: DCNumber {dc_number_str} is not a valid inmate page structure.")
                elif resp.status_code == 404 or resp.status_code == 500: # Common for not found / error
                    print(f"  INFO: DCNumber {dc_number_str} not found or error (status {resp.status_code}).")
                else:
                    print(f"  WARN: DCNumber {dc_number_str} returned status {resp.status_code}.")
            
            except requests.exceptions.Timeout:
                print(f"  ERROR: Timeout while requesting DCNumber {dc_number_str}.")
            except requests.exceptions.RequestException as e:
                print(f"  ERROR: Request failed for DCNumber {dc_number_str} - {e}")
            except Exception as e:
                print(f"  ERROR: Failed to process DCNumber {dc_number_str} - {e} (Line: {e.__traceback__.tb_lineno if e.__traceback__ else 'N/A'})")
            
            time.sleep(TIMEOUT) 

    print(f"Scraping complete. Data saved to {csv_filepath}")

if __name__ == "__main__":
    main() 