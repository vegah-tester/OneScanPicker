const cds = require('@sap/cds');
const { createLogger } = require('../LoggerService');
const { scanValue } = require('../ScanService');
const { validatePick } = require('../ValidationService');

const logger = createLogger('MockEWMAdapter');

// Seed in-memory mock data
let mockTasks = [
  { ID: '1', taskNumber: 'WT1001', material: 'MAT-1001', sourceBin: 'BIN-A01', destinationBin: 'BIN-B01', handlingUnit: 'HU-9001', serialNumber: 'SER-1001', status: 'Open' },
  { ID: '2', taskNumber: 'WT1002', material: 'MAT-1002', sourceBin: 'BIN-A02', destinationBin: 'BIN-B02', handlingUnit: 'HU-9002', serialNumber: 'SER-1002', status: 'Confirmed' },
  { ID: '3', taskNumber: 'WT1003', material: 'MAT-1003', sourceBin: 'BIN-A03', destinationBin: 'BIN-B03', handlingUnit: 'HU-9003', serialNumber: 'SER-1003', status: 'Open' },
  { ID: '4', taskNumber: 'WT1004', material: 'MAT-1004', sourceBin: 'BIN-A04', destinationBin: 'BIN-B04', handlingUnit: 'HU-9004', serialNumber: 'SER-1004', status: 'Failed' },
  { ID: '5', taskNumber: 'WT1005', material: 'MAT-1005', sourceBin: 'BIN-A05', destinationBin: 'BIN-B05', handlingUnit: 'HU-9005', serialNumber: 'SER-1005', status: 'Open' }
];

let mockHistory = [
  { ID: '1', scanValue: 'BIN-A01|MAT-1001|SER-1001|HU-9001', parsedBin: 'BIN-A01', material: 'MAT-1001', serialNumber: 'SER-1001', handlingUnit: 'HU-9001', isValid: true, message: 'Scan parsed successfully' },
  { ID: '2', scanValue: 'BIN-A04|MAT-1004|SER-1004|HU-9004', parsedBin: 'BIN-A04', material: 'MAT-1004', serialNumber: 'SER-1004', handlingUnit: 'HU-9004', isValid: false, message: 'Validation failed for warehouse task' },
  { ID: '3', scanValue: 'BIN-A05|MAT-1005|SER-1005|HU-9005', parsedBin: 'BIN-A05', material: 'MAT-1005', serialNumber: 'SER-1005', handlingUnit: 'HU-9005', isValid: true, message: 'Scan parsed successfully' }
];

async function getOpenWarehouseTasks() {
  if (cds.db) {
    try {
      const dbTasks = await cds.db.run(cds.ql.SELECT.from('onescanpicker.db.WarehouseTasks'));
      if (dbTasks && dbTasks.length > 0) {
        return dbTasks;
      }
    } catch (e) {
      // Fallback to memory
    }
  }
  return mockTasks;
}

async function getWarehouseTask(taskId) {
  const value = String(taskId || '').trim();
  const tasks = await getOpenWarehouseTasks();
  const found = tasks.find((t) => t.taskNumber === value || t.ID === value);

  if (!found) {
    return {
      error: {
        code: 'TASK_NOT_FOUND',
        message: `Warehouse task ${value} could not be found`,
        status: 404
      }
    };
  }

  return { success: true, data: found };
}

async function validateScan(payload) {
  if (typeof payload === 'string') {
    return scanValue(payload);
  }
  return validatePick(payload);
}

async function confirmWarehouseTask(taskNumber) {
  const value = String(taskNumber || '').trim();
  if (!value) {
    return {
      error: {
        code: 'VALIDATION_MISSING_FIELD',
        message: 'Task number is required for confirmation',
        status: 400
      }
    };
  }

  // Update in memory
  const taskIndex = mockTasks.findIndex(t => t.taskNumber === value);
  if (taskIndex !== -1) {
    if (mockTasks[taskIndex].status === 'Confirmed') {
      return {
        error: {
          code: 'TASK_ALREADY_CONFIRMED',
          message: `Task ${value} has already been confirmed`,
          status: 409
        }
      };
    }
    mockTasks[taskIndex].status = 'Confirmed';
  }

  // Update in SQLite if active
  if (cds.db) {
    try {
      await cds.db.run(
        cds.ql.UPDATE('onescanpicker.db.WarehouseTasks')
          .set({ status: 'Confirmed' })
          .where({ taskNumber: value })
      );
    } catch (e) {
      // Non-fatal
    }
  }

  return {
    success: true,
    message: `Task ${value} confirmed successfully (Mock Mode)`
  };
}

async function getPickHistory() {
  if (cds.db) {
    try {
      const records = await cds.db.run(cds.ql.SELECT.from('onescanpicker.db.ScanRecords'));
      if (records && records.length > 0) return records;
    } catch (e) {
      // Fallback to memory
    }
  }
  return mockHistory;
}

function getConnectionStatus() {
  return {
    mode: 'mock',
    status: 'Connected',
    ewmStatus: 'Mock Mode (SQLite)',
    destinationName: 'LOCAL_MOCK_DESTINATION',
    destinationStatus: 'Not Configured (Mock Mode)',
    endpoint: 'local-sqlite',
    latencyMs: 5,
    csrfStatus: 'N/A (Mock Mode)',
    lastCheck: new Date().toISOString(),
    details: 'Operating on local SQLite database.'
  };
}

module.exports = {
  getOpenWarehouseTasks,
  getWarehouseTask,
  validateScan,
  confirmWarehouseTask,
  getPickHistory,
  getConnectionStatus
};
