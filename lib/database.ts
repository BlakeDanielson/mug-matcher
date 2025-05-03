import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Database connection singleton
let dbInstance: any = null;

/**
 * Get a connection to the SQLite database
 * Using a singleton pattern to reuse the connection in serverless environment
 */
export async function getDbConnection() {
  if (dbInstance) {
    return dbInstance;
  }

  // Get the database path from environment variables
  const envPath = process.env.MUGSHOTS_DB_PATH;
  
  if (!envPath) {
    throw new Error('MUGSHOTS_DB_PATH environment variable is not set. Please check your .env file.');
  }
  
  let dbPath;
  
  // If the path is absolute (like in Render production: /data/mugshots.db), use it directly
  if (path.isAbsolute(envPath)) {
    console.log(`Using absolute DB path: ${envPath}`);
    dbPath = envPath;
  } else {
    // In development, resolve relative paths based on the environment
    const isInMugMatcherDir = process.cwd().endsWith('mug-matcher');
    
    // If we're already in the mug-matcher directory, don't add it to the path
    if (isInMugMatcherDir) {
      dbPath = path.resolve(process.cwd(), envPath);
      console.log(`Using relative DB path (from mug-matcher dir): ${dbPath}`);
    } else {
      // If we're in the parent directory, add mug-matcher to the path
      dbPath = path.resolve(process.cwd(), 'mug-matcher', envPath);
      console.log(`Using relative DB path (from parent dir): ${dbPath}`);
    }
  }

  try {
    // Open the database connection
    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    console.log(`Connected to database at ${dbPath}`);
    return dbInstance;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw new Error('Failed to connect to database');
  }
}

/**
 * Close the database connection
 * This should be called when the application is shutting down
 */
export async function closeDbConnection() {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
    console.log('Database connection closed');
  }
}

/**
 * Get a list of inmates with their primary charge
 * @param limit Maximum number of inmates to return
 * @returns Array of inmate objects
 */
export async function getInmates(limit = 10) {
  const db = await getDbConnection();
  
  try {
    const inmates = await db.all(`
      SELECT 
        i.inmate_id, 
        i.name, 
        i.mugshot_url as image,
        (
          SELECT c.description 
          FROM charge c 
          WHERE c.inmate_id = i.inmate_id 
          ORDER BY c.charge_id 
          LIMIT 1
        ) as crime
      FROM 
        inmate i
      ORDER BY 
        RANDOM()
      LIMIT ?
    `, [limit]);

    return inmates.map((inmate: any) => ({
      id: inmate.inmate_id,
      name: inmate.name,
      image: inmate.image,
      crime: inmate.crime || 'Unknown charge'
    }));
  } catch (error) {
    console.error('Error fetching inmates:', error);
    throw error;
  }
}