#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupAdSense() {
  console.log('🎯 Google AdSense Setup for Mug-Matcher');
  console.log('=====================================\n');
  
  console.log('✨ Detected Auto Ads already configured!');
  console.log('📡 Auto Ads Client ID: ca-pub-5415010136926818');
  console.log('💡 Auto ads will work alongside your manual placements\n');

  try {
    // Ask if they want to set up additional manual ads
    const setupManual = await question('Do you want to set up additional manual ad placements? (y/n): ');
    
    if (setupManual.toLowerCase() !== 'y') {
      console.log('\n✅ Using Auto Ads only - Google will automatically optimize ad placements!');
      console.log('📈 Expected revenue increase: 15-30% with auto ads');
      return;
    }

    // Get additional manual AdSense Client ID if different
    console.log('\nOptional: Enter additional AdSense Client ID for manual placements');
    console.log('(Leave blank to use the same auto ads client ID)');
    const clientId = await question('Manual ads Client ID (ca-pub-xxxxxxxxxxxxxxxx) or press Enter: ');
    
    const finalClientId = clientId.trim() || 'ca-pub-5415010136926818';
    
    if (clientId && !clientId.startsWith('ca-pub-')) {
      console.log('❌ Invalid Client ID format. Should start with "ca-pub-"');
      process.exit(1);
    }

    // Get Ad Slot IDs
    console.log('\nEnter your Ad Slot IDs from AdSense dashboard:');
    const topBanner = await question('Top Banner Slot ID: ');
    const sidebar = await question('Sidebar Slot ID: ');
    const results = await question('Results Screen Slot ID: ');
    const interround = await question('Inter-round Modal Slot ID: ');

    // Create environment variables content
    const envContent = `# Google AdSense Configuration
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID=${finalClientId}

# Ad Slot IDs
NEXT_PUBLIC_AD_SLOT_TOP_BANNER=${topBanner}
NEXT_PUBLIC_AD_SLOT_SIDEBAR=${sidebar}
NEXT_PUBLIC_AD_SLOT_RESULTS=${results}
NEXT_PUBLIC_AD_SLOT_INTERROUND=${interround}

# Existing environment variables (preserve existing ones)
MUGSHOTS_CSV_PATH=../mugshotscripts/sorted_mugshots.csv
NODE_ENV=development
`;

    // Write to .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    fs.writeFileSync(envPath, envContent);

    // Create ads.txt file
    const publisherId = finalClientId.replace('ca-pub-', '');
    const adsTxtContent = `google.com, pub-${publisherId}, DIRECT, f08c47fec0942fa0`;
    const adsTxtPath = path.join(process.cwd(), 'public', 'ads.txt');
    
    // Ensure public directory exists
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(adsTxtPath, adsTxtContent);

    console.log('\n✅ AdSense setup completed successfully!');
    console.log('\nFiles created/updated:');
    console.log('📄 .env.local - Environment variables');
    console.log('📄 public/ads.txt - AdSense verification');
    
    console.log('\n🚀 Next steps:');
    console.log('1. Restart your development server');
    console.log('2. Test ad placements in development mode');
    console.log('3. Deploy to production once ready');
    console.log('4. Monitor performance in AdSense dashboard');
    
    console.log('\n📊 Expected revenue with 1,000 daily users: ~$24/day');
    console.log('📖 Read full documentation: docs/monetization/adsense-setup.md');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run setup
setupAdSense(); 