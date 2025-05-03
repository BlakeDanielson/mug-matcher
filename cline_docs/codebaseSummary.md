# Codebase Summary

## Key Components and Their Interactions
- `mug-matcher/` - Main Next.js application directory
  - `app/` - Next.js App Router files
    - `page.tsx` - Main landing page that loads the game component
    - `layout.tsx` - Root layout with theme provider
    - `api/` - API endpoints for data retrieval
  - `components/` - React components
    - `mugshot-matching-game.tsx` - Main game component, now using drag-and-drop for matching.
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
5. User interacts with the game by dragging mugshots onto crime descriptions.
6. Game scores user's matches and provides visual feedback.

## External Dependencies
- Next.js for the full-stack framework
- Tailwind CSS for styling
- Shadcn UI components for the interface
- @dnd-kit/core & @dnd-kit/utilities for drag-and-drop functionality
- SQLite/CSV for data storage and retrieval

## Recent Significant Changes
- Initial project setup
- Repository initialization
- Implementing basic game functionality (dropdown selection)
- Replaced dropdown selection with drag-and-drop interaction using dnd-kit in `mugshot-matching-game.tsx`.

## User Feedback Integration
- The application provides visual feedback on match correctness via drag-and-drop interactions.
- Toast notifications inform users about their scores.
- Visual cues added for dragging and dropping states.
- Loading states and error handling are implemented.
