# Mugshot Matcher

A challenging web-based game where players test their detective skills by matching mugshots to their corresponding crimes. This interactive experience combines visual recognition with criminal justice knowledge, creating an engaging way to learn about law enforcement and criminal profiling. Built with [Next.js](https://nextjs.org) and bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Test your detective skills by matching mugshots to crimes. Each round presents you with a set of mugshots and descriptions of crimes - can you correctly pair them based on visual cues and criminal profiles? The game challenges your observation skills and understanding of criminal behavior patterns.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Environment Variables

This application uses environment variables to configure various aspects of its behavior. Copy the `.env.example` file to `.env.local` for local development:

```bash
cp .env.example .env.local
```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| MUGSHOTS_CSV_PATH | Path to the CSV file containing mugshot data | `../mugshotscripts/sorted_mugshots.csv` (local) or `/data/sorted_mugshots.csv` (Render) |
| NODE_ENV | Node environment | `development`, `production`, or `test` |

## Deployment

### Deploy on Render

This application is configured for deployment on [Render](https://render.com) using the `render.yaml` configuration file. The application uses a disk mount at `/data` to store and access the mugshot data files.

Key configuration for Render deployment:
- The application uses environment variables to locate data files
- CSV and database files are stored on a mounted disk at `/data`
- The application automatically detects whether it's running in development or production mode
- Custom build and start scripts handle data file management

## Data Management

This application uses CSV files to store mugshot data. The data management process is handled by several scripts:

### Data Directory Structure

- In development: Data files are stored in the `data` directory in the project root
- In production (Render): Data files are stored in the mounted `/data` directory

### Data Management Scripts

| Script | Description |
|--------|-------------|
| `npm run copy-data` | Copies CSV files from source directories to the data directory |
| `npm run validate-data` | Validates that required data files exist and are not empty |

### Deployment Process

During deployment to Render, the following steps are performed:

1. The build script (`npm run build`) runs the copy-data script to ensure data files are available
2. The build script then runs the Next.js build process
3. After the build, the data files are validated to ensure they exist and are not empty
4. The start script (`npm run start`) validates the data files again before starting the Next.js server
5. If any required data files are missing or empty, the application will fail to start with a helpful error message

### Data Transfer with Wormhole

The `sorted_mugshots.csv` file is now transferred manually after deployment using the wormhole CLI tool:

1. After the application is deployed to Render, use the wormhole CLI tool to transfer the file to the `/data` directory
2. The application will automatically detect the file and use it
3. This approach is more secure and reliable for transferring large data files to the production environment

### Error Handling

The application includes robust error handling for missing or empty data files:

- In development: Warnings are displayed, but the application will still attempt to run
- In production: Critical errors will prevent the application from starting, with detailed error messages
- API endpoints include detailed error responses with suggestions for resolving issues

### Adding or Updating Data Files

To add or update data files:

#### For Development Environment:
1. Place the new or updated CSV files in the source directory (e.g., `../mugshotscripts/`)
2. Run `npm run copy-data` to copy the files to the data directory
3. Restart the application to use the new data

#### For Production Environment (Render):
1. For most data files, follow the same process as development
2. For the `sorted_mugshots.csv` file specifically:
   - Use the wormhole CLI tool to transfer the file directly to the `/data` directory on Render
   - Example command: `wormhole send /path/to/sorted_mugshots.csv`
   - Follow the prompts to complete the transfer
   - The application will automatically detect and use the updated file

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
