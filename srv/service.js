const cds = require('@sap/cds');
const { createLogger } = require('../services/LoggerService');
const { scanValue } = require('../services/ScanService');
const { validatePick } = require('../services/ValidationService');
const { confirmTask } = require('../services/WarehouseTaskService');
const EWMConnectorService = require('../services/EWMConnectorService');
const { testConnectivity } = require('../services/DestinationService');

const logger = createLogger('OneScanPickerService');

async function seedLocalData() {
  if (!cds.db) return;
  try {
    const existingTasks = await cds.db.run(cds.ql.SELECT.from('onescanpicker.db.WarehouseTasks').limit(1));
    if (existingTasks && existingTasks.length > 0) {
      return;
    }

    await cds.db.run(cds.ql.INSERT.into('onescanpicker.db.WarehouseTasks').entries([
      { ID: '1', taskNumber: 'WT1001', material: 'MAT-1001', sourceBin: 'BIN-A01', destinationBin: 'BIN-B01', handlingUnit: 'HU-9001', serialNumber: 'SER-1001', status: 'Open' },
      { ID: '2', taskNumber: 'WT1002', material: 'MAT-1002', sourceBin: 'BIN-A02', destinationBin: 'BIN-B02', handlingUnit: 'HU-9002', serialNumber: 'SER-1002', status: 'Confirmed' },
      { ID: '3', taskNumber: 'WT1003', material: 'MAT-1003', sourceBin: 'BIN-A03', destinationBin: 'BIN-B03', handlingUnit: 'HU-9003', serialNumber: 'SER-1003', status: 'Open' },
      { ID: '4', taskNumber: 'WT1004', material: 'MAT-1004', sourceBin: 'BIN-A04', destinationBin: 'BIN-B04', handlingUnit: 'HU-9004', serialNumber: 'SER-1004', status: 'Failed' },
      { ID: '5', taskNumber: 'WT1005', material: 'MAT-1005', sourceBin: 'BIN-A05', destinationBin: 'BIN-B05', handlingUnit: 'HU-9005', serialNumber: 'SER-1005', status: 'Open' }
    ]));

    await cds.db.run(cds.ql.INSERT.into('onescanpicker.db.ScanRecords').entries([
      { ID: '1', scanValue: 'BIN-A01|MAT-1001|SER-1001|HU-9001', parsedBin: 'BIN-A01', material: 'MAT-1001', serialNumber: 'SER-1001', handlingUnit: 'HU-9001', isValid: true, message: 'Scan parsed successfully' },
      { ID: '2', scanValue: 'BIN-A04|MAT-1004|SER-1004|HU-9004', parsedBin: 'BIN-A04', material: 'MAT-1004', serialNumber: 'SER-1004', handlingUnit: 'HU-9004', isValid: false, message: 'Validation failed for warehouse task' },
      { ID: '3', scanValue: 'BIN-A05|MAT-1005|SER-1005|HU-9005', parsedBin: 'BIN-A05', material: 'MAT-1005', serialNumber: 'SER-1005', handlingUnit: 'HU-9005', isValid: true, message: 'Scan parsed successfully' }
    ]));

    await cds.db.run(cds.ql.INSERT.into('onescanpicker.db.ConnectionStatus').entries([
      { ID: '1', mode: 'mock', endpoint: 'local-sqlite', status: 'Connected', latencyMs: 12, lastCheck: new Date().toISOString() }
    ]));
    logger.info('Local SQLite mock data seeded');
  } catch (error) {
    logger.warn('Seed data skipped or already seeded:', error.message);
  }
}

cds.on('served', async () => {
  await seedLocalData();
});

module.exports = cds.service.impl(async function () {
  this.on('READ', 'DashboardSummary', async (req) => {
    let tasks = [];
    try {
      tasks = await EWMConnectorService.getOpenWarehouseTasks();
    } catch (e) {
      tasks = [];
    }
    const connection = await EWMConnectorService.getConnectionStatus();

    const openCount = tasks.filter((t) => String(t.status).toUpperCase() === 'OPEN').length;
    const confirmedCount = tasks.filter((t) => String(t.status).toUpperCase() === 'CONFIRMED').length;
    const failedCount = tasks.filter((t) => String(t.status).toUpperCase() === 'FAILED').length;

    return [{
      ID: 1,
      openTasks: openCount,
      confirmedTasks: confirmedCount,
      failedTasks: failedCount,
      connectionStatus: connection.status || 'Connected',
      mode: connection.mode || 'mock',
      endpoint: connection.endpoint || 'local-sqlite'
    }];
  });

  this.on('READ', 'Tasks', async (req) => {
    return EWMConnectorService.getOpenWarehouseTasks();
  });

  this.on('scan', async (req) => {
    logger.info('scan action invoked');
    const result = scanValue(req.data.scanValue);
    if (result && req.data.scanValue && cds.db) {
      try {
        await cds.db.run(cds.ql.INSERT.into('onescanpicker.db.ScanRecords').entries([{
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
        logger.error('Failed to persist scan record', e.message);
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
    return confirmTask(taskNumber);
  });

  this.on('connection', async () => {
    logger.info('connection diagnostic ping invoked');
    return testConnectivity();
  });

  this.on('history', async (req) => {
    logger.info('history action invoked');
    return EWMConnectorService.getPickHistory();
  });
});