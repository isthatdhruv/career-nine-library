// API Configuration Test Component
// This component helps debug API configuration in different environments

import React from 'react';
import { getApiUrl, API_URLS } from '../config/api';

const ApiConfigDebug = () => {
  const testEndpoints = [
    '/api/ai/health',
    '/api/ai/stats', 
    '/api/ai/enhance',
    '/api/health'
  ];

  const isProduction = process.env.NODE_ENV === 'production' || 
                      (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f5f5', 
      borderRadius: '8px', 
      margin: '20px',
      fontFamily: 'monospace',
      fontSize: '14px'
    }}>
      <h3>🔍 API Configuration Debug</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Environment Detection:</strong>
        <ul>
          <li>NODE_ENV: {process.env.NODE_ENV || 'undefined'}</li>
          <li>window.location.hostname: {typeof window !== 'undefined' ? window.location.hostname : 'SSR'}</li>
          <li>isProduction: {isProduction ? 'true' : 'false'}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Current API URLs:</strong>
        <ul>
          <li>AI Service: {API_URLS.AI_SERVICE_URL}</li>
          <li>Main Backend: {API_URLS.MAIN_BACKEND_URL}</li>
        </ul>
      </div>

      <div>
        <strong>URL Resolution Test:</strong>
        <ul>
          {testEndpoints.map(endpoint => (
            <li key={endpoint}>
              {endpoint} → {getApiUrl(endpoint)}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
        <strong>Expected Behavior:</strong>
        <ul style={{ margin: '5px 0' }}>
          <li><strong>Development:</strong> All URLs should point to localhost</li>
          <li><strong>Production:</strong> AI endpoints should point to Firebase Functions, main backend to localhost</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiConfigDebug;
