const cds = require('@sap/cds');
const { createLogger } = require('../LoggerService');
const { scanValue } = require('../ScanService');
const { validatePick } = require('../ValidationService');

const logger = createLogger('MockEWMAdapter');

const FALLBACK_TASKS = [
  { ID: '1', taskNumber: 'WT1001', material: 'MAT-1001', sourceBin: 'BIN-A01', destinationBin: 'BIN-B01', handlingUnit: 'HU-9001', serialNumber: 'SER-1001', status: 'Open' },
  { ID: '2', taskNumber: 'WT1002', material: 'MAT-1002', sourceBin: 'BIN-A02', destinationBin: 'BIN-B02', handlingUnit: 'HU-9002', serialNumber: 'SER-1002', status: 'Confirmed' },
  { ID: '3', taskNumber: 'WT1003', material: 'MAT-1003', sourceBin: 'BIN-A03', destinationBin: 'BIN-B03', handlingUnit: 'HU-9003', serialNumber: 'SER-1003', status: 'Open' },
  { ID: '4', taskNumber: 'WT1004', material: 'MAT-1004', sourceBin: 'BIN-A04', destinationBin: 'BIN-B04', handlingUnit: 'HU-9004', serialNumber: 'SER-1004', status: 'Failed' },
  { ID: '5', taskNumber: 'WT1005', material: 'MAT-1005', sourceBin: 'BIN-A05', destinationBin: 'BIN-B05', handlingUnit: 'HU-9005', serialNumber: 'SER-1005', status: 'Open' }
];

async function getDb() {
  if (cds.db) return cds.db;
  try {
    return await cds.connect.to('db');
  } catch (e) {
    return null;
  }
}

async function getOpenWarehouseTasks() {
  logger.info('Fetching warehouse tasks from SQLite Mock DB...');
  try {
    const db = await getDb();
    if (!db) return FALLBACK_TASKS;
    const tasks = await db.run(cds.ql.SELECT.from('onescanpicker.db.WarehouseTasks'));
    return tasks && tasks.length > 0 ? tasks : FALLBACK_TASKS;
  } catch (err) {
    logger.warn('SQLite query failed, returning fallback mock tasks', err.message);
    return FALLBACK_TASKS;
  }
}

async function getWarehouseTask(taskId) {
  const value = String(taskId || '').trim();
  logger.info(`Fetching warehouse task detail for: ${value}`);
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
  logger.info('Executing scan validation via MockEWMAdapter');
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

  logger.info(`Confirming warehouse task ${value} in SQLite Mock DB...`);
  try {
    const db = await getDb();
    if (!db) {
      return {
        success: true,
        message: `Task ${value} confirmed successfully (Simulated)`
      };
    }

    const existing = await db.run(cds.ql.SELECT.from('onescanpicker.db.WarehouseTasks').where({ taskNumber: value }));
    if (existing && existing.length > 0 && String(existing[0].status).toUpperCase() === 'CONFIRMED') {
      return {
        error: {
          code: 'TASK_ALREADY_CONFIRMED',
          message: `Task ${value} has already been confirmed`,
          status: 409
        }
      };
    }

    await db.run(
      cds.ql.UPDATE('onescanpicker.db.WarehouseTasks')
        .set({ status: 'Confirmed' })
        .where({ taskNumber: value })
    );

    return {
      success: true,
      message: `Task ${value} confirmed successfully (Mock Mode)`
    };
  } catch (err) {
    logger.warn(`Could not update SQLite DB directly, returning simulated confirmation for ${value}`);
    return {
      success: true,
      message: `Task ${value} confirmed successfully (Mock Mode Fallback)`
    };
  }
}

async function getPickHistory() {
  logger.info('Fetching pick history from SQLite Mock DB...');
  try {
    const db = await getDb();
    if (!db) return [];
    const records = await db.run(cds.ql.SELECT.from('onescanpicker.db.ScanRecords').orderBy('createdAt desc'));
    return records || [];
  } catch (err) {
    logger.warn('SQLite DB query failed for history, returning empty list');
    return [];
  }
}

async function getConnectionStatus() {
  return {
    mode: 'mock',
    status: 'Connected',
    ewmStatus: 'Mock Mode (SQLite)',
    destinationName: 'LOCAL_MOCK_DESTINATION',
    destinationStatus: 'Not Configured (Mock Mode)',
    endpoint: 'local-sqlite',
    latencyMs: 8,
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
