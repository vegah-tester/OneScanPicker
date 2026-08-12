function formatStatus(status) {
  return String(status || '').trim().toUpperCase();
}

module.exports = { formatStatus };