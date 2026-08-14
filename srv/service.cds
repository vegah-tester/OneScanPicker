using onescanpicker.db as db from '../db/schema';

service OneScanPickerService {
  entity DashboardSummary {
    key ID           : Integer;
        openTasks    : Integer;
        confirmedTasks : Integer;
        failedTasks  : Integer;
        connectionStatus : String(20);
        mode         : String(20);
        endpoint     : String(255);
  }

  entity Dashboard as projection on db.ConnectionStatus;
  entity Tasks as projection on db.WarehouseTasks;
  entity Scans as projection on db.ScanRecords;

  action scan(scanValue: String) returns ScanResult;
  action validate(taskNumber: String, material: String, sourceBin: String, destinationBin: String, handlingUnit: String, serialNumber: String) returns ValidationResult;
  action confirm(taskNumber: String) returns ConfirmationResult;
  action connection() returns ConnectionResult;
  action history() returns many Scans;
}

type ScanResult {
  isValid      : Boolean;
  message      : String;
  parsedBin    : String;
  material     : String;
  serialNumber : String;
  handlingUnit : String;
}

type ValidationResult {
  isValid : Boolean;
  message : String;
}

type ConfirmationResult {
  success : Boolean;
  message : String;
}

type ConnectionResult {
  mode              : String;
  status            : String;
  destinationName   : String;
  destinationStatus : String;
  ewmStatus         : String;
  endpoint          : String;
  latencyMs         : Integer;
  lastCheck         : String;
  csrfStatus        : String;
  details           : String;
}