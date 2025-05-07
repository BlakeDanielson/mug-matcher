# Render Deployment Guide

This guide explains how to deploy the Mugshot Matcher application to Render.

## Overview

The application is configured to be deployed to Render with all necessary data files included in the repository. This eliminates the need for manual file transfers after deployment.

## Data Files

The application requires the following data files:

- `sorted_mugshots.csv`: Contains the mugshot data used by the application.

These files are stored in the `data` directory in the repository and are automatically deployed to the `/data` directory on Render.

## Deployment Steps

1. Ensure all data files are in the `data` directory in the repository.
2. Commit all changes to the repository.
3. Deploy the application to Render.

## Configuration

The application is configured to look for data files in the following locations:

- In development: `./data` directory in the project root
- In production (Render): `/data` directory

## Troubleshooting

If you encounter issues with data files not being found:

1. Verify that the data files are in the `data` directory in the repository.
2. Check the Render logs for any file access errors.
3. Ensure the application has the necessary permissions to access the `/data` directory on Render.

## Previous Deployment Method (Deprecated)

Previously, the `sorted_mugshots.csv` file was transferred manually to the `/data` directory on Render after deployment using the wormhole CLI tool. This method is now deprecated in favor of including the file in the repository.

## Scripts

The following scripts are available to help with deployment:

- `npm run validate-data`: Validates that all required data files are available.
- `npm run update-render-config`: Updates the Render deployment configuration to include data files in the repository.

## Environment Variables

The application uses the following environment variables for data file configuration:

- `RENDER_ENVIRONMENT`: Set to `true` when running on Render.
- `RENDER_INTERNAL_RESOURCES_DIR`: The directory where Render stores internal resources.
- `SOURCE_DATA_DIR`: Optional directory to look for data files.
- `MUGSHOTS_CSV_PATH`: Optional path to the mugshots CSV file.

## Directory Structure

```
mug-matcher/
├── data/                  # Data directory (included in repository)
│   ├── .gitkeep           # Ensures the directory is tracked by git
│   ├── README.md          # Documentation for the data directory
│   └── sorted_mugshots.csv # Mugshot data file
├── scripts/
│   ├── build.js           # Build script
│   ├── copy-data.js       # Script to copy data files
│   ├── start.js           # Start script
│   ├── update-render-config.js # Script to update Render configuration
│   └── validate-data.js   # Script to validate data files
└── ...
```

## Implementation Details

The application uses the following approach to handle data files:

1. During build, the `copy-data.js` script copies data files to the appropriate location.
2. The `validate-data.js` script checks that all required data files are available.
3. In production, the application looks for data files in the `/data` directory.
4. In development, the application looks for data files in the `./data` directory.

This approach ensures that the application works consistently in both development and production environments.