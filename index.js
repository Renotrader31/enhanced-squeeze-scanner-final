import { useState, useEffect } from 'react';
import Head from 'next/head';

// Simple working squeeze scanner with proper styling
export default function Home() {
  const [isScanning, setIsScanning] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    legendary: 0,
    strong: 0,
    moderate: 0,
    alertCount: 0,
    ctbExplosions: 0,
    imminentSqueezes: 0
  });

  const toggleScanning = async () => {
    if (isScanning) {
      setIsScanning(false);
      return;
    }
    
    setIsScanning(true);
    
    try {
      const response = await fetch('/api/scan-bulk-demo-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbols: ['AAPL', 'TSLA', 'GME', 'AMC', 'NVDA', 'GOOGL'],
          filters: {}
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStocks(data.results || []);
        setSummary(data.summary || summary);
      }
    } catch (error) {
      console.error('Scan error:', error);
    }
    
    setIsScanning(false);
  };

  const getHolyGrailColor = (score) => {
    if (score >= 90) return 'bg-purple-600 text-white';
    if (score >= 85) return 'bg-green-600 text-white';  
    if (score >= 75) return 'bg-blue-600 text-white';
    if (score >= 60) return 'bg-yellow-600 text-white';
    return 'bg-gray-600 text-white';
  };

  const getHolyGrailLabel = (score) => {
    if (score >= 90) return 'LEGENDARY 90+';
    if (score >= 85) return 'STRONG 85+';
    if (score >= 75) return 'MODERATE 75+';
    return 'WEAK';
  };

  return (
    <>
      <Head>
        <title>Enhanced Squeeze Scanner 4.0</title>
        <meta name="description" content="Professional squeeze scanner with Ortex integration" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      {/* Main Container with Inline Styles for Guaranteed Display */}
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
        color: '#e2e8f0',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderBottom: '2px solid #3f51b5',
          padding: '1.5rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            Professional Squeeze Scanner 4.0
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            ULTIMATE EDITION - ENHANCED ORTEX INTEGRATION
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }}></div>
              <span style={{ fontSize: '0.875rem' }}>Demo Mode - Realistic Test Data</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '8px', 
                height: '8px',
                backgroundColor: '#10b981',
                borderRadius: '50%'
              }}></div>
              <span style={{ fontSize: '0.875rem' }}>Stream Connected</span>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div style={{ padding: '1.5rem' }}>
          <button
            onClick={toggleScanning}
            disabled={isScanning}
            style={{
              background: isScanning 
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              border: 'none',
              color: 'white',
              fontWeight: '600',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: isScanning ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
            }}
          >
            {isScanning ? '⏸️ Stop Scan' : '▶️ Start Scan'}
          </button>
        </div>

        {/* Summary Dashboard */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '1.5rem',
          margin: '0 1.5rem 1.5rem 1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '1rem',
            textAlign: 'center'
          }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid #475569',
              borderRadius: '8px',
              padding: '1rem',
              borderTop: '3px solid #64748b'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                {summary.total}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>
                SCANNED
              </div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
              border: '1px solid #8b5cf6',
              borderRadius: '8px',
              padding: '1rem',
              animation: 'pulse 2s infinite'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                {summary.legendary}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'white', textTransform: 'uppercase' }}>
                LEGENDARY 90+
              </div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              border: '1px solid #10b981',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                {summary.strong}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'white', textTransform: 'uppercase' }}>
                STRONG 85+
              </div>
            </div>
            
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid #475569',
              borderRadius: '8px',
              padding: '1rem',
              borderTop: '3px solid #0ea5e9'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                {summary.moderate}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>
                MODERATE 75+
              </div>
            </div>
            
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid #475569',
              borderRadius: '8px',
              padding: '1rem',
              borderTop: '3px solid #64748b'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                {summary.ctbExplosions}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>
                CTB EXPLOSIONS
              </div>
            </div>
            
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid #475569',
              borderRadius: '8px',
              padding: '1rem',
              borderTop: '3px solid #64748b'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                {summary.imminentSqueezes}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>
                IMMINENT
              </div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '1rem',
              animation: 'pulse 2s infinite'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                {summary.alertCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'white', textTransform: 'uppercase' }}>
                ACTIVE ALERTS
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        {stocks.length > 0 && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid #334155',
            borderRadius: '12px',
            margin: '0 1.5rem',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
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
                      background: 'rgba(15, 23, 42, 0.5)'
                    }}>
                      <td style={cellStyle}>
                        <div style={{ fontWeight: 'bold', color: 'white' }}>
                          {stock.symbol}
                        </div>
                      </td>
                      <td style={cellStyle}>
                        <div style={{
                          ...getHolyGrailStyles(stock.holyGrail),
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontWeight: '700',
                          fontSize: '0.875rem',
                          textAlign: 'center'
                        }}>
                          {stock.holyGrail}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
                          {getHolyGrailLabel(stock.holyGrail)}
                        </div>
                      </td>
                      <td style={cellStyle}>
                        <div style={{ color: 'white' }}>
                          ${stock.price?.toFixed(2) || '0.00'}
                        </div>
                      </td>
                      <td style={cellStyle}>
                        <div style={{ color: 'white' }}>
                          {stock.shortInterest?.estimated?.toFixed(1) || '0.0'}%
                        </div>
                      </td>
                      <td style={cellStyle}>
                        <div style={{ color: 'white' }}>
                          {stock.availability?.utilization?.toFixed(1) || '0.0'}%
                        </div>
                      </td>
                      <td style={cellStyle}>
                        <div style={{ 
                          color: (stock.costToBorrow?.current || 0) > 50 ? '#ef4444' :
                                 (stock.costToBorrow?.current || 0) > 25 ? '#f59e0b' : 'white'
                        }}>
                          {stock.costToBorrow?.current?.toFixed(1) || '0.0'}%
                        </div>
                      </td>
                      <td style={cellStyle}>
                        <div style={{ color: '#9ca3af' }}>
                          {stock.daysToCover?.ortex?.toFixed(1) || '0.0'}
                        </div>
                      </td>
                      <td style={cellStyle}>
                        <div style={{ color: '#06b6d4', fontSize: '0.75rem' }}>
                          {stock.squeeze?.classification || 'MONITORING'}
                        </div>
                      </td>
                      <td style={cellStyle}>
                        <div style={{ 
                          color: stock.squeeze?.timing === 'IMMINENT' ? '#ef4444' :
                                 stock.squeeze?.timing === 'BUILDING' ? '#f59e0b' : '#9ca3af',
                          fontSize: '0.75rem',
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
        `}</style>
      </div>
    </>
  );
}

const headerStyle = {
  color: '#94a3b8',
  padding: '1rem 0.75rem',
  textAlign: 'left',
  fontSize: '0.75rem',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '1px'
};

const cellStyle = {
  padding: '0.75rem',
  fontSize: '0.875rem'
};

const getHolyGrailStyles = (score) => {
  if (score >= 90) return {
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    color: 'white',
    boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)'
  };
  if (score >= 85) return {
    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    color: 'white',
    boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)'
  };
  if (score >= 75) return {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
    color: 'white',
    boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)'
  };
  return {
    background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    color: 'white'
  };
};
