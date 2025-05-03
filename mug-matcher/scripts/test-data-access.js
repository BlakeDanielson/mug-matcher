/**
 * Test script to verify data file access
 * This script tests whether the application can access the sorted_mugshots.csv file
 * in both development and simulated production environments
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DEV_DATA_DIR = path.join(__dirname, '..', 'data');
const PROD_DATA_DIR = '/data';
const TARGET_FILE = 'sorted_mugshots.csv';

console.log('Testing Data File Access');
console.log('=======================');
console.log('');

// Test development environment
console.log('Testing development environment:');
const devFilePath = path.join(DEV_DATA_DIR, TARGET_FILE);
testFileAccess(devFilePath, 'Development');

// Test production environment (simulated)
console.log('\nTesting production environment (simulated):');
const prodFilePath = path.join(PROD_DATA_DIR, TARGET_FILE);
testFileAccess(prodFilePath, 'Production');

// Function to test file access
function testFileAccess(filePath, environment) {
  console.log(`Checking ${environment} file path: ${filePath}`);
  
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`✅ File exists (${stats.size} bytes)`);
      
      // Test file readability
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.split('\n');
        console.log(`✅ File is readable (${lines.length} lines)`);
        
        // Check if file has content
        if (lines.length > 1) {
          console.log(`✅ File has content (first line: ${lines[0]})`);
        } else {
          console.log(`❌ File appears to be empty or has only one line`);
        }
      } catch (readError) {
        console.log(`❌ File exists but cannot be read: ${readError.message}`);
      }
    } else {
      console.log(`❌ File does not exist`);
      
      // Check if directory exists
      const dirPath = path.dirname(filePath);
      if (fs.existsSync(dirPath)) {
        console.log(`✅ Directory exists: ${dirPath}`);
        console.log(`ℹ️ Available files in directory:`);
        try {
          const files = fs.readdirSync(dirPath);
          if (files.length === 0) {
            console.log(`   (none)`);
          } else {
            files.forEach(file => {
              const fileStat = fs.statSync(path.join(dirPath, file));
              console.log(`   - ${file} (${fileStat.size} bytes)`);
            });
          }
        } catch (readDirError) {
          console.log(`❌ Cannot read directory: ${readDirError.message}`);
        }
      } else {
        console.log(`❌ Directory does not exist: ${dirPath}`);
      }
    }
  } catch (error) {
    console.log(`❌ Error checking file: ${error.message}`);
  }
}

// Provide recommendations based on test results
console.log('\nRecommendations:');
console.log('1. If the development environment test passed but production failed, this is expected');
console.log('   when running locally. The production test will pass when deployed to Render.');
console.log('2. If both tests failed, ensure you have placed the sorted_mugshots.csv file in the');
console.log('   data directory using the setup-data-file script:');
console.log('   npm run setup-data-file');
console.log('3. If you need to update the Render configuration, run:');
console.log('   npm run update-render-config');