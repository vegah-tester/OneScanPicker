const createLogger = require('./LoggerService').createLogger;

const logger = createLogger('ValidationService');

function validatePick(data) {
  const payload = data || {};
  const required = ['taskNumber', 'material', 'sourceBin', 'destinationBin', 'handlingUnit', 'serialNumber'];
  const missing = required.filter((field) => !String(payload[field] || '').trim());

  if (missing.length > 0) {
    logger.warn('Validation failed', { missing });
    return {
      isValid: false,
      message: `Missing required fields: ${missing.join(', ')}`
    };
  }

  return {
    isValid: true,
    message: 'Validation passed'
  };
}

module.exports = { validatePick };