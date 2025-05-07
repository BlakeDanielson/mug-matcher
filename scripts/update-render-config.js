/**
 * Script to update the Render deployment configuration
 * This script ensures that sorted_mugshots.csv is included in the repository
 * and properly deployed to Render
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DATA_DIR = path.join(__dirname, '..', 'data');
const RENDER_DATA_DIR = '/data';

console.log('Updating Render deployment configuration...');

// Ensure the data directory exists
function ensureDataDirExists() {
  console.log(`Ensuring data directory exists: ${DATA_DIR}`);
  
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log(`Created data directory: ${DATA_DIR}`);
    } catch (error) {
      console.error(`Error creating data directory: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.log(`Data directory already exists: ${DATA_DIR}`);
  }
}

// Create a .gitkeep file in the data directory to ensure it's tracked by git
function createGitKeep() {
  const gitkeepPath = path.join(DATA_DIR, '.gitkeep');
  
  if (!fs.existsSync(gitkeepPath)) {
    try {
      fs.writeFileSync(gitkeepPath, '');
      console.log(`Created .gitkeep file in data directory`);
    } catch (error) {
      console.error(`Error creating .gitkeep file: ${error.message}`);
    }
  }
}

// Create a README.md file in the data directory with instructions
function createReadme() {
  const readmePath = path.join(DATA_DIR, 'README.md');
  const readmeContent = `# Data Directory

This directory contains data files used by the application.

## Important Files

- \`sorted_mugshots.csv\`: Contains the mugshot data used by the application.

## Deployment

When deploying to Render, this directory is copied to the \`${RENDER_DATA_DIR}\` directory.
The application is configured to look for data files in this location.

## Adding or Updating Data Files

To add or update data files:

1. Place the file in this directory
2. Commit the changes to the repository
3. Deploy the application to Render

No manual file transfers are needed after deployment.
`;
  
  try {
    fs.writeFileSync(readmePath, readmeContent);
    console.log(`Created README.md file in data directory`);
  } catch (error) {
    console.error(`Error creating README.md file: ${error.message}`);
  }
}

// Create a symbolic link from /data to the data directory in the repository
// This is for local development to match the Render environment
function createSymbolicLink() {
  // Only attempt this in development environment
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  
  const symlinkSource = DATA_DIR;
  const symlinkTarget = '/data';
  
  // Skip if we don't have permission to create the symlink
  try {
    // Check if /data exists and is not a symlink
    if (fs.existsSync(symlinkTarget) && !fs.lstatSync(symlinkTarget).isSymbolicLink()) {
      console.log(`${symlinkTarget} exists but is not a symlink. Skipping symlink creation.`);
      return;
    }
    
    // Remove existing symlink if it exists
    if (fs.existsSync(symlinkTarget)) {
      fs.unlinkSync(symlinkTarget);
    }
    
    // Create the symlink
    fs.symlinkSync(symlinkSource, symlinkTarget, 'dir');
    console.log(`Created symbolic link from ${symlinkTarget} to ${symlinkSource}`);
  } catch (error) {
    console.log(`Could not create symbolic link (this is normal if not running as administrator): ${error.message}`);
  }
}

// Update .gitignore to ensure data directory is tracked
function updateGitignore() {
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  
  if (!fs.existsSync(gitignorePath)) {
    console.log(`.gitignore file not found. Skipping update.`);
    return;
  }
  
  try {
    let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    
    // Check if data directory is ignored
    if (gitignoreContent.includes('/data/') || gitignoreContent.includes('/data')) {
      // Remove the line that ignores the data directory
      gitignoreContent = gitignoreContent
        .split('\n')
        .filter(line => !line.trim().match(/^\/data\/?$/))
        .join('\n');
      
      // Add a comment explaining why data directory is not ignored
      gitignoreContent += '\n# Data directory is intentionally not ignored to include sorted_mugshots.csv in the repository\n';
      
      // Add specific ignores for data files that should not be tracked
      gitignoreContent += '# Ignore specific data files that should not be tracked\n';
      gitignoreContent += '# /data/sensitive_data.csv\n';
      
      fs.writeFileSync(gitignorePath, gitignoreContent);
      console.log(`Updated .gitignore to track data directory`);
    } else {
      console.log(`Data directory is already not ignored in .gitignore`);
    }
  } catch (error) {
    console.error(`Error updating .gitignore: ${error.message}`);
  }
}

// Run the configuration
ensureDataDirExists();
createGitKeep();
createReadme();
createSymbolicLink();
updateGitignore();

console.log('Render deployment configuration updated successfully');
console.log('');
console.log('Next steps:');
console.log('1. Place sorted_mugshots.csv in the data directory');
console.log('2. Commit the changes to the repository');
console.log('3. Deploy the application to Render');
console.log('');
console.log('The sorted_mugshots.csv file will now be included in the repository');
console.log('and deployed to Render automatically. No manual file transfers needed.');