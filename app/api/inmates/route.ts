import { NextResponse } from 'next/server';
import { getInmates } from '@/lib/csv-database';

/**
 * GET handler for the /api/inmates endpoint
 * Fetches inmate data from the CSV file
 */
export async function GET() {
  try {
    // Get inmates from the database utility (increased to 6)
    const inmates = await getInmates(6);
    
    return NextResponse.json({ inmates });
  } catch (error) {
    console.error('Error fetching inmates:', error);
    
    // Provide more detailed error message
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error occurred';
    
    // Check if the error is related to missing CSV file
    const isMissingFileError = errorMessage.includes('not found') ||
                              errorMessage.includes('empty');
    
    return NextResponse.json(
      {
        error: 'Failed to fetch inmate data',
        details: errorMessage,
        suggestion: isMissingFileError
          ? 'The data files may be missing or empty. Please check the server configuration.'
          : 'Please try again later or contact support if the issue persists.'
      },
      { status: 500 }
    );
  }
}