const { scanValue } = require('../services/ScanService');

function handleScan(scan) {
  return scanValue(scan);
}

module.exports = { handleScan };