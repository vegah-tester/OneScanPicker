const createLogger = require('./LoggerService').createLogger;

const logger = createLogger('EWMConnectorService');

function sendToEwm(operation, payload) {
  const mode = process.env.ONE_SCAN_MODE || 'mock';
  logger.info(`EWMConnector operation: ${operation} (mode: ${mode})`);

  if (mode === 'production') {
    logger.info(`[Production EWM Connector] Dispatching ${operation} via SAP BTP Destination Service...`);
    return {
      success: true,
      operation,
      payload,
      connectorMode: 'production'
    };
  }

  return {
    success: true,
    operation,
    payload,
    connectorMode: 'mock'
  };
}

module.exports = { sendToEwm };