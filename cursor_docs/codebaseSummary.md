# Codebase Summary

## Key Components and Their Interactions
- `mug-matcher/` - Main Next.js application directory
  - `app/` - Next.js App Router files
    - `page.tsx` - Main landing page that loads the game component
    - `layout.tsx` - Root layout with theme provider
    - `api/` - API endpoints for data retrieval
  - `components/` - React components
    - `mugshot-matching-game.tsx` - Main game component
    - `ui/` - UI components (shadcn)
  - `lib/` - Utility functions and data handling
    - `csv-database.ts` - Functions for handling CSV data
  - `mugshotscripts/` - Scripts for processing mugshot data
    - Contains database schema and scripts for data processing

## Data Flow
1. User lands on the main page
2. Frontend makes API call to `/api/inmates`
3. API fetches inmate data from CSV files
4. Mugshot matching game displays the data
5. User interacts with the game, making matches between mugshots and crimes
6. Game scores user's matches and provides feedback

## External Dependencies
- Next.js for the full-stack framework
- Tailwind CSS for styling
- Shadcn UI components for the interface
- SQLite/CSV for data storage and retrieval

## Recent Significant Changes
- Initial project setup
- Repository initialization
- Implementing basic game functionality

## User Feedback Integration
- The application currently provides feedback on match correctness
- Toast notifications inform users about their scores
- Loading states and error handling are implemented 