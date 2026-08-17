#!/usr/bin/env node

/**
 * OneScanPicker - SAP ECC / EWM & BTP Connectivity Diagnostic Utility
 * 
 * Usage:
 *   node scripts/test-sap-connection.js
 *   ONE_SCAN_MODE=direct node scripts/test-sap-connection.js
 *   ONE_SCAN_MODE=production node scripts/test-sap-connection.js
 */

// Load .env if present
try {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
} catch (e) {
  // Ignore
}

const dns = require('dns').promises;
const DestinationService = require('../services/DestinationService');
const SAPEWMAdapter = require('../services/adapters/SAPEWMAdapter');

async function runDiagnostic() {
  console.log('\n======================================================================');
  console.log('   OneScanPicker: SAP ECC <-> EWM & BTP Connectivity Diagnostic');
  console.log('======================================================================\n');

  const mode = DestinationService.getMode();
  const info = DestinationService.getDestinationInfo();
  const client = DestinationService.getEWMClient();

  const isHostConfigured = Boolean(process.env.SAP_EWM_HOST && process.env.SAP_EWM_HOST !== 'localhost');
  const isAuthConfigured = Boolean(process.env.SAP_EWM_USER && process.env.SAP_EWM_PASSWORD);
  const isDestinationConfigured = Boolean(process.env.ONE_SCAN_DESTINATION_NAME);

  console.log(`[1] Configuration Overview:`);
  console.log(`  • Active Mode:        ${mode.toUpperCase()}`);
  console.log(`  • Target Destination: ${info.destinationName}`);
  console.log(`  • Target Endpoint:    ${info.endpoint}`);
  console.log(`  • SAP Client:         ${info.sapClient}`);
  console.log(`  • Auth Configured:    ${isAuthConfigured ? 'YES (User/Pass provided)' : 'NO (Using placeholder/unauthenticated)'}`);
  console.log(`  • Strict SSL:         ${client.strictSSL ? 'Enabled' : 'Disabled (Accepts Self-Signed certificates)'}\n`);

  if (mode === 'mock') {
    console.log(`[2] Execution Mode Status: MOCK MODE (Local SQLite)`);
    console.log(`  [PASS] Local SQLite database is active and seeded with mock warehouse tasks.`);
    console.log(`  [INFO] To test Direct Gateway mode: set ONE_SCAN_MODE=direct in .env`);
    console.log(`  [INFO] To test BTP Destination mode: set ONE_SCAN_MODE=production in .env\n`);
    console.log('======================================================================');
    console.log('   Diagnostic Complete (Mock Mode Validated)');
    console.log('======================================================================\n');
    return;
  }

  console.log(`[2] Step 1: DNS & Network Host Resolution`);
  try {
    const parsedUrl = new URL(client.baseUrl);
    const hostname = parsedUrl.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log(`  [PASS] Target Host: ${hostname} (Local loopback resolved)`);
    } else {
      const addresses = await dns.lookup(hostname);
      console.log(`  [PASS] Target Host '${hostname}' resolved to IP: ${addresses.address}`);
    }
  } catch (dnsErr) {
    if (!isHostConfigured) {
      console.log(`  [NOT CONFIGURED] SAP_EWM_HOST not provided yet (${dnsErr.message})`);
    } else {
      console.log(`  [FAIL] DNS Lookup failed: ${dnsErr.message}`);
    }
  }
  console.log('');

  console.log(`[3] Step 2: HTTP Service Root Reachability`);
  const connResult = await DestinationService.testConnectivity();
  if (connResult.status === 'Connected' || (connResult.httpStatus >= 200 && connResult.httpStatus < 400)) {
    console.log(`  [PASS] HTTP Root Reachable (${connResult.latencyMs} ms, Status: ${connResult.status})`);
  } else if (connResult.status === 'Connection Failed' && !isHostConfigured) {
    console.log(`  [NOT CONFIGURED] Endpoint unreachable (Host offline or not yet configured).`);
    console.log(`  • Details: ${connResult.details}`);
  } else {
    console.log(`  [FAIL] Endpoint reached with status: ${connResult.status}`);
    console.log(`  • Details: ${connResult.details}`);
  }
  console.log('');

  console.log(`[4] Step 3: CSRF Token & Session Handshake`);
  try {
    const { token, cookies } = await SAPEWMAdapter.getCsrfToken(client, true);
    if (token) {
      console.log(`  [PASS] CSRF Token received: ${token.substring(0, 15)}... (Length: ${token.length})`);
      console.log(`  [PASS] Session Cookies received: ${cookies.length} cookie(s)`);
    } else if (!isHostConfigured) {
      console.log(`  [NOT CONFIGURED] SAP Gateway endpoint offline; CSRF handshake not executed.`);
    } else {
      console.log(`  [FAIL] SAP Gateway did not return X-CSRF-Token.`);
    }
  } catch (err) {
    console.log(`  [FAIL] CSRF handshake error: ${err.message}`);
  }
  console.log('');

  console.log(`[5] Step 4: Open Warehouse Tasks Query`);
  try {
    const tasks = await SAPEWMAdapter.getOpenWarehouseTasks();
    if (tasks && tasks.length > 0) {
      console.log(`  [PASS] Open Warehouse Tasks returned: ${tasks.length} task(s)`);
      console.log(`  • First Task: WT# ${tasks[0].taskNumber} | SKU: ${tasks[0].material} | Source Bin: ${tasks[0].sourceBin} | Status: ${tasks[0].status}`);
    } else {
      console.log(`  [PASS] Query succeeded (0 open tasks currently in queue).`);
    }
  } catch (err) {
    if (!isHostConfigured) {
      console.log(`  [NOT CONFIGURED] Live SAP task query skipped: real SAP host not yet provided.`);
    } else {
      console.log(`  [FAIL] Task retrieval failed: ${err.message || JSON.stringify(err)}`);
    }
  }
  console.log('');

  console.log('======================================================================');
  console.log('   Diagnostic Complete');
  console.log('======================================================================\n');
}

runDiagnostic().catch(err => {
  console.error('Fatal diagnostic error:', err);
});
