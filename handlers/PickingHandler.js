const { validatePick } = require('../services/ValidationService');

function handlePicking(data) {
  return validatePick(data);
}

module.exports = { handlePicking };