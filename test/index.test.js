const assert = require('assert');
const DestinationService = require('../services/DestinationService');
const EWMConnectorService = require('../services/EWMConnectorService');
const MockEWMAdapter = require('../services/adapters/MockEWMAdapter');
const SAPEWMAdapter = require('../services/adapters/SAPEWMAdapter');

async function runTests() {
  console.log('==================================================');
  console.log('   OneScanPicker Milestone 3 Test Suite');
  console.log('   SAP ECC <-> EWM & BTP Integration Coverage');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ FAIL: ${name}`);
      console.error(`  Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Configuration & Mode Tests
  await test('Configuration: default mode is mock', () => {
    delete process.env.ONE_SCAN_MODE;
    assert.strictEqual(DestinationService.getMode(), 'mock');
  });

  await test('Configuration: mock mode resolution', () => {
    process.env.ONE_SCAN_MODE = 'mock';
    assert.strictEqual(DestinationService.getMode(), 'mock');
    const info = DestinationService.getDestinationInfo();
    assert.strictEqual(info.mode, 'mock');
    assert.strictEqual(info.status, 'Connected');
  });

  await test('Configuration: direct gateway mode resolution', () => {
    process.env.ONE_SCAN_MODE = 'direct';
    process.env.SAP_EWM_HOST = '192.168.1.50';
    process.env.SAP_EWM_PORT = '8000';
    process.env.SAP_EWM_CLIENT = '100';

    assert.strictEqual(DestinationService.getMode(), 'direct');
    const info = DestinationService.getDestinationInfo();
    assert.strictEqual(info.mode, 'direct');
    assert.strictEqual(info.destinationName, 'DIRECT_SAP_GATEWAY');
    assert.ok(info.endpoint.includes('192.168.1.50:8000'));
    process.env.ONE_SCAN_MODE = 'mock';
  });

  await test('Configuration: production mode resolution', () => {
    process.env.ONE_SCAN_MODE = 'production';
    assert.strictEqual(DestinationService.getMode(), 'production');
    const info = DestinationService.getDestinationInfo();
    assert.strictEqual(info.mode, 'production');
    assert.strictEqual(info.status, 'Configured');
    process.env.ONE_SCAN_MODE = 'mock';
  });

  // 2. DestinationService Tests
  await test('DestinationService: getEWMClient returns valid mock config', () => {
    process.env.ONE_SCAN_MODE = 'mock';
    const client = DestinationService.getEWMClient();
    assert.strictEqual(client.mode, 'mock');
    assert.ok(client.baseUrl);
  });

  await test('DestinationService: getEWMClient returns valid direct config', () => {
    process.env.ONE_SCAN_MODE = 'direct';
    process.env.SAP_EWM_HOST = 'saphost.local';
    process.env.SAP_EWM_PORT = '44300';
    process.env.SAP_EWM_USE_SSL = 'true';
    const client = DestinationService.getEWMClient();
    assert.strictEqual(client.mode, 'direct');
    assert.ok(client.baseUrl.startsWith('https://saphost.local:44300'));
    process.env.ONE_SCAN_MODE = 'mock';
  });

  await test('DestinationService: getEWMClient returns valid production config', () => {
    process.env.ONE_SCAN_MODE = 'production';
    const client = DestinationService.getEWMClient();
    assert.strictEqual(client.mode, 'production');
    assert.strictEqual(client.destinationName, 'SAP_EWM_DESTINATION');
    process.env.ONE_SCAN_MODE = 'mock';
  });

  await test('DestinationService: testConnectivity returns rich diagnostics in mock mode', async () => {
    process.env.ONE_SCAN_MODE = 'mock';
    const diag = await DestinationService.testConnectivity();
    assert.strictEqual(diag.mode, 'mock');
    assert.strictEqual(diag.status, 'Connected');
    assert.ok(diag.csrfStatus);
    assert.ok(diag.details);
  });

  // 3. MockEWMAdapter Core Functions
  await test('Mock Mode: getOpenWarehouseTasks returns task array', async () => {
    process.env.ONE_SCAN_MODE = 'mock';
    const tasks = await EWMConnectorService.getOpenWarehouseTasks();
    assert.ok(Array.isArray(tasks));
    assert.ok(tasks.length > 0);
  });

  await test('Mock Mode: getWarehouseTask returns existing task', async () => {
    process.env.ONE_SCAN_MODE = 'mock';
    const res = await EWMConnectorService.getWarehouseTask('WT1001');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.data.taskNumber, 'WT1001');
  });

  await test('Mock Mode: getWarehouseTask handles missing task', async () => {
    process.env.ONE_SCAN_MODE = 'mock';
    const res = await EWMConnectorService.getWarehouseTask('NON_EXISTENT_TASK_999');
    assert.ok(res.error);
    assert.strictEqual(res.error.code, 'TASK_NOT_FOUND');
  });

  await test('Mock Mode: validateScan handles valid string', async () => {
    process.env.ONE_SCAN_MODE = 'mock';
    const res = await EWMConnectorService.validateScan('BIN-A01|MAT-1001|SER-1001|HU-9001');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.parsedBin, 'BIN-A01');
  });

  await test('Mock Mode: validateScan handles invalid/empty string', async () => {
    process.env.ONE_SCAN_MODE = 'mock';
    const res = await EWMConnectorService.validateScan('');
    assert.strictEqual(res.isValid, false);
  });

  await test('Mock Mode: confirmWarehouseTask missing taskNumber error', async () => {
    process.env.ONE_SCAN_MODE = 'mock';
    const res = await EWMConnectorService.confirmWarehouseTask('');
    assert.ok(res.error);
    assert.strictEqual(res.error.code, 'VALIDATION_MISSING_FIELD');
  });

  await test('Mock Mode: confirmWarehouseTask valid task confirmation', async () => {
    process.env.ONE_SCAN_MODE = 'mock';
    const res = await EWMConnectorService.confirmWarehouseTask('WT1003');
    assert.strictEqual(res.success, true);
  });

  await test('Mock Mode: getPickHistory returns history array', async () => {
    process.env.ONE_SCAN_MODE = 'mock';
    const history = await EWMConnectorService.getPickHistory();
    assert.ok(Array.isArray(history));
  });

  await test('Mock Mode: getConnectionStatus returns complete diagnostic details', async () => {
    process.env.ONE_SCAN_MODE = 'mock';
    const status = await EWMConnectorService.getConnectionStatus();
    assert.strictEqual(status.mode, 'mock');
    assert.strictEqual(status.status, 'Connected');
    assert.ok(status.ewmStatus);
  });

  // 4. SAPEWMAdapter Tests (Production & Direct Mode Router)
  await test('Production Mode: getOpenWarehouseTasks returns SAP payload structure', async () => {
    process.env.ONE_SCAN_MODE = 'production';
    process.env.SAP_EWM_FALLBACK_SIMULATION = 'true';
    const tasks = await EWMConnectorService.getOpenWarehouseTasks();
    assert.ok(Array.isArray(tasks));
    assert.strictEqual(tasks[0].taskNumber, 'WT2001');
    process.env.ONE_SCAN_MODE = 'mock';
  });

  await test('Production Mode: mapSapWarehouseTaskToContract maps SAP entity correctly', () => {
    const sapTask = {
      WarehouseTask: 'WT8888',
      Product: 'MAT-8888',
      SourceStorageBin: 'BIN-88',
      DestinationStorageBin: 'BIN-99',
      SourceHandlingUnit: 'HU-88',
      SerialNumber: 'SER-88',
      ConfirmationStatus: 'C'
    };
    const mapped = SAPEWMAdapter.mapSapWarehouseTaskToContract(sapTask);
    assert.strictEqual(mapped.taskNumber, 'WT8888');
    assert.strictEqual(mapped.material, 'MAT-8888');
    assert.strictEqual(mapped.sourceBin, 'BIN-88');
    assert.strictEqual(mapped.destinationBin, 'BIN-99');
    assert.strictEqual(mapped.handlingUnit, 'HU-88');
    assert.strictEqual(mapped.serialNumber, 'SER-88');
    assert.strictEqual(mapped.status, 'Confirmed');
  });

  await test('Production Mode: mapSapWarehouseTaskToContract maps SAP ABAP field abbreviations', () => {
    const abapTask = {
      TANUM: 'WT9999',
      MATNR: 'MAT-9999',
      VLPLA: 'BIN-SRC-01',
      NLPLA: 'BIN-DST-01',
      VLENR: 'HU-9999',
      SERNR: 'SER-9999',
      TAPOS: 'O'
    };
    const mapped = SAPEWMAdapter.mapSapWarehouseTaskToContract(abapTask);
    assert.strictEqual(mapped.taskNumber, 'WT9999');
    assert.strictEqual(mapped.material, 'MAT-9999');
    assert.strictEqual(mapped.sourceBin, 'BIN-SRC-01');
    assert.strictEqual(mapped.destinationBin, 'BIN-DST-01');
    assert.strictEqual(mapped.status, 'Open');
  });

  await test('Production Mode: confirmWarehouseTask simulation handling', async () => {
    process.env.ONE_SCAN_MODE = 'production';
    process.env.SAP_EWM_FALLBACK_SIMULATION = 'true';
    const res = await SAPEWMAdapter.confirmWarehouseTask('WT2001');
    assert.strictEqual(res.success, true);
    process.env.ONE_SCAN_MODE = 'mock';
  });

  console.log(`\n==================================================`);
  console.log(`   Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unhandled test execution error:', err);
  process.exit(1);
});
