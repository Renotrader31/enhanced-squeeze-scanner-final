import { useState, useEffect } from 'react';

export default function DebugSummary() {
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

  // Auto-test on load
  useEffect(() => {
    console.log('🔄 Component mounted, testing API call in 2 seconds...');
    setTimeout(testApiCall, 2000);
  }, []);

  // Track summary state changes
  useEffect(() => {
    console.log('📊 Summary state updated:', summary);
  }, [summary]);

  const testApiCall = async () => {
    console.log('🚀 Testing API call...');
    
    try {
      const response = await fetch('/api/scan-bulk-expanded', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbols: ["AAPL", "TSLA", "GME"],
          filters: { minHolyGrail: 60 }
        })
      });
      
      const data = await response.json();
      console.log('📈 API Response received');
      console.log('📈 API Success:', data.success);
      console.log('📈 API Summary:', data.summary);
      
      if (data.success) {
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
        
        console.log('🔄 Setting new summary:', newSummary);
        setSummary(newSummary);
        console.log('✅ Summary set successfully!');
      }
    } catch (error) {
      console.error('❌ API Error:', error);
    }
  };

  return (
    <div style={{ 
      padding: '2rem', 
      background: '#0f172a', 
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'system-ui'
    }}>
      <h1>Debug Summary Test</h1>
      
      <button 
        onClick={testApiCall}
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          border: 'none',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem',
          marginBottom: '2rem'
        }}
      >
        Test API Call
      </button>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '1rem',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid #475569',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {summary.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            TOTAL SCANNED
          </div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          border: '1px solid #8b5cf6',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {summary.legendary}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'white' }}>
            LEGENDARY 90+
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          border: '1px solid #06d6a0',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {summary.strong}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'white' }}>
            STRONG 70+
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          border: '1px solid #fbbf24',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {summary.alertCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'white' }}>
            ALERTS
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', fontFamily: 'monospace' }}>
        <h3>Current Summary State:</h3>
        <pre>{JSON.stringify(summary, null, 2)}</pre>
      </div>
    </div>
  );
}