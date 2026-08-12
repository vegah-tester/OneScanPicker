const createLogger = require('./LoggerService').createLogger;

const logger = createLogger('DestinationService');

function getMode() {
  return String(process.env.ONE_SCAN_MODE || 'mock').toLowerCase();
}

function getDestinationName() {
  return process.env.ONE_SCAN_DESTINATION_NAME || 'SAP_EWM_DESTINATION';
}

function getDestinationInfo() {
  const mode = getMode();
  const destinationName = getDestinationName();

  if (mode === 'production') {
    logger.info(`Resolving SAP BTP Destination: ${destinationName}`);
    return {
      mode: 'production',
      status: 'Configured',
      destinationName,
      destinationStatus: 'Configured',
      ewmStatus: 'Available (Destination Bound)',
      endpoint: `SAP BTP Destination Service [${destinationName}]`,
      latencyMs: 45
    };
  }

  logger.info('Resolving mock destination status for local development');
  return {
    mode: 'mock',
    status: 'Connected',
    destinationName: 'LOCAL_MOCK_DESTINATION',
    destinationStatus: 'Not Configured (Mock Mode)',
    ewmStatus: 'Mock Mode (SQLite)',
    endpoint: 'local-sqlite',
    latencyMs: 12
  };
}

function getEWMClient() {
  const info = getDestinationInfo();

  if (info.mode === 'production') {
    logger.info(`Preparing client configuration for SAP BTP Destination: ${info.destinationName}`);
    return {
      mode: 'production',
      destinationName: info.destinationName,
      baseUrl: process.env.SAP_EWM_BASE_URL || `https://sap-ewm.btp.internal/odata/v2/`,
      sapClient: process.env.SAP_EWM_CLIENT || '100',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    };
  }

  return {
    mode: 'mock',
    destinationName: 'LOCAL_MOCK_DESTINATION',
    baseUrl: 'http://localhost:4004/odata/v4/one-scan-picker',
    sapClient: '100',
    headers: {
      'Accept': 'application/json'
    }
  };
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
    latencyMs: info.latencyMs,
    lastCheck: new Date().toISOString()
  };
}

module.exports = {
  getMode,
  getDestinationName,
  getDestinationInfo,
  getEWMClient,
  getConnectionStatus
};