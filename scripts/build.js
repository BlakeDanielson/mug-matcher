/**
 * Wrapper script for building the application
 * This script downloads and copies data files before running the Next.js build
 * Note: sorted_mugshots.csv is now downloaded automatically during the build process
 * instead of being transferred manually using the wormhole CLI tool after deployment
 */

const { spawn } = require('child_process');
const path = require('path');

// First, download the CSV file from the secure URL
console.log('Downloading CSV file for build...');
const { downloadCsvFile } = require('./download-data');

// Then, run the copy-data script to ensure other data files are available
console.log('Copying data files for build...');
require('./copy-data');

// Run the download process
downloadCsvFile().catch(error => {
  console.error(`Error downloading CSV file: ${error.message}`);
  console.warn('Continuing build process despite download error...');
});

// Then run the Next.js build
console.log('Starting Next.js build...');
const nextBuild = spawn('node', ['node_modules/next/dist/bin/next', 'build'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '..')
});

// Handle process events
nextBuild.on('error', (error) => {
  console.error(`Error during Next.js build: ${error.message}`);
  process.exit(1);
});

nextBuild.on('close', (code) => {
  if (code === 0) {
    console.log('Next.js build completed successfully');
    
    // After successful build, validate the data files
    console.log('Validating data files after build...');
    const { validateDataFiles } = require('./validate-data');
    const isValid = validateDataFiles();
    
    if (!isValid) {
      if (process.env.NODE_ENV === 'production') {
        console.warn('Warning: Data validation failed after build in production environment. Some features may not work correctly.');
        // Continue anyway in production
      } else {
        console.warn('Warning: Data validation failed after build. Some features may not work correctly.');
      }
    }
    
    console.log('Build process completed successfully');
  } else {
    console.error(`Next.js build failed with code ${code}`);
    process.exit(code);
  }
});