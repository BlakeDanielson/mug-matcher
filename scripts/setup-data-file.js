/**
 * Script to help with the initial setup of the sorted_mugshots.csv file
 * This script copies the sorted_mugshots.csv file from a source directory to the data directory
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const DATA_DIR = path.join(__dirname, '..', 'data');
const TARGET_FILE = 'sorted_mugshots.csv';
const TARGET_PATH = path.join(DATA_DIR, TARGET_FILE);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Setup Data File Helper');
console.log('======================');
console.log('');
console.log(`This script will help you set up the ${TARGET_FILE} file in the data directory.`);
console.log(`Target location: ${TARGET_PATH}`);
console.log('');

// Check if the file already exists
if (fs.existsSync(TARGET_PATH)) {
  console.log(`The ${TARGET_FILE} file already exists in the data directory.`);
  rl.question('Do you want to replace it? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      promptForSourcePath();
    } else {
      console.log('Setup cancelled. Existing file will be kept.');
      rl.close();
    }
  });
} else {
  promptForSourcePath();
}

// Prompt the user for the source path
function promptForSourcePath() {
  rl.question('Enter the path to the source sorted_mugshots.csv file: ', (sourcePath) => {
    // Handle relative paths
    if (!path.isAbsolute(sourcePath)) {
      sourcePath = path.resolve(process.cwd(), sourcePath);
    }
    
    // Check if the source file exists
    if (!fs.existsSync(sourcePath)) {
      console.error(`Error: The file at ${sourcePath} does not exist.`);
      rl.question('Do you want to try another path? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
          promptForSourcePath();
        } else {
          console.log('Setup cancelled.');
          rl.close();
        }
      });
      return;
    }
    
    // Copy the file
    try {
      fs.copyFileSync(sourcePath, TARGET_PATH);
      console.log(`Successfully copied ${sourcePath} to ${TARGET_PATH}`);
      
      // Verify the file was copied correctly
      const sourceStats = fs.statSync(sourcePath);
      const targetStats = fs.statSync(TARGET_PATH);
      
      if (sourceStats.size === targetStats.size) {
        console.log('File size verification passed.');
      } else {
        console.warn('Warning: The copied file size does not match the source file size.');
        console.warn(`Source: ${sourceStats.size} bytes, Target: ${targetStats.size} bytes`);
      }
      
      console.log('');
      console.log('Next steps:');
      console.log('1. Commit the changes to the repository');
      console.log('2. Deploy the application to Render');
      console.log('');
      console.log('The sorted_mugshots.csv file will now be included in the repository');
      console.log('and deployed to Render automatically. No manual file transfers needed.');
      
      rl.close();
    } catch (error) {
      console.error(`Error copying file: ${error.message}`);
      rl.question('Do you want to try again? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
          promptForSourcePath();
        } else {
          console.log('Setup cancelled.');
          rl.close();
        }
      });
    }
  });
}

// Handle readline close
rl.on('close', () => {
  console.log('');
  console.log('Setup completed.');
  process.exit(0);
});