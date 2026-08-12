const createLogger = require('./LoggerService').createLogger;
const { confirmWarehouseTask } = require('./EWMConnectorService');

const logger = createLogger('WarehouseTaskService');

async function confirmTask(taskNumber) {
  const value = String(taskNumber || '').trim();

  if (!value) {
    logger.warn('Missing task number for confirmation');
    return {
      success: false,
      message: 'Task number is required'
    };
  }

  const ewmResult = await confirmWarehouseTask(value);
  if (ewmResult && ewmResult.error) {
    return {
      success: false,
      message: ewmResult.error.message || 'Task confirmation failed'
    };
  }

  return {
    success: true,
    message: (ewmResult && ewmResult.message) || `Task ${value} confirmed successfully`
  };
}

module.exports = { confirmTask };
