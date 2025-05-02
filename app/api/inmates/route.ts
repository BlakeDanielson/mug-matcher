import { NextResponse } from 'next/server';
import { getInmates } from '@/lib/csv-database';

/**
 * GET handler for the /api/inmates endpoint
 * Fetches inmate data from the CSV file
 */
export async function GET() {
  try {
    // Get inmates from the database utility (reduced from 10 to 5)
    const inmates = await getInmates(5);
    
    return NextResponse.json({ inmates });
  } catch (error) {
    console.error('Error fetching inmates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inmate data' },
      { status: 500 }
    );
  }
}