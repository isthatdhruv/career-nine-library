import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';

const ProductionDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Get environment info
    const isProduction = process.env.NODE_ENV === 'production' || 
                        (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');
    
    setDebugInfo({
      NODE_ENV: process.env.NODE_ENV,
      hostname: window.location.hostname,
      isProduction,
      aiServiceUrl: getApiUrl('/api/ai/health'),
      generateImageUrl: getApiUrl('/api/ai/generate-image')
    });

    // Add keyboard listener for Ctrl+D
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const testEndpoint = async (endpoint, testName) => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const url = getApiUrl(endpoint);
      console.log(`Testing ${testName} at: ${url}`);
      
      const response = await fetch(url, {
        method: endpoint === '/api/ai/health' ? 'GET' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: endpoint === '/api/ai/health' ? undefined : JSON.stringify({
          prompt: 'Test image',
          style: 'natural',
          size: '1024x1024'
        })
      });

      const responseTime = Date.now() - startTime;
      const data = await response.json();

      setTestResults(prev => ({
        ...prev,
        [testName]: {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          responseTime: `${responseTime}ms`,
          data: response.ok ? data : data,
          url,
          headers: Object.fromEntries(response.headers.entries())
        }
      }));
    } catch (error) {
      const responseTime = Date.now() - startTime;
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          success: false,
          error: error.message,
          responseTime: `${responseTime}ms`,
          url: getApiUrl(endpoint)
        }
      }));
    }
    setLoading(false);
  };

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 20, 
      right: 20, 
      width: 400, 
      background: 'white', 
      border: '2px solid #f59e0b', 
      borderRadius: 8, 
      padding: 16, 
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999,
      maxHeight: '80vh',
      overflowY: 'auto',
      fontSize: 12
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: '#f59e0b' }}>🔧 Production Debugger</h3>
        <div style={{ fontSize: 10, color: '#666', background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>
          Ctrl+D to toggle
        </div>
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: '0 0 8px 0' }}>Environment Info:</h4>
        <pre style={{ background: '#f3f4f6', padding: 8, borderRadius: 4, fontSize: 10 }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: '0 0 8px 0' }}>API Tests:</h4>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button 
            onClick={() => testEndpoint('/api/ai/health', 'health')}
            disabled={loading}
            style={{ 
              padding: '4px 8px', 
              borderRadius: 4, 
              border: '1px solid #6366f1', 
              background: '#6366f1', 
              color: 'white',
              fontSize: 10,
              cursor: 'pointer',
              disabled: loading
            }}
          >
            Test Health
          </button>
          <button 
            onClick={() => testEndpoint('/api/ai/generate-image', 'generate-image')}
            disabled={loading}
            style={{ 
              padding: '4px 8px', 
              borderRadius: 4, 
              border: '1px solid #f59e0b', 
              background: '#f59e0b', 
              color: 'white',
              fontSize: 10,
              cursor: 'pointer'
            }}
          >
            Test Image Gen
          </button>
        </div>
        {loading && <div style={{ color: '#6366f1' }}>Testing...</div>}
      </div>

      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Test Results:</h4>
        {Object.entries(testResults).map(([testName, result]) => (
          <div key={testName} style={{ 
            marginBottom: 8, 
            padding: 8, 
            background: result.success ? '#d1fae5' : '#fee2e2', 
            borderRadius: 4,
            border: `1px solid ${result.success ? '#10b981' : '#ef4444'}`
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
              {testName}: {result.success ? '✅ SUCCESS' : '❌ FAILED'}
            </div>
            <div style={{ fontSize: 10 }}>
              <div><strong>URL:</strong> {result.url}</div>
              <div><strong>Status:</strong> {result.status} {result.statusText}</div>
              <div><strong>Time:</strong> {result.responseTime}</div>
              {result.error && <div><strong>Error:</strong> {result.error}</div>}
              {result.data && (
                <details style={{ marginTop: 4 }}>
                  <summary style={{ cursor: 'pointer' }}>Response Data</summary>
                  <pre style={{ 
                    background: 'rgba(0,0,0,0.1)', 
                    padding: 4, 
                    borderRadius: 2, 
                    marginTop: 4,
                    fontSize: 9,
                    maxHeight: 100,
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductionDebugger;
