# Google AdSense Monetization Setup

## Overview

This guide covers the **dual ad strategy** for maximum revenue: Google's **Auto Ads** combined with **strategic manual placements**. This approach typically increases revenue by 15-30% compared to using either method alone.

## 🚀 Dual Ad Strategy

### **Auto Ads** (Primary Revenue Driver)
- **Automatic optimization** by Google's AI
- **Dynamic placement** based on user behavior
- **Real-time adjustments** for maximum performance
- **Client ID**: `ca-pub-5415010136926818` (already configured)

### **Manual Strategic Ads** (Supplementary Revenue)
- **Targeted placements** at high-engagement moments
- **Design-integrated** advertising
- **Predictable user experience**
- **Custom timing** for game flow

## Revenue Strategy Benefits

| Approach | Revenue Potential | User Experience | Control Level |
|----------|------------------|------------------|---------------|
| Auto Ads Only | 📈 High | ⚡ Variable | 🤖 AI Controlled |
| Manual Only | 📊 Medium | 🎯 Consistent | 👥 Full Control |
| **Both Combined** | 🚀 **Maximum** | ⚖️ **Balanced** | 🎛️ **Optimized** |

## Ad Placement Strategy

### 1. **Top Banner** - Non-intrusive header placement
- **Desktop**: 728x90 Leaderboard banner above game title
- **Mobile**: 320x100 Mobile banner above game title
- **Revenue Potential**: Medium (always visible)

### 2. **Sidebar Ads** - Desktop-only premium real estate
- **Left/Right Sidebars**: 300x250 Medium Rectangle ads
- **Additional**: 336x280 Large Rectangle for higher CPM
- **Revenue Potential**: High (premium placement, sticky positioning)

### 3. **Results Screen** - High engagement placement
- **Location**: Embedded in game results after completion
- **Format**: Responsive banner (728x90 desktop, 320x100 mobile)
- **Revenue Potential**: Very High (user engagement peak)

### 4. **Inter-round Ads** - Monetize game flow
- **Modal Display**: 5-second countdown with skip option
- **Format**: Rectangle format in modal overlay
- **Revenue Potential**: High (natural break point)

## Setup Instructions

### Step 1: Create Google AdSense Account

1. Visit [Google AdSense](https://www.google.com/adsense/)
2. Create an account for your domain
3. Wait for approval (can take 1-7 days)
4. Get your Publisher ID (format: `ca-pub-xxxxxxxxxxxxxxxx`)

### Step 2: Create Ad Units

In your AdSense dashboard, create the following ad units:

| Ad Unit Name | Size | Type | Recommended |
|--------------|------|------|-------------|
| Top Banner Desktop | 728x90 | Display | Leaderboard |
| Top Banner Mobile | 320x100 | Display | Mobile Banner |
| Sidebar Rectangle | 300x250 | Display | Medium Rectangle |
| Sidebar Large | 336x280 | Display | Large Rectangle |
| Results Banner | Responsive | Display | Auto Size |
| Inter-round Modal | 300x250 | Display | Medium Rectangle |

### Step 3: Configure Environment Variables

Create or update your `.env.local` file:

```bash
# Google AdSense Configuration
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID=ca-pub-your-actual-client-id

# Ad Slot IDs (get these from your AdSense dashboard)
NEXT_PUBLIC_AD_SLOT_TOP_BANNER=1234567890
NEXT_PUBLIC_AD_SLOT_SIDEBAR=1234567891
NEXT_PUBLIC_AD_SLOT_RESULTS=1234567892
NEXT_PUBLIC_AD_SLOT_INTERROUND=1234567893
```

### Step 4: Update ads.txt (Required)

Create `public/ads.txt` file:

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

Replace `XXXXXXXXXXXXXXXX` with your actual publisher ID (numbers only).

### Step 5: Test Implementation

1. **Development Mode**: Ad placeholders will show with dashed borders
2. **Test Ads**: Use `data-adtest="on"` (automatically enabled in development)
3. **Production**: Remove test parameters and deploy

## Revenue Optimization Tips

### 1. **Ad Placement Best Practices**
- **Above the fold**: Top banner captures immediate attention
- **Sidebar sticky**: Desktop sidebars follow scroll for maximum visibility
- **Results integration**: Natural placement during engagement peak
- **Inter-round timing**: 5-second delay respects user experience

### 2. **Performance Monitoring**
- Track Click-Through Rates (CTR) by placement
- Monitor Core Web Vitals impact
- A/B test ad formats and positions
- Analyze revenue per session

### 3. **User Experience Balance**
- Mobile-first responsive design
- Non-intrusive ad labels
- Skip options for inter-round ads
- Premium subscription removes ads (future feature)

## Expected Revenue

Based on typical gaming site metrics:

| Placement | Daily Pageviews | Est. CTR | Est. CPC | Daily Revenue |
|-----------|----------------|----------|----------|---------------|
| Top Banner | 1,000 | 1.2% | $0.50 | $6.00 |
| Sidebar | 800 | 0.8% | $0.75 | $4.80 |
| Results | 600 | 2.5% | $0.60 | $9.00 |
| Inter-round | 400 | 1.8% | $0.55 | $3.96 |
| **Total** | - | - | - | **$23.76/day** |

*Revenue estimates based on 1,000 daily active users. Actual results may vary significantly based on traffic quality, geo-targeting, and seasonal factors.*

## Advanced Features (Future Implementation)

### 1. **Premium Subscription**
- Ad-free experience for $4.99/month
- Enhanced game features
- Revenue diversification

### 2. **Dynamic Ad Loading**
- Lazy loading for performance
- Refresh ads on game reset
- A/B testing framework

### 3. **Affiliate Integration**
- True crime content partnerships
- Educational course promotions
- Cross-game advertising

## Troubleshooting

### Common Issues

1. **Ads not showing**
   - Check environment variables
   - Verify AdSense approval
   - Check browser ad blockers

2. **Performance impact**
   - Monitor Core Web Vitals
   - Use `strategy="afterInteractive"`
   - Implement lazy loading

3. **Revenue lower than expected**
   - Check traffic quality
   - Optimize ad placements
   - Review AdSense policies

### Support Resources

- [Google AdSense Help](https://support.google.com/adsense/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web.dev Core Web Vitals](https://web.dev/vitals/)

## Legal Considerations

1. **Privacy Policy**: Update to include advertising cookies
2. **GDPR Compliance**: Implement consent management
3. **CCPA Compliance**: Add privacy controls for California users
4. **AdSense Policies**: Review and comply with all advertising policies

---

*Last updated: January 2024*
*Next review: Monthly revenue optimization* 