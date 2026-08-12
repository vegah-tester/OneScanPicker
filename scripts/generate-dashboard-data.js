const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const databasePath = path.join(process.cwd(), 'db.sqlite');
const outputPath = path.join(process.cwd(), 'app', 'ui5', 'webapp', 'mock', 'dashboard-data.js');

function query(db, sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, [], (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

async function main() {
  const db = new sqlite3.Database(databasePath);

  try {
    const tasks = await query(db, 'SELECT status FROM onescanpicker_db_WarehouseTasks');
    const connectionRows = await query(db, 'SELECT mode, endpoint, status, latencyMs FROM onescanpicker_db_ConnectionStatus LIMIT 1');
    const connection = connectionRows[0] || {
      mode: 'mock',
      endpoint: 'local-sqlite',
      status: 'Connected',
      latencyMs: 12
    };

    const dashboardData = {
      openTasks: tasks.filter((task) => String(task.status || '').toUpperCase() === 'OPEN').length,
      confirmedTasks: tasks.filter((task) => String(task.status || '').toUpperCase() === 'CONFIRMED').length,
      failedTasks: tasks.filter((task) => String(task.status || '').toUpperCase() === 'FAILED').length,
      connectionStatus: connection.status,
      mode: connection.mode,
      endpoint: connection.endpoint
    };

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `window.__ONESCAN_DASHBOARD_DATA__ = ${JSON.stringify(dashboardData, null, 2)};\n`, 'utf8');
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});