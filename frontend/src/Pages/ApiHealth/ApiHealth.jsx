import React, { useState, useEffect } from 'react';
import './ApiHealth.css';

const ApiHealth = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      
      // Fetch health data from backend servers
      // Main backend is optional (only needed for browser extension scraping)
      const [aiHealthResponse, mainHealthResponse] = await Promise.allSettled([
        fetch('http://localhost:3002/api/ai/health'),
        fetch('http://localhost:3003/api/health')
      ]);

      const healthData = {
        timestamp: new Date().toISOString(),
        services: {}
      };

      // Process AI service health (required)
      if (aiHealthResponse.status === 'fulfilled' && aiHealthResponse.value.ok) {
        const aiHealth = await aiHealthResponse.value.json();
        healthData.services.aiService = {
          status: 'healthy',
          ...aiHealth
        };
      } else {
        healthData.services.aiService = {
          status: 'error',
          error: aiHealthResponse.reason?.message || 'Service unavailable'
        };
      }

      // Process main backend health (optional - used for browser extension only)
      if (mainHealthResponse.status === 'fulfilled' && mainHealthResponse.value.ok) {
        const mainHealth = await mainHealthResponse.value.json();
        healthData.services.mainBackend = {
          status: 'healthy',
          ...mainHealth
        };
      } else {
        healthData.services.mainBackend = {
          status: 'optional',
          error: 'Service not running (only needed for browser extension scraping)',
          note: 'This service is optional and only required when using the browser extension to scrape new career pages'
        };
      }

      // Fetch API usage stats
      try {
        const statsResponse = await fetch('http://localhost:3002/api/ai/stats');
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          healthData.apiStats = stats;
        }
      } catch (err) {
        console.warn('Could not fetch API stats:', err);
      }

      setHealthData(healthData);
      setError(null);
    } catch (err) {
      console.error('Error fetching health data:', err);
      setError('Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchHealthData, refreshInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status) => {
    let badgeClass = 'status-error';
    if (status === 'healthy') badgeClass = 'status-healthy';
    if (status === 'optional') badgeClass = 'status-optional';
    return <span className={`status-badge ${badgeClass}`}>{status}</span>;
  };

  if (loading && !healthData) {
    return (
      <div className="api-health-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="api-health-page">
      <header className="health-header">
        <h1>🏥 API Health Dashboard</h1>
        <div className="health-controls">
          <div className="refresh-controls">
            <label>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto Refresh
            </label>
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
              >
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
                <option value={60000}>1m</option>
                <option value={300000}>5m</option>
              </select>
            )}
          </div>
          <button 
            className="refresh-btn" 
            onClick={fetchHealthData}
            disabled={loading}
          >
            {loading ? '🔄' : '🔄'} Refresh
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
        </div>
      )}

      {healthData && (
        <div className="health-content">
          <div className="last-updated">
            Last updated: {formatTimestamp(healthData.timestamp)}
          </div>

          {/* Service Status Cards */}
          <div className="services-grid">
            {Object.entries(healthData.services).map(([serviceName, serviceData]) => (
              <div key={serviceName} className="service-card">
                <div className="service-header">
                  <h3>{serviceName === 'aiService' ? '🤖 AI Service' : '🌐 Main Backend'}</h3>
                  {getStatusBadge(serviceData.status)}
                </div>
                <div className="service-details">
                  {serviceData.status === 'healthy' ? (
                    <>
                      <p><strong>Service:</strong> {serviceData.service || 'Backend API'}</p>
                      <p><strong>Timestamp:</strong> {formatTimestamp(serviceData.timestamp)}</p>
                      {serviceData.uptime && (
                        <p><strong>Uptime:</strong> {Math.round(serviceData.uptime)} seconds</p>
                      )}
                      {serviceData.version && (
                        <p><strong>Version:</strong> {serviceData.version}</p>
                      )}
                    </>
                  ) : serviceData.status === 'optional' ? (
                    <>
                      <p className="optional-text">ℹ️ {serviceData.error}</p>
                      {serviceData.note && (
                        <p className="note-text"><em>{serviceData.note}</em></p>
                      )}
                    </>
                  ) : (
                    <p className="error-text">❌ {serviceData.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* API Usage Statistics */}
          {healthData.apiStats && (
            <div className="stats-section">
              <h2>📊 API Usage Statistics</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>🔤 Content Enhancement</h4>
                  <div className="stat-value">{healthData.apiStats.contentEnhancement?.totalRequests || 0}</div>
                  <div className="stat-label">Total Requests</div>
                  <div className="stat-detail">
                    Success: {healthData.apiStats.contentEnhancement?.successfulRequests || 0}
                  </div>
                </div>

                <div className="stat-card">
                  <h4>🎨 Image Generation</h4>
                  <div className="stat-value">{healthData.apiStats.imageGeneration?.totalRequests || 0}</div>
                  <div className="stat-label">Total Requests</div>
                  {healthData.apiStats.imageGeneration?.imagesGenerated && (
                    <div className="stat-detail">
                      Images: {healthData.apiStats.imageGeneration.imagesGenerated}
                    </div>
                  )}
                </div>

                <div className="stat-card">
                  <h4>⏱️ Avg Response Time</h4>
                  <div className="stat-value">
                    {Math.round(healthData.apiStats.averageProcessingTime?.contentEnhancement || 0)}ms
                  </div>
                  <div className="stat-label">Content Enhancement</div>
                </div>

                <div className="stat-card">
                  <h4>📈 Success Rate</h4>
                  <div className="stat-value">
                    {((healthData.apiStats.successRate || 0) * 100).toFixed(1)}%
                  </div>
                  <div className="stat-label">API Success Rate</div>
                </div>
              </div>

              {/* Recent API Calls */}
              {healthData.apiStats.recentCalls && healthData.apiStats.recentCalls.length > 0 && (
                <div className="recent-calls">
                  <h3>🕒 Recent API Calls</h3>
                  <div className="calls-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Endpoint</th>
                          <th>Status</th>
                          <th>Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {healthData.apiStats.recentCalls.slice(0, 10).map((call, index) => (
                          <tr key={index}>
                            <td>{new Date(call.timestamp).toLocaleTimeString()}</td>
                            <td>{call.endpoint}</td>
                            <td>
                              <span className={`status-badge ${call.success ? 'status-healthy' : 'status-error'}`}>
                                {call.success ? 'Success' : 'Error'}
                              </span>
                            </td>
                            <td>{call.duration}ms</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* System Information */}
          <div className="system-info">
            <h2>💻 System Information</h2>
            <div className="info-grid">
              <div className="info-card">
                <h4>🌐 Environment</h4>
                <p>Frontend: {process.env.NODE_ENV || 'development'}</p>
                <p>Build: {process.env.REACT_APP_VERSION || 'dev'}</p>
              </div>
              <div className="info-card">
                <h4>🔗 Endpoints</h4>
                <p>AI Service: http://localhost:3002 (Required)</p>
                <p>Main Backend: http://localhost:3003 (Optional - Browser Extension Only)</p>
              </div>
              <div className="info-card">
                <h4>📱 Browser</h4>
                <p>User Agent: {navigator.userAgent.split(' ')[0]}</p>
                <p>Online: {navigator.onLine ? '✅' : '❌'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiHealth;
