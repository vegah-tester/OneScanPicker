namespace onescanpicker.db;

using { cuid, managed } from '@sap/cds/common';

entity WarehouseTasks : cuid, managed {
  taskNumber     : String(40);
  material       : String(40);
  sourceBin      : String(40);
  destinationBin : String(40);
  handlingUnit   : String(40);
  serialNumber   : String(40);
  status         : String(20);
}

entity ScanRecords : cuid, managed {
  scanValue   : String(255);
  parsedBin   : String(40);
  material    : String(40);
  serialNumber: String(40);
  handlingUnit: String(40);
  isValid     : Boolean;
  message     : String(255);
}

entity ConnectionStatus : cuid, managed {
  mode       : String(20);
  endpoint   : String(255);
  status     : String(20);
  latencyMs  : Integer;
  lastCheck  : Timestamp;
}