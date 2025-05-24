import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Define the CSV inmate data structure
interface CsvInmate {
  InmateID: string;
  Name: string;
  MugshotURL: string;
  Best_Crime: string;
}

// Define the output inmate data structure (matching the existing API)
export interface Inmate {
  id: number;
  name: string;
  image: string;
  crime?: string;
}

// Singleton instance for caching the CSV data
let inmateCache: CsvInmate[] | null = null;

/**
 * Get the path to the CSV file
 * Handles both development and production (Render) environments
 * @returns The resolved path to the CSV file
 * @throws Error if the path cannot be resolved
 */
function getCsvFilePath(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Get the CSV path from environment variable with fallback
  const envPath = process.env.MUGSHOTS_CSV_PATH || 'data/sorted_mugshots.csv';
  
  console.log(`[CSV-DB] Environment: ${isProduction ? 'Production' : 'Development'}`);
  console.log(`[CSV-DB] Current working directory: ${process.cwd()}`);
  console.log(`[CSV-DB] MUGSHOTS_CSV_PATH: ${envPath}`);
  
  // Check if we're in the mug-matcher directory
  const isInMugMatcherDir = process.cwd().endsWith('mug-matcher');
  console.log(`[CSV-DB] Is in mug-matcher directory: ${isInMugMatcherDir}`);
  
  let csvFilePath: string;
  
  if (path.isAbsolute(envPath)) {
    // Use absolute path as-is
    csvFilePath = envPath;
    console.log(`[CSV-DB] Using absolute CSV path: ${csvFilePath}`);
  } else if (isInMugMatcherDir) {
    // We're in the mug-matcher directory, use relative path from current directory
    csvFilePath = path.resolve(process.cwd(), envPath);
    console.log(`[CSV-DB] Using relative CSV path (from mug-matcher dir): ${csvFilePath}`);
  } else {
    // We're not in mug-matcher, assume we need to go up to find it
    csvFilePath = path.resolve(process.cwd(), '..', envPath);
    console.log(`[CSV-DB] Using relative CSV path (from parent dir): ${csvFilePath}`);
  }
  
  return csvFilePath;
}

/**
 * Load and parse the CSV data from the file system
 * This function handles caching and provides detailed error messages
 * @returns Array of CSV inmate records
 * @throws Error with detailed context if loading fails
 */
async function loadCsvData(): Promise<CsvInmate[]> {
  // Return cached data if available
  if (inmateCache) {
    console.log(`[CSV-DB] Using cached data (${inmateCache.length} records)`);
    return inmateCache;
  }

  const csvFilePath = getCsvFilePath();
  console.log(`[CSV-DB] Loading CSV data from: ${csvFilePath}`);
  console.log(`[CSV-DB] Process environment: ${process.env.NODE_ENV || 'development'}`);

  try {
    // Check if the file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`[CSV-DB] CSV file not found at path: ${csvFilePath}`);
      
      const isRenderEnvironment = process.env.RENDER === 'true';
      const isProduction = process.env.NODE_ENV === 'production';
      
      // Provide more helpful error message with potential solutions
      let errorMessage = '';
      
      if (isRenderEnvironment) {
        errorMessage = `CSV file not found at path: ${csvFilePath}. This is a Render deployment issue. Make sure the file exists in the mounted /data directory. The sorted_mugshots.csv file should be transferred manually using the wormhole CLI tool after deployment, not during the build process. Also verify that the MUGSHOTS_CSV_PATH environment variable is correctly set in the Render dashboard.`;
      } else if (isProduction) {
        errorMessage = `CSV file not found at path: ${csvFilePath}. Make sure the file exists in the mounted /data directory. The sorted_mugshots.csv file should be transferred manually using the wormhole CLI tool after deployment. Check that the MUGSHOTS_CSV_PATH environment variable is correctly set.`;
      } else {
        errorMessage = `CSV file not found at path: ${csvFilePath}. Make sure the file exists in the correct location. You can run 'npm run copy-data' to copy the file to the data directory, or use the wormhole CLI tool to transfer it. Check that the MUGSHOTS_CSV_PATH environment variable is correctly set in your .env file.`;
      }
      
      throw new Error(errorMessage);
    }

    // Read the CSV file
    console.log(`[CSV-DB] Reading CSV file content...`);
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    
    if (!fileContent || fileContent.trim().length === 0) {
      console.error(`[CSV-DB] CSV file is empty: ${csvFilePath}`);
      throw new Error(`CSV file is empty at ${csvFilePath}. Make sure the file contains valid data.`);
    }

    // Log a sample of the file content for diagnostics (first 100 chars)
    console.log(`[CSV-DB] CSV file content sample: ${fileContent.substring(0, 100)}...`);
    
    // Parse the CSV data
    console.log(`[CSV-DB] Parsing CSV data...`);
    const parseResult = Papa.parse<CsvInmate>(fileContent, {
      header: true,
      skipEmptyLines: true,
      quoteChar: '"',
      escapeChar: '"',
      delimiter: ',',
      dynamicTyping: true
    });
    
    // Log parsing results
    console.log(`[CSV-DB] CSV parsing complete. Rows found: ${parseResult.data?.length || 0}`);
    
    if (parseResult.errors && parseResult.errors.length > 0) {
      console.warn(`[CSV-DB] CSV parsing had ${parseResult.errors.length} errors:`,
        parseResult.errors.map(e => `Row ${e.row}: ${e.message}`).join('; '));
    }
    
    if (!parseResult.data || parseResult.data.length === 0) {
      console.error(`[CSV-DB] No valid data found in CSV file: ${csvFilePath}`);
      throw new Error(`No valid data found in CSV file: ${csvFilePath}. The file may be corrupted or have an invalid format.`);
    }
    
    // Validate the data structure
    const firstRecord = parseResult.data[0];
    const hasRequiredFields = firstRecord &&
                             'InmateID' in firstRecord &&
                              'Name' in firstRecord &&
                              'MugshotURL' in firstRecord &&
                              'Best_Crime' in firstRecord;
    
    if (!hasRequiredFields) {
      console.error(`[CSV-DB] CSV data is missing required fields. Expected InmateID, Name, MugshotURL, Best_Crime. Found fields: ${Object.keys(firstRecord || {}).join(', ')}`);
      throw new Error(`CSV data is missing required fields (expected InmateID, Name, MugshotURL, Best_Crime). The file format may be incorrect.`);
    }

    // Cache the data
    inmateCache = parseResult.data;
    console.log(`[CSV-DB] Successfully loaded ${inmateCache.length} inmates from CSV at ${csvFilePath}`);
    
    return inmateCache;
  } catch (error) {
    console.error(`[CSV-DB] Error loading CSV data:`, error);
    
    // Create a more detailed error message
    const errorDetails = error instanceof Error
      ? `${error.name}: ${error.message}`
      : String(error);
    
    throw new Error(`Failed to load inmate data from CSV: ${errorDetails}`);
  }
}

/**
 * Normalize a crime description for comparison
 * Removes common words and normalizes the text to help identify similar crimes
 */
function normalizeCrime(crime: string): string {
  return crime
    .toLowerCase()
    .replace(/\s+(possession|with\s+intent\s+to\s+distribute|trafficking|delivery|of|and|&)\s+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Static list of restricted words - only one crime containing each word can appear per batch
 * Add or remove words from this list to control crime filtering
 */
const RESTRICTED_CRIME_WORDS = [
  'murder',
  'homicide', 
  'manslaughter',
  'killing',
  'sexual',
  'rape',
  'molestation',
  'robbery',
  'burglary',
  'assault',
  'battery',
  'carjacking',
  'cocaine',
  'marijuana',
  'heroin',
  'methamphetamine',
  'fentanyl',
  'weapon',
  'gun',
  'firearm',
  'trafficking',
  'theft',
  'stealing',
  'larceny'
];

/**
 * Check if two crimes share any restricted words
 * Returns true if they should be considered duplicates (share a restricted word)
 */
function areCrimesSimilar(crime1: string, crime2: string): boolean {
  const normalized1 = normalizeCrime(crime1);
  const normalized2 = normalizeCrime(crime2);
  
  // Exact match check
  if (normalized1 === normalized2) {
    return true;
  }
  
  // Check if both crimes contain any of the same restricted words
  for (const restrictedWord of RESTRICTED_CRIME_WORDS) {
    const crime1HasWord = normalized1.includes(restrictedWord);
    const crime2HasWord = normalized2.includes(restrictedWord);
    
    if (crime1HasWord && crime2HasWord) {
      console.log(`[CSV-DB] Crimes share restricted word "${restrictedWord}": "${crime1}" vs "${crime2}"`);
      return true;
    }
  }
  
  return false;
}

/**
 * Get a list of inmates with their primary charge, ensuring unique crime types
 * @param limit Maximum number of inmates to return
 * @returns Array of inmate objects with unique crime types
 * @throws Error if inmates cannot be loaded
 */
export async function getInmates(limit = 10): Promise<Inmate[]> {
  console.log(`[CSV-DB] Fetching ${limit} inmates with unique crimes...`);
  
  try {
    const startTime = Date.now();
    const inmates = await loadCsvData();
    console.log(`[CSV-DB] Loaded ${inmates.length} total inmates in ${Date.now() - startTime}ms`);
    
    // Shuffle the inmates to get random ones (similar to ORDER BY RANDOM() in SQLite)
    const shuffledInmates = [...inmates].sort(() => Math.random() - 0.5);
    
    // Helper function to process crime text
    const processCrime = (crimeBest: string): string => {
      let crime = crimeBest ? crimeBest.trim() : 'Unknown charge';
      
      // If there are multiple crimes separated by " | ", only take the first one
      if (crime.includes(' | ')) {
        crime = crime.split(' | ')[0].trim();
      }
      
      return crime;
    };
    
    // Select inmates with unique crimes
    const selectedInmates: CsvInmate[] = [];
    const usedCrimes: string[] = [];
    
    for (const inmate of shuffledInmates) {
      if (selectedInmates.length >= limit) {
        break;
      }
      
      const processedCrime = processCrime(inmate.Best_Crime);
      
      // Check if this crime is too similar to any we've already selected
      const isSimilar = usedCrimes.some(existingCrime => 
        areCrimesSimilar(processedCrime, existingCrime)
      );
      
      if (!isSimilar) {
        selectedInmates.push(inmate);
        usedCrimes.push(processedCrime);
        console.log(`[CSV-DB] Selected inmate ${inmate.InmateID} with unique crime: "${processedCrime}"`);
      } else {
        console.log(`[CSV-DB] Skipped inmate ${inmate.InmateID} with similar crime: "${processedCrime}"`);
      }
    }
    
    console.log(`[CSV-DB] Selected ${selectedInmates.length} inmates with unique crimes`);
    
    // Map the CSV data to the expected output format
    const mappedInmates = selectedInmates.map(inmate => {
      const crime = processCrime(inmate.Best_Crime);
      
      // Parse the inmate ID, with fallback for invalid values
      let id: number;
      try {
        id = parseInt(inmate.InmateID, 10);
        if (isNaN(id)) {
          console.warn(`[CSV-DB] Invalid InmateID: ${inmate.InmateID}, using fallback ID`);
          id = Math.floor(Math.random() * 10000); // Fallback ID
        }
      } catch {
        console.warn(`[CSV-DB] Error parsing InmateID: ${inmate.InmateID}, using fallback ID`);
        id = Math.floor(Math.random() * 10000); // Fallback ID
      }
      
      return {
        id,
        name: (inmate.Name || 'Unknown').replace(/"/g, ''), // Remove quotes from names
        image: inmate.MugshotURL || '',
        crime: crime
      };
    });
    
    console.log(`[CSV-DB] Successfully mapped ${mappedInmates.length} inmates to the output format`);
    return mappedInmates;
  } catch (error) {
    console.error(`[CSV-DB] Error fetching inmates from CSV:`, error);
    
    // Create a more detailed error message
    const errorDetails = error instanceof Error
      ? `${error.name}: ${error.message}`
      : String(error);
    
    throw new Error(`Failed to fetch inmates: ${errorDetails}`);
  }
}

/**
 * Get a random inmate from the dataset
 * @returns A single random inmate
 * @throws Error if inmates cannot be loaded
 */
export async function getRandomInmate(): Promise<Inmate> {
  console.log(`[CSV-DB] Fetching a random inmate...`);
  const inmates = await getInmates(1);
  console.log(`[CSV-DB] Successfully fetched random inmate: ID ${inmates[0]?.id}`);
  return inmates[0];
}

/**
 * Clear the inmate cache
 * Useful for testing or when the CSV file changes
 */
export function clearCache(): void {
  const previousSize = inmateCache?.length || 0;
  inmateCache = null;
  console.log(`[CSV-DB] Inmate cache cleared (previously had ${previousSize} records)`);
}

/**
 * Get diagnostic information about the CSV database
 * Useful for troubleshooting deployment issues
 * @returns Object with diagnostic information
 */
export function getDiagnostics(): Record<string, unknown> {
  const isRenderEnvironment = process.env.RENDER === 'true';
  const isProduction = process.env.NODE_ENV === 'production';
  
  try {
    const csvPath = process.env.MUGSHOTS_CSV_PATH || 'not set';
    const resolvedPath = getCsvFilePath();
    const fileExists = fs.existsSync(resolvedPath);
    const fileStats = fileExists ? fs.statSync(resolvedPath) : null;
    const cacheSize = inmateCache?.length || 0;
    
    return {
      environment: {
        isRender: isRenderEnvironment,
        isProduction,
        nodeEnv: process.env.NODE_ENV,
        cwd: process.cwd(),
        platform: process.platform,
        nodeVersion: process.version
      },
      csvFile: {
        configuredPath: csvPath,
        resolvedPath,
        exists: fileExists,
        sizeBytes: fileStats?.size || 0,
        lastModified: fileStats?.mtime?.toISOString() || null
      },
      cache: {
        hasData: !!inmateCache,
        recordCount: cacheSize
      }
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      environment: {
        isRender: isRenderEnvironment,
        isProduction,
        nodeEnv: process.env.NODE_ENV
      }
    };
  }
}
