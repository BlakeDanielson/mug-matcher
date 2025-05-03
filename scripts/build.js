/**
 * Wrapper script for building the application
 * This script copies data files before running the Next.js build
 * Note: sorted_mugshots.csv is now transferred manually using the wormhole CLI tool
 * after deployment, not during the build process
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