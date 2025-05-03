# Mugshot Matcher

A facial recognition application for matching mugshot images.

## Project Structure

- `mug-matcher/` - Main application directory
- `mugshotscripts/` - Scripts for processing mugshot data 

## Deployment

### Prerequisites
- A Render account
- Git repository with your project
- Node.js 18+ installed locally

### Step-by-Step Deployment Guide

1. **Create a New Web Service**
   - Log in to your Render dashboard
   - Click "New +" and select "Web Service"
   - Connect your repository
   - Choose the branch you want to deploy

2. **Configure Build Settings**
   ```
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Set Environment Variables**
   - Navigate to the "Environment" tab
   - Add the following required variables:
     ```
     NODE_ENV=production
     NEXT_PUBLIC_API_URL=your-api-url
     DATABASE_URL=your-database-url
     FACIAL_RECOGNITION_API_KEY=your-api-key
     ```

### Data Management

1. **Initial Data Setup**
   - Upload mugshot data using the provided scripts:
     ```bash
     cd mugshotscripts
     node copy-data.js
     ```
   - Verify data integrity in the production environment

2. **Backup Process**
   - Automated daily backups are configured
   - Manual backup command:
     ```bash
     npm run backup
     ```

### Performance Optimization

1. **Image Processing**
   - Enable image caching
   - Set appropriate cache headers
   - Use WebP format when possible

2. **API Optimization**
   - Implement rate limiting
   - Enable response compression
   - Cache frequent queries

### Troubleshooting Guide

#### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are listed in package.json
   - Review build logs for specific errors

2. **Database Connection Issues**
   - Confirm DATABASE_URL is correctly formatted
   - Check network access rules
   - Verify database credentials

3. **Image Processing Errors**
   - Ensure sufficient memory allocation
   - Check file permissions
   - Verify API key permissions

#### Health Monitoring

- Monitor application health at `/api/health`
- Set up alerts for:
  - High error rates
  - Unusual CPU/memory usage
  - Slow response times

### Maintenance Guidelines

1. **Regular Updates**
   - Schedule monthly dependency updates
   - Review security patches weekly
   - Update facial recognition models quarterly

2. **Backup Verification**
   - Test backup restoration monthly
   - Verify data integrity
   - Document any issues

3. **Performance Monitoring**
   - Review application metrics weekly
   - Monitor API response times
   - Track resource utilization

For technical details about the production environment and advanced configuration, see [Technical Documentation](docs/points-system/02-technical-documentation.md).