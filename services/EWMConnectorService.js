const createLogger = require('./LoggerService').createLogger;
const { getMode } = require('./DestinationService');
const MockEWMAdapter = require('./adapters/MockEWMAdapter');
const SAPEWMAdapter = require('./adapters/SAPEWMAdapter');

const logger = createLogger('EWMConnectorService');

function getAdapter() {
  const mode = getMode();
  if (mode === 'production' || mode === 'direct') {
    logger.info(`[EWMConnectorService] Using SAPEWMAdapter for ${mode} requests`);
    return SAPEWMAdapter;
  }
  logger.info('[EWMConnectorService] Using MockEWMAdapter for mock requests');
  return MockEWMAdapter;
}

async function getOpenWarehouseTasks() {
  return getAdapter().getOpenWarehouseTasks();
}

async function getWarehouseTask(taskId) {
  return getAdapter().getWarehouseTask(taskId);
}

async function validateScan(payload) {
  return getAdapter().validateScan(payload);
}

async function confirmWarehouseTask(taskNumber) {
  return getAdapter().confirmWarehouseTask(taskNumber);
}

async function getPickHistory() {
  return getAdapter().getPickHistory();
}

async function getConnectionStatus() {
  return getAdapter().getConnectionStatus();
}

function sendToEwm(operation, payload) {
  const mode = getMode();
  logger.info(`EWMConnector legacy sendToEwm operation: ${operation} (mode: ${mode})`);
  if (mode === 'production' || mode === 'direct') {
    return SAPEWMAdapter.confirmWarehouseTask(payload ? payload.taskNumber : '');
  }
  return MockEWMAdapter.confirmWarehouseTask(payload ? payload.taskNumber : '');
}

module.exports = {
  getOpenWarehouseTasks,
  getWarehouseTask,
  validateScan,
  confirmWarehouseTask,
  getPickHistory,
  getConnectionStatus,
  sendToEwm
};