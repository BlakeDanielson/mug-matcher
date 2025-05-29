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

## Buy Me A Coffee Integration

This project includes Buy Me A Coffee integration to support the developer. The integration includes both a floating widget and inline buttons.

### Configuration

To configure Buy Me A Coffee for your project:

1. **Set up your Buy Me A Coffee account** at [buymeacoffee.com](https://www.buymeacoffee.com)

2. **Update the username** in the following files:
   - `app/layout.tsx` - Update the `username` prop in the `BuyMeCoffee` component
   - `app/page.tsx` - Update the `username` prop in the `BuyMeCoffeeButton` component

3. **Optional: Use environment variables** (recommended for production):
   ```bash
   # Add to your .env.local file
   NEXT_PUBLIC_BUYMEACOFFEE_USERNAME=yourusername
   ```

   Then update the components to use the environment variable:
   ```tsx
   username={process.env.NEXT_PUBLIC_BUYMEACOFFEE_USERNAME || "yourusername"}
   ```

### Components Available

- **`BuyMeCoffee`** - Floating widget that appears on the side of the page
- **`BuyMeCoffeeButton`** - Inline button component for custom placement

### Customization

The Buy Me A Coffee components support various customization options:

```tsx
<BuyMeCoffee 
  username="yourusername"
  message="Custom message for supporters"
  description="Support description"
  color="#FFDD00"
  position="right" // or "left"
  xMargin={18}
  yMargin={18}
/>
```

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
| MUGSHOTS_CSV_PATH | Path to the CSV file containing mugshot data | `../mugshotscripts/sorted_mugshots.csv` (local) or `./data/sorted_mugshots.csv` (Render) |
| NODE_ENV | Node environment | `development`, `production`, or `test` |

### Optional Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| NEXT_PUBLIC_BUYMEACOFFEE_USERNAME | Your Buy Me A Coffee username | `yourusername` |

## Deployment

### Deploy on Render

This application is configured for deployment on [Render](https://render.com) using the `render.yaml` configuration file. The application now includes the CSV file directly in the repository, eliminating the need for manual transfer or download after deployment.

Key configuration for Render deployment:
- The application uses environment variables to locate data files
- CSV files are stored in the `data` directory in the repository
- The application automatically detects whether it's running in development or production mode
- Custom build and start scripts handle data file management

For detailed deployment instructions, see the [Render Deployment Guide](./docs/deployment/render-deployment.md).

## Data Management

This application uses CSV files to store mugshot data. The data management process is handled by several scripts:

### Data Directory Structure

- In development and production: Data files are stored in the `data` directory in the project root
- The CSV file is included directly in the repository, eliminating the need for manual transfer or download

### Data Management Scripts

| Script | Description |
|--------|-------------|
| `npm run copy-data` | Copies CSV files from source directories to the data directory (for development) |
| `npm run validate-data` | Validates that required data files exist and are not empty |
| `npm run update-render-config` | Updates the Render deployment configuration to include data files in the repository |
| `npm run setup-data-file` | Interactive script to help set up the sorted_mugshots.csv file in the data directory |
| `npm run test-data-access` | Tests whether the application can access the data files in both development and production environments |

### Deployment Process

During deployment to Render, the following steps are performed:

1. The build script (`npm run build`) validates that the CSV file exists in the repository
2. The build script then runs the Next.js build process
3. The start script (`npm run start`) validates the data files again before starting the Next.js server
4. If any required data files are missing or empty, the application will fail to start with a helpful error message

### CSV File in Repository

The `sorted_mugshots.csv` file is now included directly in the repository:

1. The file is stored in the `data` directory in the repository
2. This approach eliminates the need for manual transfer or download after deployment
3. The application will automatically detect the file and use it
4. This approach is more reliable as it ensures the file is always available after deployment

### Error Handling

The application includes robust error handling for missing or empty data files:

- In development: Warnings are displayed, but the application will still attempt to run
- In production: Critical errors will prevent the application from starting, with detailed error messages
- API endpoints include detailed error responses with suggestions for resolving issues

### Adding or Updating Data Files

To add or update data files:

#### For Development Environment:
1. Place the new or updated CSV files directly in the `data` directory in the project root
2. Restart the application to use the new data

#### For Production Environment (Render):
1. Update the CSV file in the `data` directory in the repository
2. Commit and push the changes to the repository
3. Redeploy the application on Render
4. The application will automatically use the updated file

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
