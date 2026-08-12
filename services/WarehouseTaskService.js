const createLogger = require('./LoggerService').createLogger;
const { sendToEwm } = require('./EWMConnectorService');

const logger = createLogger('WarehouseTaskService');

function confirmTask(taskNumber) {
  const value = String(taskNumber || '').trim();

  if (!value) {
    logger.warn('Missing task number for confirmation');
    return {
      success: false,
      message: 'Task number is required'
    };
  }

  const ewmResult = sendToEwm('CONFIRM_WAREHOUSE_TASK', { taskNumber: value });

  return {
    success: true,
    message: `Task ${value} confirmed successfully (${ewmResult.connectorMode} mode)`
  };
}

module.exports = { confirmTask };