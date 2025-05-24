const { getInmates } = require('../lib/csv-database.ts');

/**
 * Test the new crime filtering logic
 */
async function testCrimeFiltering() {
  console.log('Testing new word-based crime filtering...\n');
  
  try {
    // Get a batch of 6 inmates
    const inmates = await getInmates(6);
    
    console.log(`Retrieved ${inmates.length} inmates:\n`);
    
    // Display each inmate and their crime
    inmates.forEach((inmate, index) => {
      console.log(`${index + 1}. ${inmate.name} - "${inmate.crime}"`);
    });
    
    console.log('\n--- Analysis ---');
    
    // Check for restricted words in each crime
    const RESTRICTED_WORDS = [
      'murder', 'homicide', 'manslaughter', 'killing',
      'sexual', 'rape', 'molestation',
      'robbery', 'burglary', 'assault', 'battery',
      'carjacking', 'cocaine', 'marijuana', 'heroin', 
      'methamphetamine', 'fentanyl', 'weapon', 'gun', 
      'firearm', 'trafficking', 'theft', 'stealing', 'larceny'
    ];
    
    const foundWords = new Map();
    
    inmates.forEach((inmate, index) => {
      const crime = inmate.crime.toLowerCase();
      const wordsInThisCrime = [];
      
      RESTRICTED_WORDS.forEach(word => {
        if (crime.includes(word)) {
          wordsInThisCrime.push(word);
          
          if (foundWords.has(word)) {
            console.log(`⚠️  DUPLICATE DETECTED: Word "${word}" appears in multiple crimes!`);
            console.log(`   Previous: ${foundWords.get(word)}`);
            console.log(`   Current: ${inmate.crime}`);
          } else {
            foundWords.set(word, inmate.crime);
          }
        }
      });
      
      if (wordsInThisCrime.length > 0) {
        console.log(`${index + 1}. Contains restricted words: [${wordsInThisCrime.join(', ')}]`);
      } else {
        console.log(`${index + 1}. No restricted words found`);
      }
    });
    
    console.log(`\nTotal unique restricted words found: ${foundWords.size}`);
    console.log('Restricted words in this batch:', Array.from(foundWords.keys()));
    
    // Test multiple runs
    console.log('\n--- Testing Multiple Batches ---');
    for (let i = 1; i <= 3; i++) {
      console.log(`\nBatch ${i}:`);
      const batch = await getInmates(6);
      const batchWords = new Set();
      
      batch.forEach(inmate => {
        const crime = inmate.crime.toLowerCase();
        RESTRICTED_WORDS.forEach(word => {
          if (crime.includes(word)) {
            if (batchWords.has(word)) {
              console.log(`⚠️  DUPLICATE in batch ${i}: "${word}" appears multiple times!`);
            }
            batchWords.add(word);
          }
        });
      });
      
      batch.forEach((inmate, idx) => {
        console.log(`  ${idx + 1}. ${inmate.name.substring(0, 20).padEnd(20)} - ${inmate.crime}`);
      });
      
      console.log(`  Restricted words: [${Array.from(batchWords).join(', ')}]`);
    }
    
  } catch (error) {
    console.error('Error testing crime filtering:', error);
  }
}

// Run the test
testCrimeFiltering(); 