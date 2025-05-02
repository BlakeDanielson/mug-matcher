# Mugshot Matcher API

This directory contains the API routes for the Mugshot Matcher application.

## Endpoints

### GET /api/inmates

Fetches a list of inmates from the SQLite database.

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

## Database Integration

The API connects to an SQLite database located at `mugshotscripts/mugshots.db`. The database path can be configured using the `MUGSHOTS_DB_PATH` environment variable.

### Database Schema

The database contains the following tables:

- `inmate`: Contains information about inmates (name, mugshot URL, etc.)
- `charge`: Contains information about charges associated with inmates
- `statute_reference`: Contains information about statute codes
- `bond`: Contains information about bonds associated with charges

### Connection Management

The database connection is managed using a singleton pattern to ensure efficient connection reuse in a serverless environment. The connection logic is centralized in the `lib/database.ts` file.

## Environment Variables

- `MUGSHOTS_DB_PATH`: Path to the SQLite database file (default: `../mugshotscripts/mugshots.db`)

## Error Handling

If the database connection fails or an error occurs while fetching data, the API will return a 500 status code with an error message.