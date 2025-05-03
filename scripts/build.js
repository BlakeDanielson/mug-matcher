/**
 * Wrapper script for building the application
 * This script copies data files before running the Next.js build
 */

const { spawn } = require('child_process');
const path = require('path');

// First, run the copy-data script to ensure data files are available
console.log('Copying data files for build...');
require('./copy-data');

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
    
    if (!isValid && process.env.NODE_ENV === 'production') {
      console.error('Error: Data validation failed after build.');
      process.exit(1);
    }
    
    console.log('Build process completed successfully');
  } else {
    console.error(`Next.js build failed with code ${code}`);
    process.exit(code);
  }
});