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

const DestinationService = require('../services/DestinationService');
const SAPEWMAdapter = require('../services/adapters/SAPEWMAdapter');

async function runDiagnostic() {
  console.log('\n======================================================================');
  console.log('   OneScanPicker: SAP ECC <-> EWM & BTP Connectivity Diagnostic');
  console.log('======================================================================\n');

  const mode = DestinationService.getMode();
  const info = DestinationService.getDestinationInfo();
  const client = DestinationService.getEWMClient();

  console.log(`[1] Configuration Overview:`);
  console.log(`  • Active Mode:        ${mode.toUpperCase()}`);
  console.log(`  • Target Destination: ${info.destinationName}`);
  console.log(`  • Target Endpoint:    ${info.endpoint}`);
  console.log(`  • SAP Client:         ${info.sapClient}`);
  console.log(`  • Authentication:     ${info.authType || 'None'}`);
  console.log(`  • User:               ${info.user || 'N/A'}`);
  console.log(`  • Strict SSL:         ${client.strictSSL ? 'Enabled' : 'Disabled (Accepts Self-Signed)'}\n`);

  if (mode === 'mock') {
    console.log(`[2] Running in Local Mock Mode:`);
    console.log(`  ✓ Local SQLite database is used for picking operations.`);
    console.log(`  💡 TIP: To test against live SAP Gateway on this RDP server:`);
    console.log(`     Set ONE_SCAN_MODE=direct and configure SAP_EWM_HOST in .env`);
    console.log(`  💡 TIP: To test against SAP BTP Destination + Cloud Connector:`);
    console.log(`     Set ONE_SCAN_MODE=production in .env\n`);
    return;
  }

  console.log(`[2] Step 1: Testing HTTP Reachability & Service Root...`);
  const connResult = await DestinationService.testConnectivity();
  console.log(`  • Status:      ${connResult.status}`);
  console.log(`  • EWM Status:  ${connResult.ewmStatus}`);
  console.log(`  • Latency:     ${connResult.latencyMs} ms`);
  console.log(`  • CSRF Token:  ${connResult.csrfStatus}`);
  console.log(`  • Details:     ${connResult.details}\n`);

  console.log(`[3] Step 2: Testing CSRF Token & Session Handshake...`);
  try {
    const { token, cookies } = await SAPEWMAdapter.getCsrfToken(client, true);
    if (token) {
      console.log(`  ✓ CSRF Token received: ${token.substring(0, 15)}... (Length: ${token.length})`);
      console.log(`  ✓ Session cookies received: ${cookies.length} cookie(s)`);
    } else {
      console.log(`  ⚠️  No CSRF token returned (Backend may not require CSRF or is offline).`);
    }
  } catch (err) {
    console.log(`  ✗ CSRF handshake failed: ${err.message}`);
  }
  console.log('');

  console.log(`[4] Step 3: Testing Open Warehouse Tasks Query...`);
  try {
    const tasks = await SAPEWMAdapter.getOpenWarehouseTasks();
    console.log(`  ✓ Successfully fetched tasks count: ${tasks.length}`);
    if (tasks.length > 0) {
      console.log(`  • First Task: WT# ${tasks[0].taskNumber} | Material: ${tasks[0].material} | Source Bin: ${tasks[0].sourceBin} | Status: ${tasks[0].status}`);
    }
  } catch (err) {
    console.log(`  ✗ Task retrieval failed: ${err.message || JSON.stringify(err)}`);
  }
  console.log('');

  console.log('======================================================================');
  console.log('   Diagnostic Complete');
  console.log('======================================================================\n');
}

runDiagnostic().catch(err => {
  console.error('Fatal diagnostic error:', err);
});
