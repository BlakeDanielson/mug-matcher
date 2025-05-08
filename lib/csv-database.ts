import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Define the CSV inmate data structure
interface CsvInmate {
  InmateID: string;
  Name: string;
  MugshotURL: string;
  AI_Description_Explanation: string; // Changed from Description
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
/**
 * Get the path to the CSV file
 * Handles both development and production (Render) environments
 * @returns The resolved path to the CSV file
 * @throws Error if the path cannot be resolved
 */
function getCsvFilePath(): string {
  const envPath = process.env.MUGSHOTS_CSV_PATH;
  const isRenderEnvironment = process.env.RENDER === 'true';
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Log environment information for diagnostics
  console.log(`[CSV-DB] Environment: ${isRenderEnvironment ? 'Render' : isProduction ? 'Production' : 'Development'}`);
  console.log(`[CSV-DB] Current working directory: ${process.cwd()}`);
  console.log(`[CSV-DB] MUGSHOTS_CSV_PATH: ${envPath || 'not set'}`);
  
  if (!envPath) {
    throw new Error('MUGSHOTS_CSV_PATH environment variable is not set. Please check your .env file.');
  }
  
  // If the path is absolute (like in Render production: /data/sorted_mugshots.csv), use it directly
  if (path.isAbsolute(envPath)) {
    console.log(`[CSV-DB] Using absolute CSV path: ${envPath}`);
    
    // In production/Render, verify the /data directory exists if that's where we're looking
    if (isRenderEnvironment && envPath.startsWith('/data')) {
      try {
        const dataDir = '/data';
        const dataExists = fs.existsSync(dataDir);
        const dataStats = dataExists ? fs.statSync(dataDir) : null;
        console.log(`[CSV-DB] /data directory exists: ${dataExists}`);
        if (dataStats) {
          console.log(`[CSV-DB] /data directory permissions: ${dataStats.mode.toString(8)}`);
          console.log(`[CSV-DB] /data directory is directory: ${dataStats.isDirectory()}`);
          
          // List files in /data directory for diagnostics
          try {
            const files = fs.readdirSync(dataDir);
            console.log(`[CSV-DB] Files in /data directory: ${files.join(', ') || 'none'}`);
          } catch (err) {
            console.error(`[CSV-DB] Error reading /data directory: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
      } catch (err) {
        console.error(`[CSV-DB] Error checking /data directory: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    
    return envPath;
  }
  
  // In development, resolve relative paths based on the environment
  const isInMugMatcherDir = process.cwd().endsWith('mug-matcher');
  console.log(`[CSV-DB] Is in mug-matcher directory: ${isInMugMatcherDir}`);
  
  let resolvedPath: string;
  
  // If we're already in the mug-matcher directory, don't add it to the path
  if (isInMugMatcherDir) {
    resolvedPath = path.resolve(process.cwd(), envPath);
    console.log(`[CSV-DB] Using relative CSV path (from mug-matcher dir): ${resolvedPath}`);
  } else {
    // If we're in the parent directory, add mug-matcher to the path
    resolvedPath = path.resolve(process.cwd(), 'mug-matcher', envPath);
    console.log(`[CSV-DB] Using relative CSV path (from parent dir): ${resolvedPath}`);
  }
  
  // Log the directory structure around the resolved path for diagnostics
  try {
    const dirPath = path.dirname(resolvedPath);
    if (fs.existsSync(dirPath)) {
      console.log(`[CSV-DB] Parent directory exists: ${dirPath}`);
      const files = fs.readdirSync(dirPath);
      console.log(`[CSV-DB] Files in parent directory: ${files.join(', ') || 'none'}`);
    } else {
      console.log(`[CSV-DB] Parent directory does not exist: ${dirPath}`);
    }
  } catch (err) {
    console.error(`[CSV-DB] Error checking parent directory: ${err instanceof Error ? err.message : String(err)}`);
  }
  
  return resolvedPath;
}

/**
 * Load and parse the CSV file
 * This is only done once and then cached
 */
/**
 * Load and parse the CSV file
 * This is only done once and then cached
 * @returns Promise resolving to the parsed CSV data
 * @throws Error if the CSV file cannot be loaded or parsed
 */
async function loadCsvData(): Promise<CsvInmate[]> {
  // Return cached data if available
  if (inmateCache) {
    console.log(`[CSV-DB] Using cached data (${inmateCache.length} records)`);
    return inmateCache;
  }

  const csvFilePath = getCsvFilePath();
  const isRenderEnvironment = process.env.RENDER === 'true';
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log(`[CSV-DB] Loading CSV data from: ${csvFilePath}`);
  console.log(`[CSV-DB] Process environment: ${isRenderEnvironment ? 'Render' : isProduction ? 'Production' : 'Development'}`);

  try {
    // Check if the file exists and log file stats
    if (!fs.existsSync(csvFilePath)) {
      console.error(`[CSV-DB] CSV file not found at path: ${csvFilePath}`);
      
      // Check for file system permissions issues
      try {
        const dirPath = path.dirname(csvFilePath);
        if (fs.existsSync(dirPath)) {
          const dirStats = fs.statSync(dirPath);
          console.log(`[CSV-DB] Parent directory exists: ${dirPath}`);
          console.log(`[CSV-DB] Parent directory permissions: ${dirStats.mode.toString(8)}`);
          console.log(`[CSV-DB] Parent directory is directory: ${dirStats.isDirectory()}`);
          
          // List files in the directory
          try {
            const files = fs.readdirSync(dirPath);
            console.log(`[CSV-DB] Files in parent directory: ${files.join(', ') || 'none'}`);
          } catch (readErr) {
            console.error(`[CSV-DB] Error reading parent directory: ${readErr instanceof Error ? readErr.message : String(readErr)}`);
          }
        } else {
          console.error(`[CSV-DB] Parent directory does not exist: ${dirPath}`);
        }
      } catch (statErr) {
        console.error(`[CSV-DB] Error checking parent directory: ${statErr instanceof Error ? statErr.message : String(statErr)}`);
      }
      
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

    // Log file stats for diagnostics
    try {
      const fileStats = fs.statSync(csvFilePath);
      console.log(`[CSV-DB] CSV file size: ${fileStats.size} bytes`);
      console.log(`[CSV-DB] CSV file permissions: ${fileStats.mode.toString(8)}`);
      console.log(`[CSV-DB] CSV file last modified: ${fileStats.mtime}`);
    } catch (statErr) {
      console.error(`[CSV-DB] Error getting file stats: ${statErr instanceof Error ? statErr.message : String(statErr)}`);
    }

    // Read the CSV file
    console.log(`[CSV-DB] Reading CSV file content...`);
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    
    if (!fileContent || fileContent.trim().length === 0) {
      console.error(`[CSV-DB] CSV file is empty: ${csvFilePath}`);
      
      // Provide more helpful error message with potential solutions
      const errorMessage = isRenderEnvironment
        ? `CSV file is empty at ${csvFilePath}. This is a Render deployment issue. The file may not have been properly transferred using the wormhole CLI tool. Verify that the source data file exists and has content, and that the wormhole transfer completed successfully.`
        : isProduction
        ? `CSV file is empty at ${csvFilePath}. Make sure the file contains valid data. The sorted_mugshots.csv file should be transferred manually using the wormhole CLI tool after deployment. Verify that the source data file exists and has content, and that the wormhole transfer completed successfully.`
        : `CSV file is empty at ${csvFilePath}. Make sure the file contains valid data. You can run 'npm run copy-data' to copy the file to the data directory or use the wormhole CLI tool to transfer it. Verify that the source data file exists and has content.`;
      
      throw new Error(errorMessage);
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
    console.log(`[CSV-DB] CSV parsing meta: ${JSON.stringify({
      delimiter: parseResult.meta.delimiter,
      linebreak: parseResult.meta.linebreak,
      aborted: parseResult.meta.aborted,
      truncated: parseResult.meta.truncated,
      fields: parseResult.meta.fields?.join(', ')
    })}`);
    
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
                              'AI_Description_Explanation' in firstRecord; // Changed from Description
    
    if (!hasRequiredFields) {
      console.error(`[CSV-DB] CSV data is missing required fields. Expected InmateID, Name, MugshotURL, AI_Description_Explanation. Found fields: ${Object.keys(firstRecord || {}).join(', ')}`);
      throw new Error(`CSV data is missing required fields (expected InmateID, Name, MugshotURL, AI_Description_Explanation). The file format may be incorrect.`);
    }

    // Cache the data
    inmateCache = parseResult.data;
    console.log(`[CSV-DB] Successfully loaded ${inmateCache.length} inmates from CSV at ${csvFilePath}`);
    
    // Log a sample record for diagnostics (without sensitive data)
    if (inmateCache.length > 0) {
      const sampleRecord = { ...inmateCache[0] };
      console.log(`[CSV-DB] Sample record: ${JSON.stringify({
        InmateID: sampleRecord.InmateID,
        HasName: !!sampleRecord.Name,
        HasMugshotURL: !!sampleRecord.MugshotURL,
        HasAIDescription: !!sampleRecord.AI_Description_Explanation // Changed from Description
      })}`);
    }
    
    return inmateCache as CsvInmate[];
  } catch (error) {
    console.error(`[CSV-DB] Error loading CSV data:`, error);
    
    // Create a more detailed error message
    const errorDetails = error instanceof Error
      ? `${error.name}: ${error.message}${error.stack ? `\nStack: ${error.stack}` : ''}`
      : String(error);
    
    throw new Error(`Failed to load inmate data from CSV: ${errorDetails}`);
  }
}

/**
 * Get a list of inmates with their primary charge
 * @param limit Maximum number of inmates to return
 * @returns Array of inmate objects
 */
/**
 * Get a list of inmates with their primary charge
 * @param limit Maximum number of inmates to return
 * @returns Array of inmate objects
 * @throws Error if inmates cannot be loaded
 */
export async function getInmates(limit = 10): Promise<Inmate[]> {
  console.log(`[CSV-DB] Fetching ${limit} inmates...`);
  
  try {
    const startTime = Date.now();
    const inmates = await loadCsvData();
    console.log(`[CSV-DB] Loaded ${inmates.length} total inmates in ${Date.now() - startTime}ms`);
    
    // Shuffle the inmates to get random ones (similar to ORDER BY RANDOM() in SQLite)
    const shuffledInmates = [...inmates].sort(() => Math.random() - 0.5);
    
    // Take only the requested number of inmates
    const limitedInmates = shuffledInmates.slice(0, limit);
    console.log(`[CSV-DB] Selected ${limitedInmates.length} random inmates`);
    
    // Map the CSV data to the expected output format
    const mappedInmates = limitedInmates.map(inmate => {
      // Use the AI_Description_Explanation field directly
      const crime = inmate.AI_Description_Explanation ?
        inmate.AI_Description_Explanation.trim() : // Changed from Description
        'Unknown charge';

      // Parse the inmate ID, with fallback for invalid values
      let id: number;
      try {
        id = parseInt(inmate.InmateID, 10);
        if (isNaN(id)) {
          console.warn(`[CSV-DB] Invalid InmateID: ${inmate.InmateID}, using fallback ID`);
          id = Math.floor(Math.random() * 10000); // Fallback ID
        }
      } catch (e) {
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
 */
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
export function getDiagnostics(): Record<string, any> {
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
        envPath: csvPath,
        resolvedPath,
        exists: fileExists,
        size: fileStats?.size || 0,
        lastModified: fileStats?.mtime || null,
        permissions: fileStats?.mode.toString(8) || null
      },
      cache: {
        isPopulated: !!inmateCache,
        recordCount: cacheSize
      }
    };
  } catch (error) {
    console.error(`[CSV-DB] Error getting diagnostics:`, error);
    return {
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
