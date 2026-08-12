const createLogger = require('./LoggerService').createLogger;

const logger = createLogger('ScanService');

function scanValue(value) {
  const text = String(value || '').trim();

  if (!text) {
    logger.warn('Empty scan value received');
    return {
      isValid: false,
      message: 'Scan value is required',
      parsedBin: '',
      material: '',
      serialNumber: '',
      handlingUnit: ''
    };
  }

  const segments = text.split('|');

  return {
    isValid: true,
    message: 'Scan parsed successfully',
    parsedBin: segments[0] || '',
    material: segments[1] || '',
    serialNumber: segments[2] || '',
    handlingUnit: segments[3] || ''
  };
}

module.exports = { scanValue };