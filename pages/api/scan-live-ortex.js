// Live Ortex Scanner - Uses real API data
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbols, filters } = req.body;
  
  // Check for required API key
  const ORTEX_API_KEY = process.env.ORTEX_API_KEY;
  
  if (!ORTEX_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'ORTEX_API_KEY not configured',
      api_status: 'MISSING_KEY'
    });
  }

  // Popular squeeze candidates to scan
  const DEFAULT_SYMBOLS = [
    // Meme/Squeeze Favorites
    'GME', 'AMC', 'BBBY', 'ATER', 'PROG', 'SPRT', 'DWAC', 'PHUN',
    
    // High Short Interest Candidates  
    'BYND', 'NKLA', 'RIDE', 'WKHS', 'LCID', 'RIVN', 'PTON', 'ROKU',
    
    // Big Tech (for comparison)
    'AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NFLX',
    
    // Small/Mid Cap Potentials
    'RDBX', 'ENVX', 'HYLN', 'FCEL', 'PLUG', 'CLSK', 'RIOT', 'MARA'
  ];
  
  const symbolsToScan = symbols.length > 0 ? symbols : DEFAULT_SYMBOLS;

  try {
    console.log(`🚀 Live Ortex scanner processing ${symbolsToScan.length} symbols...`);
    
    // Process in batches to respect API rate limits
    const batchSize = 5;
    const batches = [];
    
    for (let i = 0; i < symbolsToScan.length; i += batchSize) {
      batches.push(symbolsToScan.slice(i, i + batchSize));
    }
    
    let allResults = [];
    
    for (const [batchIndex, batch] of batches.entries()) {
      console.log(`Processing batch ${batchIndex + 1}/${batches.length}: ${batch.join(', ')}`);
      
      const batchPromises = batch.map(async (symbol) => {
        try {
          // Make parallel API calls to Ortex endpoints
          const promises = [
            fetch(`https://api.ortex.com/v1/short-interest/${symbol}`, {
              headers: { 'Authorization': `Bearer ${ORTEX_API_KEY}` }
            }),
            fetch(`https://api.ortex.com/v1/availability/${symbol}`, {
              headers: { 'Authorization': `Bearer ${ORTEX_API_KEY}` }
            }),
            fetch(`https://api.ortex.com/v1/cost-to-borrow/${symbol}`, {
              headers: { 'Authorization': `Bearer ${ORTEX_API_KEY}` }
            }),
            fetch(`https://api.ortex.com/v1/days-to-cover/${symbol}`, {
              headers: { 'Authorization': `Bearer ${ORTEX_API_KEY}` }
            })
          ];

          const responses = await Promise.allSettled(promises);
          const [siResp, availResp, ctbResp, dtcResp] = responses;

          // Parse responses safely
          const parseResponse = async (result) => {
            try {
              if (result.status === 'fulfilled' && result.value.ok) {
                return await result.value.json();
              }
              return null;
            } catch (error) {
              console.warn(`Parse error for ${symbol}:`, error);
              return null;
            }
          };

          const [
            shortInterest,
            availability,
            costToBorrow,
            daysToCover
          ] = await Promise.all(responses.map(parseResponse));

          // Calculate Holy Grail score from real data
          let holyGrail = 0;
          
          // Short Interest (30 points max)
          if (shortInterest?.estimated_si) {
            holyGrail += Math.min(shortInterest.estimated_si * 0.8, 30);
          }
          
          // Utilization (25 points max)
          if (availability?.utilization) {
            holyGrail += Math.min(availability.utilization * 0.25, 25);
          }
          
          // Cost to Borrow (25 points max)
          if (costToBorrow?.current) {
            holyGrail += Math.min(costToBorrow.current * 0.5, 25);
          }
          
          // Days to Cover (20 points max)
          if (daysToCover?.ortex) {
            holyGrail += Math.min(daysToCover.ortex * 4, 20);
          }
          
          holyGrail = Math.round(Math.min(100, holyGrail));

          // Classify squeeze type
          const si = shortInterest?.estimated_si || 0;
          const util = availability?.utilization || 0;
          const ctb = costToBorrow?.current || 0;
          const dtc = daysToCover?.ortex || 0;

          let squeezeType = 'MONITORING';
          let timing = 'EARLY';

          if (si > 20 && util > 90 && ctb > 30) {
            squeezeType = 'GAMMA_SHORT_COMBO';
            timing = holyGrail > 85 ? 'IMMINENT' : 'BUILDING';
          } else if (si > 15 && util > 85 && dtc > 3) {
            squeezeType = 'CLASSIC_SHORT_SQUEEZE';
            timing = holyGrail > 80 ? 'IMMINENT' : 'BUILDING';
          } else if (ctb > 50) {
            squeezeType = 'BORROWING_CRISIS';
            timing = ctb > 100 ? 'IMMINENT' : 'BUILDING';
          } else if (holyGrail > 60) {
            squeezeType = 'POTENTIAL_SETUP';
            timing = holyGrail > 75 ? 'BUILDING' : 'MONITORING';
          }

          // Generate alerts based on real data
          const alerts = [];
          
          if (ctb > 80) {
            alerts.push({
              level: 'CRITICAL',
              type: 'CTB_EXPLOSION',
              message: `Cost to borrow exploding: ${ctb.toFixed(1)}%`
            });
          }
          
          if (holyGrail >= 90) {
            alerts.push({
              level: 'CRITICAL',
              type: 'LEGENDARY_SETUP',
              message: `Legendary Holy Grail score: ${holyGrail}`
            });
          }
          
          if (util > 95) {
            alerts.push({
              level: 'HIGH',
              type: 'EXTREME_UTILIZATION',
              message: `Extreme utilization: ${util.toFixed(1)}%`
            });
          }

          console.log(`✓ Live data for ${symbol}: HG=${holyGrail}, SI=${si.toFixed(1)}%`);

          return {
            symbol,
            price: 0, // Would need additional price API
            change: 0,
            holyGrail,
            squeeze: {
              classification: squeezeType,
              timing: timing,
              overall_score: holyGrail
            },
            alerts,
            shortInterest: shortInterest ? {
              estimated: shortInterest.estimated_si || 0,
              confidence: shortInterest.confidence || 0
            } : null,
            availability: availability ? {
              utilization: availability.utilization || 0,
              available: availability.available || 0
            } : null,
            costToBorrow: costToBorrow ? {
              current: costToBorrow.current || 0,
              trend: costToBorrow.trend || 'STABLE'
            } : null,
            daysToCover: daysToCover ? {
              ortex: daysToCover.ortex || 0
            } : null,
            timestamp: new Date().toISOString(),
            dataSource: 'LIVE_ORTEX'
          };

        } catch (error) {
          console.error(`Error scanning ${symbol}:`, error);
          
          return {
            symbol,
            error: error.message,
            price: 0,
            holyGrail: 0,
            squeeze: { classification: 'ERROR', timing: 'N/A', overall_score: 0 },
            alerts: [{
              level: 'HIGH',
              type: 'API_ERROR', 
              message: `API error: ${error.message}`
            }],
            timestamp: new Date().toISOString(),
            dataSource: 'ERROR'
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      allResults = allResults.concat(batchResults);

      // Rate limiting delay between batches
      if (batchIndex < batches.length - 1) {
        console.log('Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Filter out errors and sort by Holy Grail score
    const validResults = allResults
      .filter(stock => !stock.error)
      .sort((a, b) => b.holyGrail - a.holyGrail);

    // Generate summary
    const summary = {
      total: validResults.length,
      legendary: validResults.filter(r => r.holyGrail >= 90).length,
      strong: validResults.filter(r => r.holyGrail >= 85 && r.holyGrail < 90).length,
      moderate: validResults.filter(r => r.holyGrail >= 75 && r.holyGrail < 85).length,
      weak: validResults.filter(r => r.holyGrail >= 60 && r.holyGrail < 75).length,
      alertCount: validResults.reduce((sum, r) => sum + r.alerts.length, 0),
      ctbExplosions: validResults.filter(r => 
        r.costToBorrow?.trend === 'EXPLODING' || 
        (r.costToBorrow?.current || 0) > 80
      ).length,
      imminentSqueezes: validResults.filter(r => r.squeeze?.timing === 'IMMINENT').length,
      errors: allResults.filter(r => r.error).length
    };

    console.log(`✅ Live Ortex scan complete: ${validResults.length} valid results, ${summary.legendary} legendary`);

    res.status(200).json({
      success: true,
      summary,
      results: validResults,
      timestamp: new Date().toISOString(),
      mode: 'LIVE_ORTEX',
      api_status: 'LIVE',
      processed_count: allResults.length,
      error_count: summary.errors
    });

  } catch (error) {
    console.error('Live Ortex scan error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      api_status: 'ERROR'
    });
  }
}
