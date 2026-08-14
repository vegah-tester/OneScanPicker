const axios = require('axios');
const createLogger = require('./LoggerService').createLogger;

const logger = createLogger('DestinationService');

/**
 * Returns the active runtime mode.
 * Options: 'mock' (default), 'direct' (direct SAP Gateway on LAN/RDP), or 'production' / 'btp' (BTP Destination + Cloud Connector).
 */
function getMode() {
  const mode = String(process.env.ONE_SCAN_MODE || 'mock').toLowerCase();
  if (mode === 'direct' || mode === 'onpremise' || mode === 'gateway') {
    return 'direct';
  }
  if (mode === 'production' || mode === 'btp') {
    return 'production';
  }
  return 'mock';
}

function getDestinationName() {
  return process.env.ONE_SCAN_DESTINATION_NAME || 'SAP_EWM_DESTINATION';
}

/**
 * Resolves configuration parameters for connecting to the SAP EWM / SAP Gateway system.
 */
function getDestinationInfo() {
  const mode = getMode();
  const destinationName = getDestinationName();

  if (mode === 'direct') {
    const host = process.env.SAP_EWM_HOST || 'localhost';
    const port = process.env.SAP_EWM_PORT || (process.env.SAP_EWM_USE_SSL === 'true' ? '44300' : '8000');
    const protocol = process.env.SAP_EWM_USE_SSL === 'true' ? 'https' : 'http';
    const basePath = process.env.SAP_EWM_BASE_PATH || '/sap/opu/odata/scwm/WAREHOUSE_TASK_SRV';
    const sapClient = process.env.SAP_EWM_CLIENT || '100';
    const endpoint = `${protocol}://${host}:${port}${basePath}`;

    return {
      mode: 'direct',
      status: 'Configured (Direct Gateway)',
      destinationName: 'DIRECT_SAP_GATEWAY',
      destinationStatus: 'Direct Network Line (RDP/LAN)',
      ewmStatus: `Target: ${host}:${port} [Client ${sapClient}]`,
      endpoint,
      sapClient,
      user: process.env.SAP_EWM_USER || 'SAP_USER',
      authType: 'BasicAuthentication',
      latencyMs: 0
    };
  }

  if (mode === 'production') {
    const baseUrl = process.env.SAP_EWM_BASE_URL || `https://sap-ewm.btp.internal/odata/v2/`;
    const sapClient = process.env.SAP_EWM_CLIENT || '100';

    return {
      mode: 'production',
      status: 'Configured',
      destinationName,
      destinationStatus: 'Configured (BTP Destination)',
      ewmStatus: 'Available (Destination / Cloud Connector)',
      endpoint: baseUrl,
      sapClient,
      authType: process.env.SAP_EWM_AUTH_TYPE || 'PrincipalPropagation / BasicAuth',
      latencyMs: 45
    };
  }

  return {
    mode: 'mock',
    status: 'Connected',
    destinationName: 'LOCAL_MOCK_DESTINATION',
    destinationStatus: 'Not Configured (Mock Mode)',
    ewmStatus: 'Mock Mode (SQLite)',
    endpoint: 'local-sqlite',
    sapClient: '100',
    authType: 'None (Local DB)',
    latencyMs: 12
  };
}

/**
 * Builds the HTTP client configuration used by SAPEWMAdapter.
 */
function getEWMClient() {
  const info = getDestinationInfo();

  if (info.mode === 'direct') {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'sap-client': info.sapClient,
      'X-Requested-With': 'XMLHttpRequest'
    };

    const auth = (process.env.SAP_EWM_USER && process.env.SAP_EWM_PASSWORD) ? {
      username: process.env.SAP_EWM_USER,
      password: process.env.SAP_EWM_PASSWORD
    } : undefined;

    return {
      mode: 'direct',
      destinationName: info.destinationName,
      baseUrl: info.endpoint,
      sapClient: info.sapClient,
      headers,
      auth,
      timeout: parseInt(process.env.SAP_EWM_TIMEOUT_MS || '15000', 10),
      strictSSL: process.env.SAP_EWM_STRICT_SSL === 'true'
    };
  }

  if (info.mode === 'production') {
    return {
      mode: 'production',
      destinationName: info.destinationName,
      baseUrl: info.endpoint,
      sapClient: info.sapClient,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'sap-client': info.sapClient,
        'X-Requested-With': 'XMLHttpRequest'
      },
      auth: (process.env.SAP_EWM_USER && process.env.SAP_EWM_PASSWORD) ? {
        username: process.env.SAP_EWM_USER,
        password: process.env.SAP_EWM_PASSWORD
      } : undefined,
      timeout: parseInt(process.env.SAP_EWM_TIMEOUT_MS || '20000', 10),
      strictSSL: process.env.SAP_EWM_STRICT_SSL === 'true'
    };
  }

  return {
    mode: 'mock',
    destinationName: 'LOCAL_MOCK_DESTINATION',
    baseUrl: 'http://localhost:4004/odata/v4/one-scan-picker',
    sapClient: '100',
    headers: {
      'Accept': 'application/json'
    },
    timeout: 5000
  };
}

/**
 * Performs a lightweight health check / ping against the configured SAP backend.
 */
async function testConnectivity() {
  const info = getDestinationInfo();
  const start = Date.now();

  if (info.mode === 'mock') {
    return {
      mode: 'mock',
      status: 'Connected',
      destinationName: info.destinationName,
      destinationStatus: info.destinationStatus,
      ewmStatus: info.ewmStatus,
      endpoint: info.endpoint,
      latencyMs: 8,
      csrfStatus: 'N/A (Mock Mode)',
      lastCheck: new Date().toISOString(),
      details: 'Running against local SQLite persistence layer.'
    };
  }

  const client = getEWMClient();
  try {
    const axiosConfig = {
      method: 'GET',
      url: client.baseUrl,
      headers: {
        ...client.headers,
        'X-CSRF-Token': 'Fetch'
      },
      auth: client.auth,
      timeout: client.timeout || 10000,
      validateStatus: () => true // Don't throw on 4xx/5xx to capture HTTP status
    };

    if (client.strictSSL === false && client.baseUrl.startsWith('https://')) {
      const https = require('https');
      axiosConfig.httpsAgent = new https.Agent({ rejectUnauthorized: false });
    }

    const response = await axios(axiosConfig);
    const latency = Date.now() - start;
    const csrfToken = response.headers['x-csrf-token'] ? 'Available' : 'Not Returned';

    const isSuccess = response.status >= 200 && response.status < 400;

    return {
      mode: info.mode,
      status: isSuccess ? 'Connected' : `HTTP ${response.status}`,
      destinationName: info.destinationName,
      destinationStatus: isSuccess ? 'Reachable' : `Error (${response.statusText})`,
      ewmStatus: isSuccess ? 'Online (SAP Gateway Responding)' : `Warning (HTTP ${response.status})`,
      endpoint: client.baseUrl,
      latencyMs: latency,
      csrfStatus: csrfToken,
      httpStatus: response.status,
      lastCheck: new Date().toISOString(),
      details: isSuccess ? 'Successfully reached SAP endpoint and verified gateway service.' : `SAP returned status code ${response.status} (${response.statusText}).`
    };
  } catch (error) {
    const latency = Date.now() - start;
    logger.error('Failed to connect to SAP backend during health check', error.message);
    return {
      mode: info.mode,
      status: 'Connection Failed',
      destinationName: info.destinationName,
      destinationStatus: 'Unreachable',
      ewmStatus: 'Offline / Network Error',
      endpoint: client.baseUrl,
      latencyMs: latency,
      csrfStatus: 'Error',
      lastCheck: new Date().toISOString(),
      details: `Network error connecting to ${client.baseUrl}: ${error.message}`
    };
  }
}

function getConnectionStatus() {
  const info = getDestinationInfo();
  return {
    mode: info.mode,
    status: info.status,
    destinationName: info.destinationName,
    destinationStatus: info.destinationStatus,
    ewmStatus: info.ewmStatus,
    endpoint: info.endpoint,
    latencyMs: info.latencyMs || 12,
    lastCheck: new Date().toISOString()
  };
}

module.exports = {
  getMode,
  getDestinationName,
  getDestinationInfo,
  getEWMClient,
  getConnectionStatus,
  testConnectivity
};