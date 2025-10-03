import { useState } from 'react';
import Head from 'next/head';

export default function TestScanner() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const runScan = async () => {
    setLoading(true);
    try {
      console.log('🚀 Starting test scan...');
      
      const response = await fetch('/api/scan-bulk-expanded', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbols: ['GME', 'AMC', 'TSLA', 'AAPL'],
          filters: {}
        })
      });
      
      const result = await response.json();
      console.log('📊 Scan result:', result);
      
      setData(result);
    } catch (error) {
      console.error('❌ Scan error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Test Scanner - Debug</title>
      </Head>
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
        color: '#e2e8f0',
        padding: '2rem'
      }}>
        <h1 style={{ color: 'white', marginBottom: '2rem' }}>Test Scanner - Debug Mode</h1>
        
        <button
          onClick={runScan}
          disabled={loading}
          style={{
            background: loading ? '#666' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            border: 'none',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontSize: '1.1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '2rem'
          }}
        >
          {loading ? 'Scanning...' : 'Run Test Scan'}
        </button>

        {data && (
          <div>
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Scan Results:</h2>
            
            {/* Summary */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '2rem'
            }}>
              <h3 style={{ color: 'white', marginBottom: '1rem' }}>Summary:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#a855f7' }}>
                    {data.summary?.legendary || 0}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>LEGENDARY</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                    {data.summary?.strong || 0}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>STRONG</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    {data.summary?.moderate || 0}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>MODERATE</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
                    {data.summary?.alertCount || 0}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>ALERTS</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                    {data.summary?.ctbExplosions || 0}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>CTB EXPLOSIONS</div>
                </div>
              </div>
            </div>

            {/* Top Stocks */}
            {data.results && data.results.length > 0 && (
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '1.5rem',
                borderRadius: '12px'
              }}>
                <h3 style={{ color: 'white', marginBottom: '1rem' }}>Top Stocks:</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {data.results.slice(0, 10).map((stock, index) => (
                    <div key={stock.symbol} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(0, 0, 0, 0.3)',
                      padding: '1rem',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <span style={{ fontWeight: 'bold', color: 'white', fontSize: '1.1rem' }}>
                          {stock.symbol}
                        </span>
                        <span style={{ marginLeft: '1rem', color: '#9ca3af' }}>
                          ${stock.price?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div style={{
                        background: stock.holyGrail >= 90 ? '#a855f7' : 
                                  stock.holyGrail >= 85 ? '#10b981' : 
                                  stock.holyGrail >= 75 ? '#3b82f6' : '#6b7280',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontWeight: 'bold'
                      }}>
                        {stock.holyGrail}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Data */}
            <details style={{ marginTop: '2rem' }}>
              <summary style={{ color: 'white', cursor: 'pointer', marginBottom: '1rem' }}>
                Raw API Response (Click to expand)
              </summary>
              <pre style={{
                background: 'rgba(0, 0, 0, 0.5)',
                color: '#10b981',
                padding: '1rem',
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '0.875rem',
                maxHeight: '400px'
              }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </>
  );
}