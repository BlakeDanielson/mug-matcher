/**
 * Wrapper script for starting the application
 * This script validates data files before starting the Next.js server
 */

const { spawn } = require('child_process');
const path = require('path');
const { validateDataFiles } = require('./validate-data');

// Validate data files before starting the application
console.log('Validating data files before starting the application...');
const isValid = validateDataFiles();

if (!isValid && process.env.NODE_ENV === 'production') {
  console.error('Error: Data validation failed. Cannot start the application.');
  process.exit(1);
}

// Start the Next.js server
console.log('Starting Next.js server...');
const nextStart = spawn('node', ['node_modules/next/dist/bin/next', 'start'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '..')
});

// Handle process events
nextStart.on('error', (error) => {
  console.error(`Error starting Next.js server: ${error.message}`);
  process.exit(1);
});

nextStart.on('close', (code) => {
  console.log(`Next.js server exited with code ${code}`);
  process.exit(code);
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  nextStart.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  nextStart.kill('SIGTERM');
});