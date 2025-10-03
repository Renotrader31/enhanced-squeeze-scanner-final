import Head from 'next/head';
import dynamic from 'next/dynamic';

// Import component with no SSR to avoid hydration issues
const EnhancedSqueezeScanner = dynamic(
  () => import('../components/EnhancedSqueezeScanner'),
  { 
    ssr: false,
    loading: () => (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
        color: '#e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem'
      }}>
        🚀 Loading Enhanced Squeeze Scanner...
      </div>
    )
  }
);

export default function Home() {
  return (
    <>
      <Head>
        <title>Enhanced Squeeze Scanner 4.0 - Professional Edition</title>
        <meta name="description" content="Professional squeeze scanner with real-time Ortex integration and advanced analytics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <EnhancedSqueezeScanner />
    </>
  );
}