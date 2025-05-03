import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Define the CSV inmate data structure
interface CsvInmate {
  InmateID: string;
  Name: string;
  MugshotURL: string;
  Description: string;
  // The Description field may contain pipe-delimited values
  // Other fields are available but not needed for our implementation
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
 */
function getCsvFilePath(): string {
  const envPath = process.env.MUGSHOTS_CSV_PATH;
  
  if (!envPath) {
    throw new Error('MUGSHOTS_CSV_PATH environment variable is not set. Please check your .env file.');
  }
  
  // If the path is absolute (like in Render production: /data/sorted_mugshots.csv), use it directly
  if (path.isAbsolute(envPath)) {
    console.log(`Using absolute CSV path: ${envPath}`);
    return envPath;
  }
  
  // In development, resolve relative paths based on the environment
  const isInMugMatcherDir = process.cwd().endsWith('mug-matcher');
  
  // If we're already in the mug-matcher directory, don't add it to the path
  if (isInMugMatcherDir) {
    const resolvedPath = path.resolve(process.cwd(), envPath);
    console.log(`Using relative CSV path (from mug-matcher dir): ${resolvedPath}`);
    return resolvedPath;
  } else {
    // If we're in the parent directory, add mug-matcher to the path
    const resolvedPath = path.resolve(process.cwd(), 'mug-matcher', envPath);
    console.log(`Using relative CSV path (from parent dir): ${resolvedPath}`);
    return resolvedPath;
  }
}

/**
 * Load and parse the CSV file
 * This is only done once and then cached
 */
async function loadCsvData(): Promise<CsvInmate[]> {
  // Return cached data if available
  if (inmateCache) {
    return inmateCache;
  }

  const csvFilePath = getCsvFilePath();
  
  // === DEBUGGING: Log the path being checked ===
  console.log(`[DEBUG] Checking for CSV at path: ${csvFilePath}`);
  // ============================================

  try {
    // Check if the file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`CSV file not found at path: ${csvFilePath}`);
      
      // Provide more helpful error message with potential solutions
      const isRenderEnvironment = process.env.RENDER_ENVIRONMENT === 'true';
      let errorMessage = '';
      
      if (isRenderEnvironment) {
        errorMessage = `CSV file not found at path: ${csvFilePath}. This is a Render deployment issue. Make sure the file exists in the mounted /data directory. The copy-data script should run during the build process. Check the build logs for any errors during the copy-data script execution.`;
      } else if (process.env.NODE_ENV === 'production') {
        errorMessage = `CSV file not found at path: ${csvFilePath}. Make sure the file exists in the mounted /data directory. You may need to run the copy-data script during deployment.`;
      } else {
        errorMessage = `CSV file not found at path: ${csvFilePath}. Make sure the file exists in the correct location. You can run 'npm run copy-data' to copy the file to the data directory.`;
      }
      
      throw new Error(errorMessage);
    }

    // Read the CSV file
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    
    if (!fileContent || fileContent.trim().length === 0) {
      console.error('CSV file is empty');
      
      // Provide more helpful error message with potential solutions
      const isRenderEnvironment = process.env.RENDER_ENVIRONMENT === 'true';
      const errorMessage = isRenderEnvironment
        ? 'CSV file is empty. This is a Render deployment issue. The copy-data script may have created an empty placeholder file. Check the build logs for any errors during the copy-data script execution.'
        : process.env.NODE_ENV === 'production'
        ? 'CSV file is empty. Make sure the file contains valid data. You may need to run the copy-data script during deployment.'
        : 'CSV file is empty. Make sure the file contains valid data. You can run \'npm run copy-data\' to copy the file to the data directory.';
      
      throw new Error(errorMessage);
    }
    
    // Parse the CSV data
    const parseResult = Papa.parse<CsvInmate>(fileContent, {
      header: true,
      skipEmptyLines: true,
      quoteChar: '"',
      escapeChar: '"',
      delimiter: ',',
      dynamicTyping: true
    });
    
    if (parseResult.errors && parseResult.errors.length > 0) {
      console.warn('CSV parsing had some errors:', parseResult.errors);
    }
    
    if (!parseResult.data || parseResult.data.length === 0) {
      console.error('No valid data found in CSV file');
      throw new Error('No valid data found in CSV file');
    }
    
    // Cache the data
    inmateCache = parseResult.data;
    console.log(`Loaded ${inmateCache.length} inmates from CSV at ${csvFilePath}`);
    
    return inmateCache as CsvInmate[];
  } catch (error) {
    console.error('Error loading CSV data:', error);
    throw new Error(`Failed to load inmate data from CSV: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get a list of inmates with their primary charge
 * @param limit Maximum number of inmates to return
 * @returns Array of inmate objects
 */
export async function getInmates(limit = 10): Promise<Inmate[]> {
  try {
    const inmates = await loadCsvData();
    
    // Shuffle the inmates to get random ones (similar to ORDER BY RANDOM() in SQLite)
    const shuffledInmates = [...inmates].sort(() => Math.random() - 0.5);
    
    // Take only the requested number of inmates
    const limitedInmates = shuffledInmates.slice(0, limit);
    
    // Map the CSV data to the expected output format
    return limitedInmates.map(inmate => {
      // The Description field may contain pipe-delimited values, take the first one
      const crime = inmate.Description ?
        inmate.Description.split('|')[0].trim() :
        'Unknown charge';
        
      return {
        id: parseInt(inmate.InmateID, 10),
        name: inmate.Name.replace(/"/g, ''), // Remove quotes from names
        image: inmate.MugshotURL,
        crime: crime
      };
    });
  } catch (error) {
    console.error('Error fetching inmates from CSV:', error);
    throw error;
  }
}

/**
 * Get a random inmate from the dataset
 * @returns A single random inmate
 */
export async function getRandomInmate(): Promise<Inmate> {
  const inmates = await getInmates(1);
  return inmates[0];
}

/**
 * Clear the inmate cache
 * Useful for testing or when the CSV file changes
 */
export function clearCache(): void {
  inmateCache = null;
  console.log('Inmate cache cleared');
}