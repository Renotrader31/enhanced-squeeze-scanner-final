// WebSocket Scanner - Real-time data streaming
import { Server } from 'socket.io';

const handler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    // Handle new connections
    io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Handle scan start request
      socket.on('start-scan', async (params) => {
        console.log(`🚀 Starting scan for client ${socket.id}:`, params);
        
        try {
          await performLiveScan(socket, params);
        } catch (error) {
          console.error('Scan error:', error);
          socket.emit('scan-error', { error: error.message });
        }
      });

      // Handle scan stop request
      socket.on('stop-scan', () => {
        console.log(`⏹️ Stopping scan for client ${socket.id}`);
        socket.scanActive = false;
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        socket.scanActive = false;
      });
    });
  }
  res.end();
};

// Perform live scanning with real-time updates
async function performLiveScan(socket, params) {
  const { useExpandedData = true, filters = {}, autoRefresh = false } = params;
  
  socket.scanActive = true;
  
  // Determine which endpoint to use
  const useLiveData = process.env.NEXT_PUBLIC_USE_LIVE_DATA === 'true';
  const endpoint = useLiveData ? 'live-ortex' : (useExpandedData ? 'expanded' : 'simple');
  
  let scanCount = 0;
  const maxScans = autoRefresh ? 1000 : 1; // Continuous if auto-refresh
  
  while (socket.scanActive && scanCount < maxScans) {
    try {
      // Emit scan start
      socket.emit('scan-started', { 
        timestamp: new Date().toISOString(),
        endpoint,
        scanCount: scanCount + 1
      });

      // Perform the actual scan
      const scanResult = await performScanIteration(endpoint, filters);
      
      if (scanResult.success) {
        // Emit progressive updates
        socket.emit('scan-progress', {
          progress: 50,
          message: 'Processing results...'
        });

        // Process and emit results
        const processedData = await processResults(scanResult);
        
        socket.emit('scan-complete', {
          ...processedData,
          timestamp: new Date().toISOString(),
          scanCount: scanCount + 1
        });

        // Emit individual stock updates for real-time feel
        for (const [index, stock] of processedData.results.entries()) {
          if (!socket.scanActive) break;
          
          setTimeout(() => {
            if (socket.scanActive) {
              socket.emit('stock-update', {
                stock,
                index,
                total: processedData.results.length
              });
            }
          }, index * 100); // Stagger updates
        }
      } else {
        socket.emit('scan-error', scanResult);
      }

      scanCount++;
      
      // If auto-refresh is enabled, wait and continue
      if (autoRefresh && socket.scanActive) {
        socket.emit('scan-waiting', { 
          nextScanIn: 30,
          message: 'Waiting for next scan...' 
        });
        
        await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
      }
      
    } catch (error) {
      console.error('Scan iteration error:', error);
      socket.emit('scan-error', { error: error.message });
      break;
    }
  }
  
  socket.scanActive = false;
  socket.emit('scan-finished', { 
    totalScans: scanCount,
    timestamp: new Date().toISOString()
  });
}

// Perform a single scan iteration
async function performScanIteration(endpoint, filters) {
  try {
    const symbols = [
      'GME', 'AMC', 'BBBY', 'ATER', 'PROG', 'TSLA', 'AAPL', 'NVDA', 'MSFT'
    ];

    // Simulate API call based on endpoint
    let apiUrl;
    let requestBody = { symbols, filters };

    switch (endpoint) {
      case 'live-ortex':
        apiUrl = '/api/scan-live-ortex';
        break;
      case 'expanded':
        apiUrl = '/api/scan-bulk-expanded';
        break;
      default:
        apiUrl = '/api/scan-bulk-demo-simple';
    }

    // Since we're in a server context, we need to make an internal API call
    // For now, let's directly call the scanner logic
    
    if (endpoint === 'expanded') {
      return await generateExpandedDemoData(symbols, filters);
    } else {
      return await generateSimpleDemoData(symbols, filters);
    }
    
  } catch (error) {
    console.error('Scan iteration error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Generate expanded demo data (inline implementation)
async function generateExpandedDemoData(symbols, filters) {
  const EXPANDED_SYMBOLS = [
    'GME', 'AMC', 'BBBY', 'ATER', 'PROG', 'SPRT', 'TSLA', 'AAPL', 'NVDA', 'MSFT',
    'GOOGL', 'AMZN', 'META', 'NFLX', 'BYND', 'NKLA', 'RIDE', 'WKHS', 'LCID', 'RIVN'
  ];

  const symbolsToScan = symbols.length > 0 ? symbols : EXPANDED_SYMBOLS;
  
  const results = symbolsToScan.map(symbol => {
    const now = Date.now();
    const seed = symbol.split('').reduce((a, b) => a + b.charCodeAt(0), 0) + Math.floor(now / 60000);
    const random = (min, max) => min + (seed * 9301 + 49297) % 233280 / 233280 * (max - min);
    
    const basePrices = {
      'GME': 18.25, 'AMC': 4.45, 'TSLA': 245.75, 'AAPL': 195.50, 'NVDA': 485.20
    };
    
    const basePrice = basePrices[symbol] || random(5, 150);
    const price = parseFloat((basePrice * (1 + random(-0.05, 0.05))).toFixed(2));
    
    const shortInterest = parseFloat(random(3, 45).toFixed(2));
    const utilization = parseFloat(Math.min(99.9, random(45, 98)).toFixed(1));
    const costToBorrow = parseFloat(Math.min(500, random(2, shortInterest * 4)).toFixed(2));
    const daysToCover = parseFloat(Math.min(20, random(0.3, shortInterest / 2.5)).toFixed(2));
    
    let holyGrail = 0;
    holyGrail += Math.min(shortInterest * 2.2, 30);
    holyGrail += Math.min(utilization * 0.4, 35);
    holyGrail += Math.min(costToBorrow * 0.25, 25);
    holyGrail += Math.min(daysToCover * 1.8, 15);
    
    if (['GME', 'AMC', 'BBBY', 'ATER'].includes(symbol)) {
      holyGrail += random(5, 15);
    }
    
    holyGrail = Math.min(100, Math.max(15, Math.round(holyGrail + random(-8, 12))));
    
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
    
    return {
      symbol,
      price,
      change: parseFloat(random(-0.08, 0.08).toFixed(3)),
      holyGrail,
      squeeze: {
        classification: holyGrail > 85 ? 'GAMMA_SHORT_COMBO' : 
                      holyGrail > 75 ? 'CLASSIC_SHORT_SQUEEZE' : 'MONITORING',
        timing: holyGrail > 85 ? 'IMMINENT' : holyGrail > 75 ? 'BUILDING' : 'EARLY',
        overall_score: holyGrail
      },
      alerts,
      shortInterest: { estimated: shortInterest, confidence: parseFloat(random(75, 95).toFixed(1)) },
      availability: { utilization: utilization, available: Math.max(1000, Math.round(random(1000, 50000))) },
      costToBorrow: { 
        current: costToBorrow,
        trend: costToBorrow > 80 ? 'EXPLODING' : costToBorrow > 40 ? 'RISING_FAST' : 'STABLE'
      },
      daysToCover: { ortex: daysToCover },
      timestamp: new Date().toISOString()
    };
  });

  // Apply filters
  let filteredResults = results;
  if (filters.minHolyGrail) {
    filteredResults = filteredResults.filter(r => r.holyGrail >= filters.minHolyGrail);
  }
  if (filters.minShortInterest) {
    filteredResults = filteredResults.filter(r => r.shortInterest.estimated >= filters.minShortInterest);
  }
  if (filters.minUtilization) {
    filteredResults = filteredResults.filter(r => r.availability.utilization >= filters.minUtilization);
  }

  const sortedResults = filteredResults.sort((a, b) => b.holyGrail - a.holyGrail);
  
  return {
    success: true,
    results: sortedResults,
    summary: {
      total: sortedResults.length,
      legendary: sortedResults.filter(r => r.holyGrail >= 90).length,
      strong: sortedResults.filter(r => r.holyGrail >= 85 && r.holyGrail < 90).length,
      moderate: sortedResults.filter(r => r.holyGrail >= 75 && r.holyGrail < 85).length,
      alertCount: sortedResults.reduce((sum, r) => sum + r.alerts.length, 0),
      ctbExplosions: sortedResults.filter(r => r.costToBorrow?.trend === 'EXPLODING').length,
      imminentSqueezes: sortedResults.filter(r => r.squeeze?.timing === 'IMMINENT').length
    },
    mode: 'EXPANDED_DEMO'
  };
}

// Generate simple demo data
async function generateSimpleDemoData(symbols, filters) {
  // Simplified version for basic scanning
  const results = symbols.map(symbol => ({
    symbol,
    price: parseFloat((Math.random() * 200 + 10).toFixed(2)),
    holyGrail: Math.round(Math.random() * 100),
    squeeze: { classification: 'MONITORING', timing: 'EARLY', overall_score: 50 },
    alerts: [],
    shortInterest: { estimated: parseFloat((Math.random() * 30).toFixed(1)) },
    availability: { utilization: parseFloat((Math.random() * 100).toFixed(1)) },
    costToBorrow: { current: parseFloat((Math.random() * 100).toFixed(1)) },
    daysToCover: { ortex: parseFloat((Math.random() * 10).toFixed(1)) }
  }));

  return {
    success: true,
    results: results.sort((a, b) => b.holyGrail - a.holyGrail),
    summary: {
      total: results.length,
      legendary: 0,
      strong: 0,
      moderate: 1,
      alertCount: 0,
      ctbExplosions: 0,
      imminentSqueezes: 0
    },
    mode: 'SIMPLE_DEMO'
  };
}

// Process results for enhanced presentation
async function processResults(scanResult) {
  // Add some processing delay for realism
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Add real-time timestamps
  if (scanResult.results) {
    scanResult.results = scanResult.results.map(stock => ({
      ...stock,
      lastUpdate: new Date().toISOString(),
      dataAge: '< 1min'
    }));
  }
  
  return scanResult;
}

export default handler;