const createLogger = require('./LoggerService').createLogger;

const logger = createLogger('DestinationService');

function getConnectionStatus() {
  const mode = process.env.ONE_SCAN_MODE || 'mock';

  if (mode === 'production') {
    logger.info('Reporting production connection status');
    return {
      mode: 'production',
      status: 'Configured',
      endpoint: 'SAP BTP Destination Service',
      latencyMs: 0
    };
  }

  logger.info('Reporting mock connection status');
  return {
    mode: 'mock',
    status: 'Connected',
    endpoint: 'local-sqlite',
    latencyMs: 12
  };
}

module.exports = { getConnectionStatus };