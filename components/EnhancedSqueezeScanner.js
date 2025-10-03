// Update your EnhancedSqueezeScanner component with these changes:

// 1. In your component, update the startBulkScan function (around line 75):

const startBulkScan = async () => {
  try {
    // Choose endpoint based on environment variable or toggle
    const useLiveData = process.env.NEXT_PUBLIC_USE_LIVE_DATA === 'true';
    const endpoint = useLiveData ? '/api/scan-live-ortex' : '/api/scan-bulk-expanded';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbols: DEFAULT_SYMBOLS, // Will use expanded symbol list from API
        filters: filters
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setStocks(data.results);
      setSummary(data.summary);
      setApiMode(data.mode || 'UNKNOWN');
      
      // Extract alerts
      const allAlerts = data.results.flatMap(stock => 
        (stock.alerts || []).map(alert => ({
          ...alert,
          symbol: stock.symbol,
          timestamp: new Date().toISOString()
        }))
      );
      setAlerts(allAlerts);
      
      console.log(`✅ Scan complete: ${data.results.length} stocks processed`);
    } else {
      console.error('Scan failed:', data.error);
      setApiMode('ERROR');
    }
    
  } catch (error) {
    console.error('Scan error:', error);
    setApiMode('ERROR');
  }
};

// 2. Add these new expanded symbols to replace DEFAULT_SYMBOLS (around line 50):

const DEFAULT_SYMBOLS = [
  // This will be overridden by the API's expanded symbol list
  'GME', 'AMC', 'BBBY', 'ATER', 'TSLA', 'AAPL', 'NVDA', 'MSFT'
];

// 3. Update the header to show mode (around line 280):

<div className="flex items-center mt-2">
  <div className={`w-2 h-2 rounded-full mr-2 ${
    apiMode === 'LIVE_ORTEX' ? 'bg-green-500 animate-pulse' : 
    apiMode === 'EXPANDED_DEMO' ? 'bg-blue-500 animate-pulse' :
    apiMode === 'ERROR' ? 'bg-red-500' : 'bg-yellow-500'
  }`}></div>
  <span className="text-sm text-gray-300">
    {apiMode === 'LIVE_ORTEX' ? 'Live Ortex Data' :
     apiMode === 'EXPANDED_DEMO' ? 'Expanded Demo Data - 100+ Stocks' :
     apiMode === 'ERROR' ? 'API Error' : 'Demo Mode - Realistic Test Data'}
  </span>
  <div className="flex items-center ml-4">
    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
    <span className="text-sm text-gray-300">Stream Connected</span>
  </div>
</div>
