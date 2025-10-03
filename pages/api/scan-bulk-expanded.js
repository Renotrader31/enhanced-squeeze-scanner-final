// Expanded Demo Scanner - More stocks with realistic data
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
  
  // Expanded stock universe - 100+ stocks
  const EXPANDED_SYMBOLS = [
    // Meme/Squeeze Favorites
    'GME', 'AMC', 'BBBY', 'ATER', 'PROG', 'SPRT', 'IRNT', 'OPAD', 'GREE', 'PHUN',
    'DWAC', 'BKKT', 'MARK', 'BENE', 'KOSS', 'EXPR', 'NAKD', 'SNDL', 'TLRY', 'ACB',
    
    // High Short Interest Candidates  
    'BYND', 'NKLA', 'RIDE', 'WKHS', 'GOEV', 'CANOO', 'ARVL', 'LCID', 'RIVN', 'FSLY',
    'PTON', 'MRNA', 'NVAX', 'BNTX', 'TDOC', 'ZM', 'NFLX', 'ROKU', 'DKNG', 'PENN',
    
    // Small/Mid Cap Squeeze Plays
    'RDBX', 'REDX', 'BOXD', 'TKAT', 'JYNT', 'ENVX', 'VLTA', 'AEVA', 'HYLN', 'SHLS',
    'FCEL', 'PLUG', 'BLNK', 'CHPT', 'EVGO', 'DCFC', 'CLSK', 'RIOT', 'MARA', 'BITF',
    
    // Big Tech & Popular Stocks
    'AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'NFLX', 'BABA',
    'CRM', 'ADBE', 'ORCL', 'NOW', 'INTU', 'AMAT', 'LRCX', 'KLAC', 'MCHP', 'MRVL',
    
    // Finance & Banks
    'JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'SCHW', 'USB', 'PNC', 'TFC',
    
    // Healthcare & Biotech
    'JNJ', 'PFE', 'UNH', 'ABBV', 'TMO', 'DHR', 'ABT', 'BMY', 'LLY', 'MRK',
    'GILD', 'AMGN', 'BIIB', 'VRTX', 'REGN', 'CELG', 'ILMN', 'ISRG', 'DXCM', 'ALGN',
    
    // Energy & Commodities  
    'XOM', 'CVX', 'COP', 'EOG', 'SLB', 'HAL', 'OXY', 'MPC', 'VLO', 'PSX'
  ];
  
  // Use expanded symbols if none provided, or merge with provided ones
  const symbolsToScan = symbols.length > 0 ? 
    [...new Set([...symbols, ...EXPANDED_SYMBOLS.slice(0, 50)])] : 
    EXPANDED_SYMBOLS.slice(0, 100);

  try {
    console.log(`🚀 Expanded demo scanner processing ${symbolsToScan.length} symbols...`);
    
    // Generate realistic demo data for each symbol
    const results = symbolsToScan.map(symbol => {
      const now = Date.now();
      const seed = symbol.split('').reduce((a, b) => a + b.charCodeAt(0), 0) + Math.floor(now / 60000);
      const random = (min, max) => min + (seed * 9301 + 49297) % 233280 / 233280 * (max - min);
      
      // Enhanced base prices with more stocks
      const basePrices = {
        // Meme stocks
        'GME': 18.25, 'AMC': 4.45, 'BBBY': 0.30, 'ATER': 3.20, 'PROG': 1.45,
        'SPRT': 2.85, 'IRNT': 12.40, 'OPAD': 8.75, 'GREE': 15.90, 'PHUN': 2.85,
        'DWAC': 35.40, 'BKKT': 6.20, 'MARK': 1.85, 'BENE': 4.30, 'KOSS': 8.90,
        
        // EV/Clean energy
        'TSLA': 245.75, 'RIVN': 18.90, 'LCID': 8.75, 'NKLA': 1.45, 'RIDE': 2.30,
        'WKHS': 1.85, 'GOEV': 2.40, 'CANOO': 1.90, 'ARVL': 2.15, 'HYLN': 2.80,
        'FCEL': 1.25, 'PLUG': 8.45, 'BLNK': 12.30, 'CHPT': 8.90, 'EVGO': 3.45,
        
        // Big Tech
        'AAPL': 195.50, 'NVDA': 485.20, 'MSFT': 375.85, 'GOOGL': 165.40, 'AMZN': 145.90,
        'META': 485.30, 'NFLX': 485.60, 'BABA': 95.70, 'CRM': 245.80, 'ADBE': 485.90,
        
        // Biotech/Healthcare
        'MRNA': 85.40, 'NVAX': 12.30, 'BNTX': 95.60, 'PFE': 35.80, 'JNJ': 165.40,
        'UNH': 485.90, 'ABBV': 145.30, 'TMO': 485.60, 'DHR': 245.80, 'ABT': 95.40,
        
        // Finance
        'JPM': 145.30, 'BAC': 32.40, 'WFC': 42.80, 'C': 48.90, 'GS': 385.60,
        'MS': 85.40, 'SCHW': 65.90, 'USB': 42.30, 'PNC': 145.60, 'TFC': 38.90,
        
        // Energy
        'XOM': 115.40, 'CVX': 165.90, 'COP': 125.40, 'EOG': 125.80, 'SLB': 48.90,
        'HAL': 38.40, 'OXY': 62.30, 'MPC': 145.90, 'VLO': 125.60, 'PSX': 115.40
      };
      
      const basePrice = basePrices[symbol] || random(5, 150);
      const priceVariation = random(-0.05, 0.05);
      const price = parseFloat((basePrice * (1 + priceVariation)).toFixed(2));
      
      // Generate realistic metrics with more variety
      const shortInterest = parseFloat(random(3, 45).toFixed(2));
      const utilization = parseFloat(Math.min(99.9, random(45, 98)).toFixed(1));
      const costToBorrow = parseFloat(Math.min(500, random(2, shortInterest * 4)).toFixed(2));
      const daysToCover = parseFloat(Math.min(20, random(0.3, shortInterest / 2.5)).toFixed(2));
      
      // Enhanced Holy Grail calculation
      let holyGrail = 0;
      holyGrail += Math.min(shortInterest * 2.2, 30); // SI component
      holyGrail += Math.min(utilization * 0.4, 35);    // Utilization component  
      holyGrail += Math.min(costToBorrow * 0.25, 25);  // CTB component
      holyGrail += Math.min(daysToCover * 1.8, 15);    // DTC component
      
      // Add randomness and special boosts for certain stocks
      if (['GME', 'AMC', 'BBBY', 'ATER'].includes(symbol)) {
        holyGrail += random(5, 15); // Meme stock boost
      }
      
      holyGrail = Math.min(100, Math.max(15, Math.round(holyGrail + random(-8, 12))));
      
      // Classify squeeze type based on metrics
      let squeezeType = 'MONITORING';
      let timing = 'EARLY';
      
      if (shortInterest > 25 && utilization > 90 && costToBorrow > 40) {
        squeezeType = 'GAMMA_SHORT_COMBO';
        timing = holyGrail > 85 ? 'IMMINENT' : 'BUILDING';
      } else if (shortInterest > 20 && utilization > 85 && daysToCover > 4) {
        squeezeType = 'CLASSIC_SHORT_SQUEEZE';
        timing = holyGrail > 80 ? 'IMMINENT' : 'BUILDING';
      } else if (costToBorrow > 60) {
        squeezeType = 'BORROWING_CRISIS';
        timing = costToBorrow > 100 ? 'IMMINENT' : 'BUILDING';
      } else if (holyGrail > 70) {
        squeezeType = 'POTENTIAL_SETUP';
        timing = holyGrail > 80 ? 'BUILDING' : 'MONITORING';
      }
      
      // Generate alerts
      const alerts = [];
      if (costToBorrow > 80) {
        alerts.push({
          level: 'CRITICAL',
          type: 'CTB_EXPLOSION',
          message: `Cost to borrow exploding: ${costToBorrow}%`
        });
      }
      if (holyGrail >= 90) {
        alerts.push({
          level: 'CRITICAL',
          type: 'LEGENDARY_SETUP', 
          message: `Legendary Holy Grail score: ${holyGrail}`
        });
      }
      if (utilization > 95) {
        alerts.push({
          level: 'HIGH',
          type: 'EXTREME_UTILIZATION',
          message: `Extreme utilization: ${utilization}%`
        });
      }
      
      return {
        symbol,
        price,
        change: parseFloat(random(-0.08, 0.08).toFixed(3)),
        holyGrail,
        squeeze: {
          classification: squeezeType,
          timing: timing,
          overall_score: holyGrail
        },
        alerts,
        shortInterest: {
          estimated: shortInterest,
          confidence: parseFloat(random(75, 95).toFixed(1))
        },
        availability: {
          utilization: utilization,
          available: Math.max(1000, Math.round(random(1000, 50000)))
        },
        costToBorrow: {
          current: costToBorrow,
          trend: costToBorrow > 80 ? 'EXPLODING' : 
                 costToBorrow > 40 ? 'RISING_FAST' :
                 costToBorrow > 20 ? 'RISING' : 'STABLE'
        },
        daysToCover: {
          ortex: daysToCover
        },
        timestamp: new Date().toISOString()
      };
    });
    
    // Sort by Holy Grail score (highest first)
    const sortedResults = results
      .sort((a, b) => b.holyGrail - a.holyGrail)
      .slice(0, 100); // Limit to top 100
    
    // Generate enhanced summary
    const summary = {
      total: sortedResults.length,
      legendary: sortedResults.filter(r => r.holyGrail >= 90).length,
      strong: sortedResults.filter(r => r.holyGrail >= 85 && r.holyGrail < 90).length,
      moderate: sortedResults.filter(r => r.holyGrail >= 75 && r.holyGrail < 85).length,
      weak: sortedResults.filter(r => r.holyGrail >= 60 && r.holyGrail < 75).length,
      alertCount: sortedResults.reduce((sum, r) => sum + r.alerts.length, 0),
      ctbExplosions: sortedResults.filter(r => r.costToBorrow?.trend === 'EXPLODING').length,
      imminentSqueezes: sortedResults.filter(r => r.squeeze?.timing === 'IMMINENT').length,
      topSqueezes: sortedResults.slice(0, 10).map(r => ({
        symbol: r.symbol,
        holyGrail: r.holyGrail,
        type: r.squeeze.classification
      }))
    };
    
    console.log(`✅ Expanded demo scan complete: ${sortedResults.length} results, ${summary.legendary} legendary setups`);
    
    res.status(200).json({
      success: true,
      summary,
      results: sortedResults,
      timestamp: new Date().toISOString(),
      mode: 'EXPANDED_DEMO',
      api_status: 'DEMO_ENHANCED'
    });
    
  } catch (error) {
    console.error('Expanded demo scan error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      api_status: 'ERROR'
    });
  }
}
