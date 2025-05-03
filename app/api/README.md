# Mugshot Matcher API

This directory contains the API routes for the Mugshot Matcher application.

## Endpoints

### GET /api/inmates

Fetches a list of inmates from the CSV data store.

#### Response

```json
{
  "inmates": [
    {
      "id": 502500409,
      "name": "FLORENCE, CODY",
      "image": "https://apps.sheriff.org/thumbs/168/t0001682307.jpg",
      "crime": "COURT ORDER"
    },
    // More inmates...
  ]
}
```

## Data Storage

The API reads inmate data from CSV files stored in the `data` directory. The data files follow a structured format to maintain data integrity and enable efficient querying.

### Data Structure

The inmate data is organized across the following CSV files:

- `inmates.csv`: Core inmate information (ID, name, mugshot URL)
- `charges.csv`: Charge information associated with inmates
- `statutes.csv`: Statute code reference data
- `bonds.csv`: Bond information linked to charges

### File Format

Each CSV file uses standard CSV formatting with headers. Example structure for `inmates.csv`:

```csv
id,name,image_url,booking_date
502500409,"FLORENCE, CODY",https://apps.sheriff.org/thumbs/168/t0001682307.jpg,2023-04-15
```

### Data Access

The API implements efficient CSV parsing and caching strategies to ensure optimal performance. Data access logic is centralized in the `lib/data.ts` file.

## Environment Variables

- `DATA_DIR`: Directory containing the CSV files (default: `../data`)

## Error Handling

If file access fails or an error occurs while parsing CSV data, the API will return a 500 status code with an error message.