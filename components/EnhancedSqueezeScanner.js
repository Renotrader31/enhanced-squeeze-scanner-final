import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const io = typeof window !== 'undefined' ? require('socket.io-client') : null;

const EnhancedSqueezeScanner = () => {
  // State management
  const [isScanning, setIsScanning] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    legendary: 0,
    strong: 0,
    moderate: 0,
    weak: 0,
    alertCount: 0,
    ctbExplosions: 0,
    imminentSqueezes: 0
  });

  // Debug summary updates
  useEffect(() => {
    console.log('📊 Summary state updated:', summary);
  }, [summary]);

  // Auto-start scan on component mount for better UX
  useEffect(() => {
    console.log('🔄 Component mounted - starting initial scan for better UX');
    // Trigger initial scan after component mounts for immediate data
    setTimeout(() => {
      if (!realTimeMode && !isScanning) {
        console.log('🚀 Auto-starting initial scan...');
        startBulkScan();
      }
    }, 1500);
  }, []);
  const [apiMode, setApiMode] = useState('DEMO');
  const [useExpandedData, setUseExpandedData] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [filters, setFilters] = useState({
    minHolyGrail: 60,
    minShortInterest: 15,
    minUtilization: 80
  });
  
  // Refs for intervals and websocket
  const refreshInterval = useRef(null);
  const socket = useRef(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Default symbols for scanning
  const DEFAULT_SYMBOLS = [
    'GME', 'AMC', 'BBBY', 'ATER', 'TSLA', 'AAPL', 'NVDA', 'MSFT'
  ];

  // Client-side check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // WebSocket initialization (client-side only)
  useEffect(() => {
    if (!isClient || !io) return;
    
    // Initialize WebSocket connection
    const initializeWebSocket = async () => {
      try {
        await fetch('/api/websocket-scanner');
        socket.current = io();
      
      socket.current.on('connect', () => {
        console.log('🔌 WebSocket connected');
        setWsConnected(true);
      });
      
      socket.current.on('disconnect', () => {
        console.log('🔌 WebSocket disconnected');
        setWsConnected(false);
      });
      
      socket.current.on('scan-started', (data) => {
        console.log('🚀 Scan started:', data);
        setIsScanning(true);
        setScanProgress(0);
      });
      
      socket.current.on('scan-progress', (data) => {
        console.log('📈 Scan progress:', data);
        setScanProgress(data.progress);
      });
      
      socket.current.on('scan-complete', (data) => {
        console.log('✅ Scan complete:', data);
        setStocks(data.results || []);
        setSummary(data.summary || summary);
        setApiMode(data.mode || 'DEMO');
        
        const allAlerts = (data.results || []).flatMap(stock => 
          (stock.alerts || []).map(alert => ({
            ...alert,
            symbol: stock.symbol,
            timestamp: new Date().toISOString()
          }))
        );
        setAlerts(allAlerts);
        
        // Send browser notifications for critical alerts
        if (notificationsEnabled && allAlerts.length > 0) {
          const criticalAlerts = allAlerts.filter(alert => alert.level === 'CRITICAL');
          criticalAlerts.forEach(alert => {
            showNotification(`🚨 ${alert.symbol}`, alert.message);
          });
        }
        
        setScanProgress(100);
      });
      
      socket.current.on('stock-update', (data) => {
        // Real-time individual stock updates
        console.log('📊 Stock update:', data.stock.symbol);
        setStocks(prevStocks => {
          const updated = [...prevStocks];
          const existingIndex = updated.findIndex(s => s.symbol === data.stock.symbol);
          if (existingIndex >= 0) {
            updated[existingIndex] = { ...updated[existingIndex], ...data.stock };
          } else {
            updated.push(data.stock);
          }
          return updated.sort((a, b) => b.holyGrail - a.holyGrail);
        });
      });
      
      socket.current.on('scan-finished', (data) => {
        console.log('🏁 Scan finished:', data);
        setIsScanning(false);
        setScanProgress(0);
      });
      
      socket.current.on('scan-error', (data) => {
        console.error('❌ Scan error:', data);
        setApiMode('ERROR');
        setIsScanning(false);
        setScanProgress(0);
      });
      } catch (error) {
        console.error('WebSocket initialization error:', error);
      }
    };
    
    initializeWebSocket();
    
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [isClient]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && !isScanning && !realTimeMode) {
      refreshInterval.current = setInterval(() => {
        console.log('🔄 Auto-refreshing data...');
        startBulkScan();
      }, 30000); // Refresh every 30 seconds
      
      return () => {
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
        }
      };
    }
  }, [autoRefresh, isScanning, realTimeMode]);

  // Enhanced scan function with data source switching
  const startBulkScan = async () => {
    if (isScanning) return;
    
    if (realTimeMode && socket.current && wsConnected) {
      // Use WebSocket for real-time scanning
      console.log('🚀 Starting real-time WebSocket scan...');
      socket.current.emit('start-scan', {
        useExpandedData,
        filters,
        autoRefresh: autoRefresh && realTimeMode
      });
    } else {
      // Use traditional API calls
      setIsScanning(true);
      setScanProgress(10);
      
      try {
        // Determine endpoint based on configuration
        let endpoint = '/api/scan-bulk-demo-simple';
        
        // Check for live data preference
        const useLiveData = process.env.NEXT_PUBLIC_USE_LIVE_DATA === 'true';
        
        if (useLiveData) {
          endpoint = '/api/scan-live-ortex';
        } else if (useExpandedData) {
          endpoint = '/api/scan-bulk-expanded';
        }
        
        console.log(`🚀 Starting scan with endpoint: ${endpoint}`);
        console.log(`📋 Scan config: useExpandedData=${useExpandedData}, useLiveData=${useLiveData}`);
        console.log(`🔍 Final endpoint decision: ${endpoint}`);
        setScanProgress(30);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            symbols: DEFAULT_SYMBOLS,
            filters: filters
          })
        });
        
        setScanProgress(60);
        const data = await response.json();
        
        console.log(`📈 API Response:`, data.success ? 'Success' : 'Failed');
        console.log(`📊 Data received:`, {
          resultsCount: data.results?.length || 0,
          summaryLegendary: data.summary?.legendary || 0,
          mode: data.mode
        });
        
        if (data.success) {
          console.log('✅ Setting stocks:', data.results?.length || 0);
          console.log('✅ Setting summary:', data.summary);
          console.log('✅ Previous summary state:', summary);
          
          // Set the summary first to check if it's working
          const newSummary = {
            total: data.summary?.total || 0,
            legendary: data.summary?.legendary || 0,
            strong: data.summary?.strong || 0,
            moderate: data.summary?.moderate || 0,
            weak: data.summary?.weak || 0,
            alertCount: data.summary?.alertCount || 0,
            ctbExplosions: data.summary?.ctbExplosions || 0,
            imminentSqueezes: data.summary?.imminentSqueezes || 0
          };
          
          console.log('✅ New summary to set:', newSummary);
          setStocks(data.results || []);
          setSummary(newSummary);
          setApiMode(data.mode || 'DEMO');
          
          // Extract and process alerts
          const allAlerts = (data.results || []).flatMap(stock => 
            (stock.alerts || []).map(alert => ({
              ...alert,
              symbol: stock.symbol,
              timestamp: new Date().toISOString()
            }))
          );
          setAlerts(allAlerts);
          setScanProgress(100);
          
          console.log(`✅ Scan complete: ${data.results?.length || 0} stocks processed`);
          console.log(`📊 Summary: ${data.summary?.legendary || 0} legendary, ${data.summary?.strong || 0} strong`);
        } else {
          console.error('❌ Scan failed:', data.error);
          setApiMode('ERROR');
        }
        
      } catch (error) {
        console.error('❌ Scan error:', error);
        setApiMode('ERROR');
      } finally {
        setIsScanning(false);
        setTimeout(() => setScanProgress(0), 2000);
      }
    }
  };

  // Stop scanning
  const stopScanning = () => {
    if (realTimeMode && socket.current) {
      socket.current.emit('stop-scan');
    }
    setIsScanning(false);
    setScanProgress(0);
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
    }
  };

  // Utility functions
  const getHolyGrailColor = (score) => {
    if (score >= 90) return 'bg-purple-600 text-white shadow-lg shadow-purple-500/50';
    if (score >= 85) return 'bg-green-600 text-white shadow-lg shadow-green-500/30';
    if (score >= 75) return 'bg-blue-600 text-white shadow-lg shadow-blue-500/30';
    if (score >= 60) return 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/30';
    return 'bg-gray-600 text-white';
  };

  const getHolyGrailLabel = (score) => {
    if (score >= 90) return 'LEGENDARY';
    if (score >= 85) return 'STRONG';
    if (score >= 75) return 'MODERATE';
    return 'WEAK';
  };

  const formatCurrency = (value) => {
    return value ? `$${value.toFixed(2)}` : '$0.00';
  };

  const formatPercent = (value, decimals = 1) => {
    return value ? `${value.toFixed(decimals)}%` : '0.0%';
  };

  // Notification functions (client-side only)
  const requestNotificationPermission = async () => {
    if (isClient && typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      return permission === 'granted';
    }
    return false;
  };

  const showNotification = (title, message) => {
    if (isClient && notificationsEnabled && typeof window !== 'undefined' && 'Notification' in window) {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  };

  const getApiStatusIndicator = () => {
    const indicators = {
      'LIVE_ORTEX': { color: 'bg-green-500', text: 'Live Ortex Data', pulse: true },
      'EXPANDED_DEMO': { color: 'bg-blue-500', text: 'Expanded Demo - 100+ Stocks', pulse: true },
      'DEMO': { color: 'bg-yellow-500', text: 'Demo Mode - Realistic Test Data', pulse: false },
      'ERROR': { color: 'bg-red-500', text: 'API Error', pulse: false }
    };
    
    return indicators[apiMode] || indicators['DEMO'];
  };

  const statusIndicator = getApiStatusIndicator();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Enhanced Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderBottom: '2px solid #3f51b5',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
          animation: 'pulse 4s ease-in-out infinite'
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
            textShadow: '0 0 30px rgba(59, 130, 246, 0.3)'
          }}>
            Professional Squeeze Scanner 4.0
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            fontWeight: '600'
          }}>
            ULTIMATE EDITION - ENHANCED ORTEX INTEGRATION
          </p>
          
          {/* Status Indicators */}
          <div style={{ 
            marginTop: '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '10px',
                height: '10px',
                backgroundColor: statusIndicator.color.replace('bg-', '#'),
                borderRadius: '50%',
                animation: statusIndicator.pulse ? 'pulse 2s infinite' : 'none',
                boxShadow: `0 0 10px ${statusIndicator.color.replace('bg-', '#')}40`
              }}></div>
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                {statusIndicator.text}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '10px',
                height: '10px',
                backgroundColor: wsConnected ? '#10b981' : '#ef4444',
                borderRadius: '50%',
                animation: wsConnected ? 'pulse 2s infinite' : 'none',
                boxShadow: `0 0 10px ${wsConnected ? '#10b98140' : '#ef444440'}`
              }}></div>
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                {wsConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
              </span>
            </div>

            {isClient && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                  Last Update: {new Date().toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Control Panel */}
      <div style={{ 
        padding: '2rem',
        background: 'rgba(15, 23, 42, 0.5)',
        borderBottom: '1px solid #334155'
      }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Main Scan Button */}
          <button
            onClick={isScanning ? stopScanning : startBulkScan}
            disabled={false}
            style={{
              background: isScanning 
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              border: 'none',
              color: 'white',
              fontWeight: '600',
              padding: '1rem 2rem',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: isScanning 
                ? '0 4px 20px rgba(239, 68, 68, 0.4)'
                : '0 4px 20px rgba(59, 130, 246, 0.4)',
              transition: 'all 0.3s ease',
              minWidth: '160px'
            }}
          >
            {isScanning ? '⏸️ Stop Scan' : '▶️ Start Scan'}
          </button>

          {/* Data Source Toggle */}
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={useExpandedData}
              onChange={(e) => setUseExpandedData(e.target.checked)}
              style={{
                width: '16px',
                height: '16px'
              }}
            />
            <span>Expanded Dataset (100+ stocks)</span>
          </label>

          {/* Real-time Mode Toggle */}
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={realTimeMode}
              onChange={(e) => setRealTimeMode(e.target.checked)}
              disabled={!wsConnected}
              style={{
                width: '16px',
                height: '16px'
              }}
            />
            <span>Real-time Mode {!wsConnected && '(WebSocket required)'}</span>
          </label>

          {/* Auto-refresh Toggle */}
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{
                width: '16px',
                height: '16px'
              }}
            />
            <span>Auto-refresh (30s)</span>
          </label>

          {/* Browser Notifications Toggle */}
          <button
            onClick={requestNotificationPermission}
            style={{
              background: notificationsEnabled 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
              border: 'none',
              color: 'white',
              fontSize: '0.875rem',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔔 {notificationsEnabled ? 'Notifications ON' : 'Enable Notifications'}
          </button>

          {/* Filter Controls */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ fontSize: '0.875rem' }}>
              Min Holy Grail:
              <input
                type="number"
                value={filters.minHolyGrail}
                onChange={(e) => setFilters({...filters, minHolyGrail: parseInt(e.target.value)})}
                min="0"
                max="100"
                style={{
                  marginLeft: '0.5rem',
                  padding: '0.25rem',
                  width: '60px',
                  borderRadius: '4px',
                  border: '1px solid #475569',
                  background: '#1e293b',
                  color: 'white'
                }}
              />
            </label>
          </div>
        </div>

        {/* Scan Progress Indicator */}
        {(isScanning || scanProgress > 0) && (
          <div style={{
            marginTop: '1rem',
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '8px',
            padding: '1rem',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                {isScanning ? 'Scanning in progress...' : 'Scan completed'}
              </span>
              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                {scanProgress}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(59, 130, 246, 0.2)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${scanProgress}%`,
                height: '100%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Summary Dashboard */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid #334155',
        borderRadius: '16px',
        padding: '2rem',
        margin: '0 2rem 2rem 2rem',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '1.5rem',
          textAlign: 'center'
        }}>
          {/* Total Scanned */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid #475569',
            borderRadius: '12px',
            padding: '1.5rem',
            borderTop: '3px solid #64748b',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
              {summary.total}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>
              TOTAL SCANNED
            </div>
          </div>
          
          {/* Legendary */}
          <div style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
            border: '1px solid #8b5cf6',
            borderRadius: '12px',
            padding: '1.5rem',
            animation: summary.legendary > 0 ? 'pulse 2s infinite' : 'none',
            boxShadow: '0 8px 25px rgba(168, 85, 247, 0.4)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
              {summary.legendary}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>
              LEGENDARY 90+
            </div>
          </div>
          
          {/* Strong */}
          <div style={{
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            border: '1px solid #10b981',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
              {summary.strong}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>
              STRONG 85+
            </div>
          </div>
          
          {/* Moderate */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid #475569',
            borderRadius: '12px',
            padding: '1.5rem',
            borderTop: '3px solid #0ea5e9'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
              {summary.moderate}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>
              MODERATE 75+
            </div>
          </div>
          
          {/* CTB Explosions */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid #475569',
            borderRadius: '12px',
            padding: '1.5rem',
            borderTop: '3px solid #f59e0b'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
              {summary.ctbExplosions}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>
              CTB EXPLOSIONS
            </div>
          </div>
          
          {/* Imminent Squeezes */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid #475569',
            borderRadius: '12px',
            padding: '1.5rem',
            borderTop: '3px solid #64748b'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
              {summary.imminentSqueezes}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>
              IMMINENT
            </div>
          </div>
          
          {/* Active Alerts */}
          <div style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            padding: '1.5rem',
            animation: summary.alertCount > 0 ? 'pulse 2s infinite' : 'none',
            boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
              {summary.alertCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>
              ACTIVE ALERTS
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Alerts Panel */}
      {alerts.length > 0 && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          margin: '0 2rem 2rem 2rem',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
            padding: '1rem',
            borderBottom: '1px solid #ef4444'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🚨 ACTIVE ALERTS ({alerts.length})
            </h3>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ 
              display: 'grid',
              gap: '0.75rem',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {alerts.slice(0, 10).map((alert, index) => (
                <div key={index} style={{
                  background: alert.level === 'CRITICAL' 
                    ? 'rgba(239, 68, 68, 0.1)' 
                    : 'rgba(251, 191, 36, 0.1)',
                  border: `1px solid ${alert.level === 'CRITICAL' ? '#ef4444' : '#f59e0b'}`,
                  borderRadius: '8px',
                  padding: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      color: alert.level === 'CRITICAL' ? '#ef4444' : '#f59e0b'
                    }}>
                      {alert.symbol} - {alert.type.replace(/_/g, ' ')}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      marginTop: '2px'
                    }}>
                      {alert.message}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#64748b'
                  }}>
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {stocks.length > 0 && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid #334155',
          borderRadius: '16px',
          margin: '0 2rem',
          overflow: 'hidden',
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  borderBottom: '2px solid #475569'
                }}>
                  <th style={headerStyle}>SYMBOL</th>
                  <th style={headerStyle}>HOLY GRAIL</th>
                  <th style={headerStyle}>PRICE</th>
                  <th style={headerStyle}>SI%</th>
                  <th style={headerStyle}>UTIL%</th>
                  <th style={headerStyle}>CTB%</th>
                  <th style={headerStyle}>DTC</th>
                  <th style={headerStyle}>SQUEEZE TYPE</th>
                  <th style={headerStyle}>TIMING</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock, index) => (
                  <tr key={stock.symbol} style={{
                    borderBottom: '1px solid #374151',
                    background: index % 2 === 0 ? 'rgba(15, 23, 42, 0.7)' : 'rgba(15, 23, 42, 0.4)',
                    transition: 'background-color 0.2s ease'
                  }}>
                    <td style={cellStyle}>
                      <div style={{ fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>
                        {stock.symbol}
                      </div>
                    </td>
                    <td style={cellStyle}>
                      <div style={{
                        ...getHolyGrailStyles(stock.holyGrail),
                        padding: '0.5rem 1rem',
                        borderRadius: '25px',
                        fontWeight: '700',
                        fontSize: '1rem',
                        textAlign: 'center',
                        minWidth: '80px'
                      }}>
                        {stock.holyGrail}
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#9ca3af', 
                        marginTop: '4px',
                        textAlign: 'center'
                      }}>
                        {getHolyGrailLabel(stock.holyGrail)}
                      </div>
                    </td>
                    <td style={cellStyle}>
                      <div style={{ color: 'white', fontWeight: '500' }}>
                        {formatCurrency(stock.price)}
                      </div>
                    </td>
                    <td style={cellStyle}>
                      <div style={{ color: 'white', fontWeight: '500' }}>
                        {formatPercent(stock.shortInterest?.estimated)}
                      </div>
                    </td>
                    <td style={cellStyle}>
                      <div style={{ color: 'white', fontWeight: '500' }}>
                        {formatPercent(stock.availability?.utilization)}
                      </div>
                    </td>
                    <td style={cellStyle}>
                      <div style={{ 
                        color: (stock.costToBorrow?.current || 0) > 50 ? '#ef4444' :
                               (stock.costToBorrow?.current || 0) > 25 ? '#f59e0b' : 'white',
                        fontWeight: '600'
                      }}>
                        {formatPercent(stock.costToBorrow?.current)}
                      </div>
                    </td>
                    <td style={cellStyle}>
                      <div style={{ color: '#9ca3af', fontWeight: '500' }}>
                        {stock.daysToCover?.ortex?.toFixed(1) || '0.0'}
                      </div>
                    </td>
                    <td style={cellStyle}>
                      <div style={{ 
                        color: '#06b6d4', 
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        {stock.squeeze?.classification || 'MONITORING'}
                      </div>
                    </td>
                    <td style={cellStyle}>
                      <div style={{ 
                        color: stock.squeeze?.timing === 'IMMINENT' ? '#ef4444' :
                               stock.squeeze?.timing === 'BUILDING' ? '#f59e0b' : '#9ca3af',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}>
                        {stock.squeeze?.timing || 'EARLY'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// Styles
const headerStyle = {
  color: '#94a3b8',
  padding: '1.5rem 1rem',
  textAlign: 'left',
  fontSize: '0.8rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '1px'
};

const cellStyle = {
  padding: '1rem',
  fontSize: '0.875rem'
};

const getHolyGrailStyles = (score) => {
  if (score >= 90) return {
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    color: 'white',
    boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)'
  };
  if (score >= 85) return {
    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    color: 'white',
    boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
  };
  if (score >= 75) return {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
    color: 'white',
    boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
  };
  return {
    background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    color: 'white'
  };
};

export default EnhancedSqueezeScanner;