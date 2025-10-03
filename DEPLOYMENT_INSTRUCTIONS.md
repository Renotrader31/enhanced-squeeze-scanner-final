# 🚀 Enhanced Squeeze Scanner - Vercel Deployment Instructions

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Ortex API Key**: Your existing Ortex API key for live market data
3. **GitHub Repository**: Repository at `https://github.com/Renotrader31/enhanced-squeeze-scanner-final`

## 🎯 Deployment Steps

### Step 1: Connect Repository to Vercel

1. **Login to Vercel**: Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Import Project**: Click "New Project" → "Import Git Repository"
3. **Select Repository**: Choose `Renotrader31/enhanced-squeeze-scanner-final`
4. **Select Branch**: Use `deploy-clean` branch (contains production-ready code)

### Step 2: Configure Environment Variables

In Vercel deployment settings, add these environment variables:

#### Required for Live Data:
```
ORTEX_API_KEY = [Your Ortex API Key]
NEXT_PUBLIC_USE_LIVE_DATA = true
```

#### Optional Configuration:
```
NEXT_PUBLIC_AUTO_REFRESH_INTERVAL = 30000
NEXT_PUBLIC_DEFAULT_MIN_HOLY_GRAIL = 60
NEXT_PUBLIC_SHOW_ALERTS = true
NEXT_PUBLIC_ENABLE_ANIMATIONS = true
NEXT_PUBLIC_MAX_RESULTS = 100
```

### Step 3: Deploy

1. **Configure Build Settings**:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

2. **Deploy**: Click "Deploy" and wait for deployment to complete

## 📈 Live Data Verification

After deployment, verify live data is working:

1. **Access your app** at the Vercel URL
2. **Look for indicators**:
   - Debug box shows: "📈 REAL MARKET DATA"
   - API mode displays: "LIVE_ORTEX"
   - Prices match current market (e.g., MSFT at ~$517 not $382)

3. **Check console logs**:
   - Should show: "Starting scan with endpoint: /api/scan-live-ortex"
   - API responses should include real market data

## 🔧 Troubleshooting

### Issue: Still Showing Demo Data
**Solutions**:
1. Verify `ORTEX_API_KEY` is set correctly in Vercel environment variables
2. Ensure `NEXT_PUBLIC_USE_LIVE_DATA=true` is set
3. Redeploy after setting environment variables
4. Check Vercel function logs for API errors

### Issue: API Rate Limiting
**Solutions**:
1. Ortex API endpoint includes built-in rate limiting
2. Reduces scan frequency automatically if needed
3. Processes symbols in batches to respect limits

### Issue: Missing Symbols
**Solutions**:
1. Default symbol list includes 40+ popular squeeze candidates
2. NVDA, MSFT, TSLA, GME, AMC all included
3. Can customize symbol list via API parameters

## 📊 Expected Live Data Features

✅ **Real Market Prices**: Current stock prices (MSFT ~$517)
✅ **Live Short Interest**: Real-time short interest percentages  
✅ **Current Utilization**: Actual borrow utilization rates
✅ **Live Cost-to-Borrow**: Real CTB rates and trends
✅ **Holy Grail Scores**: Calculated from live market data
✅ **Squeeze Classifications**: Based on actual market conditions

## 🎯 Production URLs

- **Repository**: https://github.com/Renotrader31/enhanced-squeeze-scanner-final
- **Deploy Branch**: `deploy-clean`
- **Vercel Project**: Will be generated after deployment

## 📞 Support

The application is production-ready with:
- Comprehensive error handling
- Automatic fallback to demo data if API issues
- Rate limiting and batch processing
- Real-time WebSocket updates
- Professional UI with live data indicators

Deploy and start making trading decisions with real market data! 🚀