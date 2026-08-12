function createLogger(scope) {
  return {
    info(message, details) {
      console.log(`[${scope}] ${message}`, details || '');
    },
    warn(message, details) {
      console.warn(`[${scope}] ${message}`, details || '');
    },
    error(message, details) {
      console.error(`[${scope}] ${message}`, details || '');
    }
  };
}

module.exports = { createLogger };