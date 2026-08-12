const { confirmTask } = require('../services/WarehouseTaskService');

function handleWarehouseTaskConfirmation(taskNumber) {
  return confirmTask(taskNumber);
}

module.exports = { handleWarehouseTaskConfirmation };