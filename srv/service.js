const cds = require('@sap/cds');
const { createLogger } = require('../services/LoggerService');
const { scanValue } = require('../services/ScanService');
const { validatePick } = require('../services/ValidationService');
const { confirmTask } = require('../services/WarehouseTaskService');
const { getConnectionStatus } = require('../services/DestinationService');
const { INSERT, SELECT, UPDATE } = cds.ql;

const logger = createLogger('OneScanPickerService');

async function seedLocalData() {
  const db = await cds.connect.to('db');
  const existingTasks = await db.run(SELECT.from('onescanpicker.db.WarehouseTasks').limit(1));

  if (existingTasks.length > 0) {
    return;
  }

  await db.run(INSERT.into('onescanpicker.db.WarehouseTasks').entries([
    { ID: '1', taskNumber: 'WT1001', material: 'MAT-1001', sourceBin: 'BIN-A01', destinationBin: 'BIN-B01', handlingUnit: 'HU-9001', serialNumber: 'SER-1001', status: 'Open' },
    { ID: '2', taskNumber: 'WT1002', material: 'MAT-1002', sourceBin: 'BIN-A02', destinationBin: 'BIN-B02', handlingUnit: 'HU-9002', serialNumber: 'SER-1002', status: 'Confirmed' },
    { ID: '3', taskNumber: 'WT1003', material: 'MAT-1003', sourceBin: 'BIN-A03', destinationBin: 'BIN-B03', handlingUnit: 'HU-9003', serialNumber: 'SER-1003', status: 'Open' },
    { ID: '4', taskNumber: 'WT1004', material: 'MAT-1004', sourceBin: 'BIN-A04', destinationBin: 'BIN-B04', handlingUnit: 'HU-9004', serialNumber: 'SER-1004', status: 'Failed' },
    { ID: '5', taskNumber: 'WT1005', material: 'MAT-1005', sourceBin: 'BIN-A05', destinationBin: 'BIN-B05', handlingUnit: 'HU-9005', serialNumber: 'SER-1005', status: 'Open' }
  ]));

  await db.run(INSERT.into('onescanpicker.db.ScanRecords').entries([
    { ID: '1', scanValue: 'BIN-A01|MAT-1001|SER-1001|HU-9001', parsedBin: 'BIN-A01', material: 'MAT-1001', serialNumber: 'SER-1001', handlingUnit: 'HU-9001', isValid: true, message: 'Scan parsed successfully' },
    { ID: '2', scanValue: 'BIN-A04|MAT-1004|SER-1004|HU-9004', parsedBin: 'BIN-A04', material: 'MAT-1004', serialNumber: 'SER-1004', handlingUnit: 'HU-9004', isValid: false, message: 'Validation failed for warehouse task' },
    { ID: '3', scanValue: 'BIN-A05|MAT-1005|SER-1005|HU-9005', parsedBin: 'BIN-A05', material: 'MAT-1005', serialNumber: 'SER-1005', handlingUnit: 'HU-9005', isValid: true, message: 'Scan parsed successfully' }
  ]));

  await db.run(INSERT.into('onescanpicker.db.ConnectionStatus').entries([
    { ID: '1', mode: 'mock', endpoint: 'local-sqlite', status: 'Connected', latencyMs: 12, lastCheck: new Date().toISOString() }
  ]));
}

cds.on('served', async () => {
  try {
    await seedLocalData();
    logger.info('Local SQLite mock data seeded');
  } catch (error) {
    logger.error('Failed to seed local data', error);
    throw error;
  }
});

module.exports = cds.service.impl(function () {
  this.on('READ', 'DashboardSummary', async (req) => {
    const db = await cds.connect.to('db');
    const tasks = await db.run(SELECT.from('onescanpicker.db.WarehouseTasks'));
    const connection = getConnectionStatus();

    return [{
      ID: 1,
      openTasks: tasks.filter((task) => String(task.status).toUpperCase() === 'OPEN').length,
      confirmedTasks: tasks.filter((task) => String(task.status).toUpperCase() === 'CONFIRMED').length,
      failedTasks: tasks.filter((task) => String(task.status).toUpperCase() === 'FAILED').length,
      connectionStatus: connection.status,
      mode: connection.mode,
      endpoint: connection.endpoint
    }];
  });

  this.on('scan', async (req) => {
    logger.info('scan action invoked');
    const result = scanValue(req.data.scanValue);
    if (result && req.data.scanValue) {
      try {
        const db = await cds.connect.to('db');
        await db.run(INSERT.into('onescanpicker.db.ScanRecords').entries([{
          ID: String(Date.now()),
          scanValue: req.data.scanValue,
          parsedBin: result.parsedBin || '',
          material: result.material || '',
          serialNumber: result.serialNumber || '',
          handlingUnit: result.handlingUnit || '',
          isValid: result.isValid || false,
          message: result.message || ''
        }]));
      } catch (e) {
        logger.error('Failed to persist scan record', e);
      }
    }
    return result;
  });

  this.on('validate', async (req) => {
    logger.info('validate action invoked');
    return validatePick(req.data);
  });

  this.on('confirm', async (req) => {
    logger.info('confirm action invoked');
    const taskNumber = req.data.taskNumber;
    const result = confirmTask(taskNumber);
    if (result && result.success && taskNumber) {
      try {
        const db = await cds.connect.to('db');
        await db.run(UPDATE('onescanpicker.db.WarehouseTasks')
          .set({ status: 'Confirmed' })
          .where({ taskNumber: taskNumber }));
      } catch (e) {
        logger.error('Failed to update warehouse task status', e);
      }
    }
    return result;
  });

  this.on('connection', async () => {
    logger.info('connection action invoked');
    return getConnectionStatus();
  });

  this.on('history', async (req) => {
    logger.info('history action invoked');
    const db = await cds.connect.to('db');
    return db.run(SELECT.from('onescanpicker.db.ScanRecords').orderBy('createdAt desc'));
  });
});