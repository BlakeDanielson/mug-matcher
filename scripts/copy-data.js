/**
 * Script to copy CSV files to the mounted /data directory during deployment
 * This script is used in the build process for Render deployment
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DATA_DIR = process.env.NODE_ENV === 'production' ? '/data' : path.join(__dirname, '..', 'data');
const SOURCE_DIRS = [
  path.join(__dirname, '..', '..', 'mugshotscripts'), // For development environment
  path.join(process.cwd(), '..', 'mugshotscripts'),   // Alternative path for development
  path.join(process.cwd(), 'mugshotscripts'),         // If mugshotscripts is in the project root
  path.join(__dirname, '..', 'data')                  // For local testing
];

// Log the paths we're checking
console.log('Checking the following source directories:');
SOURCE_DIRS.forEach(dir => console.log(` - ${dir}`));

// Ensure the data directory exists
function ensureDataDirExists() {
  console.log(`Ensuring data directory exists: ${DATA_DIR}`);
  
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log(`Created data directory: ${DATA_DIR}`);
    } catch (error) {
      console.error(`Error creating data directory: ${error.message}`);
      
      // In production, this is a critical error
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  } else {
    console.log(`Data directory already exists: ${DATA_DIR}`);
  }
}

// Copy a file if it exists
function copyFileIfExists(sourcePath, destPath) {
  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${sourcePath} to ${destPath}`);
      return true;
    } catch (error) {
      console.error(`Error copying ${sourcePath} to ${destPath}: ${error.message}`);
      return false;
    }
  }
  return false;
}

// Copy CSV files to the data directory
function copyDataFiles() {
  const filesToCopy = [
    'sorted_mugshots.csv',
    'mugshots.db'  // Include the SQLite database for legacy support
  ];
  
  ensureDataDirExists();
  
  // Track if we've successfully copied each file
  const copiedFiles = {};
  
  // Initialize all files as not copied
  filesToCopy.forEach(file => {
    copiedFiles[file] = false;
  });
  
  // Try to copy from each source directory
  SOURCE_DIRS.forEach(sourceDir => {
    filesToCopy.forEach(file => {
      // Skip if already copied
      if (copiedFiles[file]) return;
      
      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(DATA_DIR, file);
      
      if (copyFileIfExists(sourcePath, destPath)) {
        copiedFiles[file] = true;
      }
    });
  });
  
  // Check if any files weren't copied
  const missingFiles = Object.entries(copiedFiles)
    .filter(([_, copied]) => !copied)
    .map(([file, _]) => file);
  
  if (missingFiles.length > 0) {
    console.warn(`Warning: The following files were not found in any source directory: ${missingFiles.join(', ')}`);
    
    // In production, missing files are a critical error
    if (process.env.NODE_ENV === 'production') {
      console.error('Error: Missing required data files in production environment');
      process.exit(1);
    }
  } else {
    console.log('All data files were successfully copied');
  }
}

// Run the script
copyDataFiles();