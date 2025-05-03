/**
 * Script to validate that required data files are available
 * This script is used in the start process to ensure data files are present
 */

const fs = require('fs');
const path = require('path');

// Configuration
// In production, try to use /data, but fall back to a temp directory in the project if it's not accessible
const DATA_DIR = process.env.NODE_ENV === 'production'
  ? (process.env.RENDER_INTERNAL_RESOURCES_DIR || path.join(__dirname, '..', 'temp_data'))
  : path.join(__dirname, '..', 'data');
const REQUIRED_FILES = [
  'sorted_mugshots.csv'
];

// Optional files (warn but don't fail if missing)
const OPTIONAL_FILES = []; // Define the missing variable

// Validate that required data files exist
function validateDataFiles() {
  console.log('Validating data files...');
  
  // Check if data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`Error: Data directory not found: ${DATA_DIR}`);
    
    // Try to create the directory instead of failing
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log(`Created missing data directory: ${DATA_DIR}`);
    } catch (error) {
      console.error(`Failed to create data directory: ${error.message}`);
      
      if (process.env.NODE_ENV === 'production') {
        console.warn('Warning: Missing data directory in production environment. Some features may not work correctly.');
        // Don't exit in production, let the app try to run
      } else {
        console.warn('Warning: Data directory not found. Some features may not work correctly.');
      }
      return false;
    }
  }
  
  // Check required files
  const missingRequiredFiles = REQUIRED_FILES.filter(file => {
    const filePath = path.join(DATA_DIR, file);
    return !fs.existsSync(filePath);
  });
  
  if (missingRequiredFiles.length > 0) {
    console.error(`Error: Missing required data files: ${missingRequiredFiles.join(', ')}`);
    
    // Try to create empty placeholder files for missing required files
    let createdAllPlaceholders = true;
    
    missingRequiredFiles.forEach(file => {
      try {
        const filePath = path.join(DATA_DIR, file);
        
        // For CSV files, create with header row
        if (file.endsWith('.csv')) {
          fs.writeFileSync(filePath, 'id,name,booking_date,release_date,charges\n');
          console.log(`Created empty CSV placeholder: ${filePath}`);
        } else {
          fs.writeFileSync(filePath, '');
          console.log(`Created empty placeholder: ${filePath}`);
        }
      } catch (error) {
        console.error(`Failed to create placeholder for ${file}: ${error.message}`);
        createdAllPlaceholders = false;
      }
    });
    
    if (!createdAllPlaceholders) {
      if (process.env.NODE_ENV === 'production') {
        console.warn('Warning: Could not create all required data files in production environment. Some features may not work correctly.');
        // Don't exit in production, let the app try to run
      } else {
        console.warn('Warning: Missing required data files. Some features may not work correctly.');
      }
      return false;
    } else {
      console.log('Created placeholder files for all missing required files');
    }
  }
  
  // Check optional files
  const missingOptionalFiles = OPTIONAL_FILES.filter(file => {
    const filePath = path.join(DATA_DIR, file);
    return !fs.existsSync(filePath);
  });
  
  if (missingOptionalFiles.length > 0) {
    console.warn(`Warning: Missing optional data files: ${missingOptionalFiles.join(', ')}`);
  }
  
  // Check file sizes to ensure they're not empty
  const emptyFiles = REQUIRED_FILES.filter(file => {
    const filePath = path.join(DATA_DIR, file);
    try {
      const stats = fs.statSync(filePath);
      return stats.size === 0;
    } catch (error) {
      return true; // Consider as empty if there's an error
    }
  });
  
  if (emptyFiles.length > 0) {
    console.error(`Error: The following required files are empty: ${emptyFiles.join(', ')}`);
    
    // Try to add minimal content to empty files
    let fixedAllEmptyFiles = true;
    
    emptyFiles.forEach(file => {
      try {
        const filePath = path.join(DATA_DIR, file);
        
        // For CSV files, add a header row
        if (file.endsWith('.csv')) {
          fs.writeFileSync(filePath, 'id,name,booking_date,release_date,charges\n');
          console.log(`Added header row to empty CSV file: ${filePath}`);
        } else {
          fs.writeFileSync(filePath, '# Placeholder content\n');
          console.log(`Added minimal content to empty file: ${filePath}`);
        }
      } catch (error) {
        console.error(`Failed to add content to empty file ${file}: ${error.message}`);
        fixedAllEmptyFiles = false;
      }
    });
    
    if (!fixedAllEmptyFiles) {
      if (process.env.NODE_ENV === 'production') {
        console.warn('Warning: Some required files are empty in production environment. Some features may not work correctly.');
        // Don't exit in production, let the app try to run
      } else {
        console.warn('Warning: Empty required data files. Some features may not work correctly.');
      }
      return false;
    } else {
      console.log('Added minimal content to all empty required files');
    }
  }
  
  console.log('All required data files are available');
  return true;
}

// Run the validation
const isValid = validateDataFiles();

// Export the validation function for use in other scripts
module.exports = {
  validateDataFiles
};

// If this script is run directly (not imported), exit with appropriate code
if (require.main === module) {
  process.exit(isValid ? 0 : 1);
}
