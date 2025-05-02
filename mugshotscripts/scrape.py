import requests
from bs4 import BeautifulSoup
import csv
import time
import os
import argparse

BASE_URL = "https://apps.sheriff.org/ArrestSearch/InmateDetail/"
PHOTO_BASE = "https://apps.sheriff.org"

SEARCH_COUNT = 1000  # Reduced for testing
START_ID = 542500000  # Change as needed
END_ID = START_ID + SEARCH_COUNT    # Change as needed
TIMEOUT = 3

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

def extract_inmate_data(soup, inmate_id):
    # Extract inmate name from h3 tag
    name_tag = soup.find("h3")
    name = name_tag.get_text(strip=True) if name_tag else ""

    # Extract mugshot photo
    photo_tag = soup.find("img", {"src": lambda x: x and x.startswith("/thumbs/")})
    mugshot_url = PHOTO_BASE + photo_tag["src"] if photo_tag else ""

    # Extract fields
    def get_label_value(label):
        lbl = soup.find("label", string=label)
        if not lbl:
            return ""
        span = lbl.find_next_sibling("span")
        if not span:
            return ""
        val = span.get_text(strip=True)
        return val

    # Some fields are in nested spans
    def get_label_value_nested(label):
        lbl = soup.find("label", string=label)
        if not lbl:
            return ""
        span = lbl.find_next_sibling("span")
        if not span:
            return ""
        inner_span = span.find("span")
        if inner_span:
            return inner_span.get_text(strip=True)
        return span.get_text(strip=True)

    race = get_label_value_nested("Race")
    sex = get_label_value_nested("Sex")
    dob = get_label_value_nested("DOB")
    height = get_label_value_nested("Height")
    weight = get_label_value_nested("Weight")
    hair = get_label_value_nested("Hair")
    eyes = get_label_value_nested("Eyes")
    location = get_label_value_nested("Location")

    # Extract all charges
    charges = []
    for panel in soup.find_all("div", class_="panel panel-warning"):
        if not panel.find("div", class_="panel-heading", string="Charge"):
            continue
        charge = {}
        rows = panel.find_all("div", class_="row")
        for row in rows:
            labels = row.find_all("label")
            spans = row.find_all("span", class_="inputWarning")
            for lbl, spn in zip(labels, spans):
                key = lbl.get_text(strip=True)
                val = spn.get_text(strip=True)
                charge[key] = val
        if charge:
            charges.append(charge)

    return {
        "InmateID": inmate_id,
        "Name": name,
        "MugshotURL": mugshot_url,
        "Race": race,
        "Sex": sex,
        "DOB": dob,
        "Height": height,
        "Weight": weight,
        "Hair": hair,
        "Eyes": eyes,
        "Location": location,
        "Charges": charges
    }

def is_valid_inmate_page(soup):
    # Heuristic: must have "Inmate Information" panel
    return soup.find("div", class_="panel-heading", string="Inmate Information") is not None

def flatten_charges(charges):
    # Flatten all charges into a single string per field, separated by ' | '
    fields = ["Statute", "Charge Comments", "Case Number", "Description", "Bond Amount", "Bond Type"]
    result = {}
    for field in fields:
        result[field] = " | ".join([c.get(field, "") for c in charges])
    return result

# Function removed as we now always use the configured START_ID and END_ID

def main():
    parser = argparse.ArgumentParser(description="Scrape inmate data.")
    parser.add_argument(
        '--start-id',
        type=int,
        help="Explicitly set the starting ID for scraping. If not provided, will use the configured START_ID."
    )
    args = parser.parse_args()

    csv_filepath = "mugshots_data.csv"
    
    # Determine the starting ID for scraping
    start_scrape_id = args.start_id if args.start_id is not None else START_ID
    print(f"Starting scrape from ID: {start_scrape_id}")


    file_exists = os.path.exists(csv_filepath)
    is_empty = not file_exists or os.path.getsize(csv_filepath) == 0

    with open(csv_filepath, mode="a", newline="", encoding="utf-8") as file:
        fieldnames = [
            "InmateID", "Name", "MugshotURL", "Race", "Sex", "DOB", "Height", "Weight", "Hair", "Eyes", "Location",
            "Statute", "Charge Comments", "Case Number", "Description", "Bond Amount", "Bond Type"
        ]
        writer = csv.DictWriter(file, fieldnames=fieldnames)

        if is_empty:
            writer.writeheader()
            print("CSV header written.")

        # Calculate end ID based on the start ID to maintain consistent search count
        end_scrape_id = END_ID if args.start_id is None else start_scrape_id + SEARCH_COUNT
        print(f"Will scrape IDs from {start_scrape_id} to {end_scrape_id}")
        
        for inmate_id in range(start_scrape_id, end_scrape_id + 1):
            url = BASE_URL + str(inmate_id)
            try:
                resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
                if resp.status_code != 200:
                    print(f"ID {inmate_id}: Not found (status {resp.status_code})")
                    time.sleep(TIMEOUT)  # Be polite to the server
                    continue
                soup = BeautifulSoup(resp.text, "html.parser")
                if not is_valid_inmate_page(soup):
                    print(f"ID {inmate_id}: Not a valid inmate page")
                    continue
                data = extract_inmate_data(soup, inmate_id)
                flat_charges = flatten_charges(data["Charges"])
                row = {**{k: data[k] for k in fieldnames if k in data}, **flat_charges}
                writer.writerow(row)
                print(f"ID {inmate_id}: Data extracted")
            except Exception as e:
                print(f"ID {inmate_id}: Error - {e}")
            time.sleep(TIMEOUT)  # Be polite to the server

if __name__ == "__main__":
    main()
