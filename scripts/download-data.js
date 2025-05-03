/**
 * Script to download the sorted_mugshots.csv file from a secure URL during the build process
 * This replaces the manual transfer using the wormhole CLI tool after deployment
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const isRenderEnvironment = process.env.RENDER_ENVIRONMENT === 'true';
const DATA_DIR = isRenderEnvironment
  ? '/opt/render/project/src/data'  // Use project directory in Render
  : process.env.NODE_ENV === 'production'
    ? (process.env.RENDER_INTERNAL_RESOURCES_DIR || path.join(__dirname, '..', 'data'))
    : path.join(__dirname, '..', 'data');

// The URL to download the CSV file from
// This should be set as an environment variable in the Render dashboard
const CSV_URL = process.env.MUGSHOTS_CSV_URL;
const CSV_FILENAME = 'sorted_mugshots.csv';
const CSV_FILEPATH = path.join(DATA_DIR, CSV_FILENAME);

// Log environment and configuration
console.log('Environment variables:');
console.log(` - NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(` - RENDER_ENVIRONMENT: ${process.env.RENDER_ENVIRONMENT || 'not set'}`);
console.log(` - MUGSHOTS_CSV_URL: ${CSV_URL ? 'set (hidden for security)' : 'not set'}`);
console.log(` - MUGSHOTS_CSV_PATH: ${process.env.MUGSHOTS_CSV_PATH || 'not set'}`);

// Log the data directory
console.log(`Using data directory: ${DATA_DIR}`);

// Ensure the data directory exists
function ensureDataDirExists() {
  console.log(`Ensuring data directory exists: ${DATA_DIR}`);
  
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log(`Created data directory: ${DATA_DIR}`);
    } catch (error) {
      console.error(`Error creating data directory: ${error.message}`);
      throw error;
    }
  } else {
    console.log(`Data directory already exists: ${DATA_DIR}`);
  }
}

// Download a file from a URL
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    if (!url) {
      return reject(new Error('MUGSHOTS_CSV_URL environment variable is not set. Please set it to the URL of the CSV file.'));
    }

    console.log(`Downloading file from secure URL to ${destPath}...`);
    
    const file = fs.createWriteStream(destPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: HTTP status code ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Successfully downloaded file to ${destPath}`);
        resolve();
      });
    }).on('error', (error) => {
      fs.unlink(destPath, () => {}); // Delete the file if there was an error
      reject(error);
    });
  });
}

// Validate the downloaded file
function validateFile(filePath) {
  console.log(`Validating downloaded file: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  const stats = fs.statSync(filePath);
  
  if (stats.size === 0) {
    throw new Error(`File is empty: ${filePath}`);
  }
  
  console.log(`File validation successful: ${filePath} (${stats.size} bytes)`);
  
  // Read the first few lines to verify it's a CSV file
  const fileContent = fs.readFileSync(filePath, 'utf8', { encoding: 'utf8', flag: 'r' });
  const firstLines = fileContent.split('\n').slice(0, 3).join('\n');
  
  console.log(`File content sample: ${firstLines.substring(0, 200)}...`);
  
  // Check if it looks like a CSV file
  if (!firstLines.includes(',')) {
    console.warn(`Warning: File does not appear to be a valid CSV file: ${filePath}`);
  }
  
  return true;
}

// Main function to download the CSV file
async function downloadCsvFile() {
  try {
    // Ensure the data directory exists
    ensureDataDirExists();
    
    // Download the CSV file
    await downloadFile(CSV_URL, CSV_FILEPATH);
    
    // Validate the downloaded file
    validateFile(CSV_FILEPATH);
    
    // Update the MUGSHOTS_CSV_PATH environment variable if needed
    if (process.env.MUGSHOTS_CSV_PATH !== CSV_FILEPATH) {
      console.log(`Updating MUGSHOTS_CSV_PATH environment variable to ${CSV_FILEPATH}`);
      process.env.MUGSHOTS_CSV_PATH = CSV_FILEPATH;
    }
    
    console.log('CSV file download and validation completed successfully');
    return true;
  } catch (error) {
    console.error(`Error downloading CSV file: ${error.message}`);
    
    // In production, create an empty placeholder file instead of failing
    if (process.env.NODE_ENV === 'production') {
      console.warn('Creating empty placeholder CSV file in production environment');
      
      try {
        ensureDataDirExists();
        fs.writeFileSync(CSV_FILEPATH, 'id,name,booking_date,release_date,charges\n');
        console.log(`Created empty CSV placeholder: ${CSV_FILEPATH}`);
        return true;
      } catch (placeholderError) {
        console.error(`Error creating placeholder CSV file: ${placeholderError.message}`);
        return false;
      }
    }
    
    return false;
  }
}

// Run the script
if (require.main === module) {
  downloadCsvFile()
    .then(success => {
      if (success) {
        console.log('Download script completed successfully');
      } else {
        console.error('Download script failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error(`Unhandled error in download script: ${error.message}`);
      process.exit(1);
    });
}

// Export the function for use in other scripts
module.exports = {
  downloadCsvFile
};