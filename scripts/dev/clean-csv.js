const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

/**
 * Clean the sorted_mugshots.csv file by removing rows without MugshotURL values and duplicate InmateIDs
 */
async function cleanCsvFile() {
  const csvPath = path.join(__dirname, '../data/sorted_mugshots.csv');
  const backupPath = path.join(__dirname, '../data/sorted_mugshots_backup.csv');
  
  console.log('Starting CSV cleanup process...');
  console.log(`Reading CSV file: ${csvPath}`);
  
  try {
    // Create backup of original file
    console.log('Creating backup of original file...');
    fs.copyFileSync(csvPath, backupPath);
    console.log(`Backup created: ${backupPath}`);
    
    // Read the CSV file
    const fileContent = fs.readFileSync(csvPath, 'utf8');
    console.log(`File size: ${Math.round(fileContent.length / 1024 / 1024 * 100) / 100} MB`);
    
    // Parse the CSV
    console.log('Parsing CSV data...');
    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      quoteChar: '"',
      escapeChar: '"',
      delimiter: ','
    });
    
    if (parseResult.errors && parseResult.errors.length > 0) {
      console.warn(`Parsing had ${parseResult.errors.length} errors:`, parseResult.errors.slice(0, 5));
    }
    
    const originalData = parseResult.data;
    console.log(`Original record count: ${originalData.length}`);
    
    // Step 1: Filter out rows without MugshotURL
    console.log('\nStep 1: Removing rows without MugshotURL...');
    const dataWithUrls = originalData.filter(row => {
      const mugshotUrl = row.MugshotURL;
      const hasUrl = mugshotUrl && mugshotUrl.trim() !== '' && mugshotUrl !== 'null' && mugshotUrl !== 'undefined';
      
      if (!hasUrl) {
        console.log(`Removing row (no URL) - InmateID: ${row.InmateID}, Name: ${row.Name}, MugshotURL: "${mugshotUrl}"`);
      }
      
      return hasUrl;
    });
    
    const removedNoUrl = originalData.length - dataWithUrls.length;
    console.log(`Removed ${removedNoUrl} rows without MugshotURL`);
    console.log(`Records after URL cleanup: ${dataWithUrls.length}`);
    
    // Step 2: Remove duplicate InmateIDs (keep first occurrence)
    console.log('\nStep 2: Removing duplicate InmateIDs...');
    const seenInmateIds = new Set();
    const duplicateIds = new Set();
    
    // First pass: identify duplicates
    dataWithUrls.forEach(row => {
      const inmateId = row.InmateID;
      if (seenInmateIds.has(inmateId)) {
        duplicateIds.add(inmateId);
      } else {
        seenInmateIds.add(inmateId);
      }
    });
    
    console.log(`Found ${duplicateIds.size} InmateIDs with duplicates`);
    
    // Second pass: keep only first occurrence of each InmateID
    const processedIds = new Set();
    const cleanedData = dataWithUrls.filter(row => {
      const inmateId = row.InmateID;
      
      if (processedIds.has(inmateId)) {
        // This is a duplicate
        console.log(`Removing duplicate - InmateID: ${inmateId}, Name: ${row.Name}`);
        return false;
      } else {
        // First occurrence, keep it
        processedIds.add(inmateId);
        return true;
      }
    });
    
    const removedDuplicates = dataWithUrls.length - cleanedData.length;
    console.log(`Removed ${removedDuplicates} duplicate InmateID entries`);
    console.log(`Final record count: ${cleanedData.length}`);
    
    // Convert back to CSV
    console.log('\nConverting cleaned data back to CSV...');
    const csvOutput = Papa.unparse(cleanedData, {
      header: true,
      quoteChar: '"',
      escapeChar: '"',
      delimiter: ','
    });
    
    // Write the cleaned CSV
    console.log('Writing cleaned CSV file...');
    fs.writeFileSync(csvPath, csvOutput, 'utf8');
    
    console.log('\n=== CSV CLEANUP COMPLETED SUCCESSFULLY! ===');
    console.log(`Original file backed up to: ${backupPath}`);
    console.log(`Cleaned file written to: ${csvPath}`);
    console.log(`\nSummary:`);
    console.log(`- Original records: ${originalData.length}`);
    console.log(`- Records removed (no MugshotURL): ${removedNoUrl}`);
    console.log(`- Records removed (duplicate InmateID): ${removedDuplicates}`);
    console.log(`- Total records removed: ${originalData.length - cleanedData.length}`);
    console.log(`- Final records remaining: ${cleanedData.length}`);
    
    // Show breakdown of removed records
    const removedRecords = originalData.filter(row => {
      const mugshotUrl = row.MugshotURL;
      return !(mugshotUrl && mugshotUrl.trim() !== '' && mugshotUrl !== 'null' && mugshotUrl !== 'undefined');
    });
    
    const emptyUrls = removedRecords.filter(row => !row.MugshotURL || row.MugshotURL.trim() === '').length;
    const nullUrls = removedRecords.filter(row => row.MugshotURL === 'null' || row.MugshotURL === 'undefined').length;
    const otherUrls = removedRecords.length - emptyUrls - nullUrls;
    
    console.log('\nBreakdown of URL-related removals:');
    console.log(`- Empty/missing URLs: ${emptyUrls}`);
    console.log(`- Null/undefined URLs: ${nullUrls}`);
    console.log(`- Other invalid URLs: ${otherUrls}`);
    
    if (duplicateIds.size > 0) {
      console.log('\nDuplicate InmateIDs found (showing first 10):');
      Array.from(duplicateIds).slice(0, 10).forEach(id => {
        const count = dataWithUrls.filter(row => row.InmateID === id).length;
        console.log(`- InmateID ${id}: ${count} occurrences`);
      });
      
      if (duplicateIds.size > 10) {
        console.log(`... and ${duplicateIds.size - 10} more duplicate IDs`);
      }
    }
    
  } catch (error) {
    console.error('Error processing CSV file:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanCsvFile(); 