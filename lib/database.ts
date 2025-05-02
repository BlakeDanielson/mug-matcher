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

  // Get the database path from environment variables or use a default path
  const dbPath = process.env.MUGSHOTS_DB_PATH || path.join(process.cwd(), '..', 'mugshotscripts', 'mugshots.db');

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