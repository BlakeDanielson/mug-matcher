/**
 * Script to copy CSV files to the mounted /data directory during deployment
 * This script is used in the build process for Render deployment
 */

const fs = require('fs');
const path = require('path');

// Configuration
// In Render environment, use /data directory
// In other production environments, try to use /data, but fall back to a temp directory
// In development, use a local data directory
const isRenderEnvironment = process.env.RENDER_ENVIRONMENT === 'true';
const DATA_DIR = isRenderEnvironment
  ? '/data'
  : process.env.NODE_ENV === 'production'
    ? (process.env.RENDER_INTERNAL_RESOURCES_DIR || path.join(__dirname, '..', 'temp_data'))
    : path.join(__dirname, '..', 'data');
const SOURCE_DIRS = [
  process.env.SOURCE_DATA_DIR,                        // From environment variable (for Render)
  path.join(__dirname, '..', '..', 'mugshotscripts'), // For development environment
  path.join(process.cwd(), '..', 'mugshotscripts'),   // Alternative path for development
  path.join(process.cwd(), 'mugshotscripts'),         // If mugshotscripts is in the project root
  path.join(__dirname, '..', 'data')                  // For local testing
].filter(Boolean); // Filter out undefined values

// Log environment and configuration
console.log('Environment variables:');
console.log(` - NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(` - RENDER_ENVIRONMENT: ${process.env.RENDER_ENVIRONMENT || 'not set'}`);
console.log(` - SOURCE_DATA_DIR: ${process.env.SOURCE_DATA_DIR || 'not set'}`);
console.log(` - MUGSHOTS_CSV_PATH: ${process.env.MUGSHOTS_CSV_PATH || 'not set'}`);
console.log(` - MUGSHOTS_DB_PATH: ${process.env.MUGSHOTS_DB_PATH || 'not set'}`);

// Log the data directory
console.log(`Using data directory: ${DATA_DIR}`);

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
      
      // Try to create a fallback directory in the project root if we're in production
      if (process.env.NODE_ENV === 'production') {
        const fallbackDir = path.join(process.cwd(), 'temp_data');
        console.log(`Attempting to create fallback directory: ${fallbackDir}`);
        
        try {
          fs.mkdirSync(fallbackDir, { recursive: true });
          console.log(`Created fallback directory: ${fallbackDir}`);
          
          // Update the DATA_DIR to use the fallback
          global.DATA_DIR = fallbackDir;
          return;
        } catch (fallbackError) {
          console.error(`Error creating fallback directory: ${fallbackError.message}`);
          console.warn('Will continue build process, but data files may not be available');
          // Don't exit, let the build continue and handle missing data gracefully
        }
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
    'mugshots.db',
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
    
    // In production, create empty placeholder files instead of failing
    if (process.env.NODE_ENV === 'production') {
      console.warn('Creating empty placeholder files for missing data files in production environment');
      
      missingFiles.forEach(file => {
        try {
          const destPath = path.join(DATA_DIR, file);
          
          // For CSV files, create with header row
          if (file.endsWith('.csv')) {
            fs.writeFileSync(destPath, 'id,name,booking_date,release_date,charges\n');
            console.log(`Created empty CSV placeholder: ${destPath}`);
          }
          // For SQLite DB files, create empty DB
          else if (file.endsWith('.db')) {
            fs.writeFileSync(destPath, '');
            console.log(`Created empty DB placeholder: ${destPath}`);
          }
          // For other files, create empty file
          else {
            fs.writeFileSync(destPath, '');
            console.log(`Created empty placeholder: ${destPath}`);
          }
          
          copiedFiles[file] = true;
        } catch (error) {
          console.error(`Error creating placeholder for ${file}: ${error.message}`);
          // Continue anyway, don't exit
        }
      });
    }
  }
  
  // Check if we have at least some files
  const successCount = Object.values(copiedFiles).filter(Boolean).length;
  if (successCount > 0) {
    console.log(`Successfully copied or created ${successCount} out of ${filesToCopy.length} data files`);
  } else {
    console.warn('No data files were copied or created. Application may not function correctly.');
    // Don't exit, let the build continue
  }
}

// Run the script
copyDataFiles();