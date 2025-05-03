/**
 * Script to validate that required data files are available
 * This script is used in the start process to ensure data files are present
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DATA_DIR = process.env.NODE_ENV === 'production' ? '/data' : path.join(__dirname, '..', 'data');
const REQUIRED_FILES = [
  'sorted_mugshots.csv'
];

// Optional files (warn but don't fail if missing)
const OPTIONAL_FILES = [
  'mugshots.db'  // Legacy SQLite database
];

// Validate that required data files exist
function validateDataFiles() {
  console.log('Validating data files...');
  
  // Check if data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`Error: Data directory not found: ${DATA_DIR}`);
    
    if (process.env.NODE_ENV === 'production') {
      console.error('Critical error: Missing data directory in production environment');
      process.exit(1);
    } else {
      console.warn('Warning: Data directory not found. Some features may not work correctly.');
    }
    return false;
  }
  
  // Check required files
  const missingRequiredFiles = REQUIRED_FILES.filter(file => {
    const filePath = path.join(DATA_DIR, file);
    return !fs.existsSync(filePath);
  });
  
  if (missingRequiredFiles.length > 0) {
    console.error(`Error: Missing required data files: ${missingRequiredFiles.join(', ')}`);
    
    if (process.env.NODE_ENV === 'production') {
      console.error('Critical error: Missing required data files in production environment');
      process.exit(1);
    } else {
      console.warn('Warning: Missing required data files. Some features may not work correctly.');
    }
    return false;
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
    
    if (process.env.NODE_ENV === 'production') {
      console.error('Critical error: Empty required data files in production environment');
      process.exit(1);
    } else {
      console.warn('Warning: Empty required data files. Some features may not work correctly.');
    }
    return false;
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