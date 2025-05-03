# Mugshot Database

This directory contains scripts and data for creating and managing the Mugshot Matcher database.

## Database Schema

The database uses a normalized schema with the following tables:

### inmate
- **inmate_id** (INTEGER PRIMARY KEY) - Unique identifier for each inmate
- **name** (VARCHAR(100)) - Inmate's full name
- **mugshot_url** (TEXT) - URL to the inmate's mugshot image
- **race** (CHAR(1)) - Race code (B=Black, W=White, H=Hispanic, etc.)
- **sex** (CHAR(1)) - Sex code (M=Male, F=Female)
- **date_of_birth** (DATE) - Inmate's date of birth
- **height** (INTEGER) - Height in inches
- **weight** (INTEGER) - Weight in pounds
- **hair_color** (VARCHAR(20)) - Hair color code (BLK=Black, BRO=Brown, etc.)
- **eye_color** (VARCHAR(20)) - Eye color code (BRO=Brown, BLU=Blue, etc.)
- **facility_location** (VARCHAR(100)) - Detention facility name
- **created_at** (TIMESTAMP) - Record creation timestamp
- **updated_at** (TIMESTAMP) - Record update timestamp

### statute_reference
- **statute_id** (INTEGER PRIMARY KEY) - Unique identifier for each statute
- **statute_code** (VARCHAR(20) UNIQUE) - Statute code (e.g., "812.141-4")
- **description** (TEXT) - Description of the statute (optional)
- **created_at** (TIMESTAMP) - Record creation timestamp

### charge
- **charge_id** (INTEGER PRIMARY KEY) - Unique identifier for each charge
- **inmate_id** (INTEGER) - Foreign key to inmate table
- **statute_id** (INTEGER) - Foreign key to statute_reference table
- **charge_comments** (TEXT) - Additional comments about the charge
- **case_number** (VARCHAR(50)) - Case number associated with the charge
- **description** (TEXT) - Description of the charge
- **created_at** (TIMESTAMP) - Record creation timestamp

### bond
- **bond_id** (INTEGER PRIMARY KEY) - Unique identifier for each bond
- **charge_id** (INTEGER) - Foreign key to charge table
- **amount** (DECIMAL(10,2)) - Bond amount in dollars
- **bond_type** (VARCHAR(20)) - Type of bond (BD=Bond, NB=No Bond, etc.)
- **created_at** (TIMESTAMP) - Record creation timestamp

## Indexes

The database includes the following indexes for performance optimization:

- **idx_inmate_name** - Index on inmate.name
- **idx_charge_inmate_id** - Index on charge.inmate_id
- **idx_bond_charge_id** - Index on bond.charge_id
- **idx_statute_code** - Index on statute_reference.statute_code

## Scripts

### create_database.py

This script creates the SQLite database and imports data from the CSV file. It:

1. Creates the database file (mugshots.db) in the mugshotscripts directory
2. Creates the tables and indexes according to the schema
3. Reads data from sorted_mugshots.csv
4. Parses each row, handling pipe-separated values
5. Inserts the parsed data into the corresponding tables
6. Handles duplicate inmate IDs by only inserting unique inmates
7. Includes error handling for file reading, database connection, and data insertion

Usage:
```
python mugshotscripts/create_database.py
```

### verify_database.py

This script verifies the database structure and contents. It:

1. Connects to the SQLite database
2. Prints the database structure (tables and their schemas)
3. Prints summary statistics for each table
4. Shows sample data from each table

Usage:
```
python mugshotscripts/verify_database.py
```

## Data Files

- **sorted_mugshots.csv** - Source data file containing inmate information with pipe-separated values for charges, statutes, etc.
- **mugshots.db** - SQLite database file created by the create_database.py script

## Database Statistics

Based on the current data:

- Total inmates: 221
- Total charges: 1,556
- Average charges per inmate: 7.04
- Total bonds: 1,556
- Total unique statute references: 162

The most common statute codes are:
- CRT-ORDER: 274 occurrences
- CAP-FEL: 175 occurrences
- VOP-FEL: 104 occurrences
- 948.06: 94 occurrences
- WARR-PTR-F: 92 occurrences