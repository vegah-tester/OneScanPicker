# CDS Model Design

## Design Goals
The CDS model must represent the warehouse workflow clearly while keeping room for future warehouse automation, analytics, and integration enhancements.

## Namespace
Suggested namespace: `onescanpicker.db`

## Entity: WarehouseTasks
Represents the active warehouse task record.

### Keys
- `ID` as `cuid`

### Attributes
- `taskNumber` `String(40)` required business identifier
- `material` `String(40)` material number
- `sourceBin` `String(40)` source storage bin
- `destinationBin` `String(40)` destination storage bin
- `handlingUnit` `String(40)` handling unit identifier
- `serialNumber` `String(40)` serial number
- `status` `String(20)` task state

### Annotations
- `@title` on user-facing fields where appropriate
- `@readonly` for fields managed by SAP EWM in production
- `@mandatory` for fields required to confirm a task

### Future Extensibility
- add wave number
- add pick quantity
- add batch number
- add work center
- add source and destination section

## Entity: ScanRecords
Represents a parsed scan event.

### Keys
- `ID` as `cuid`

### Attributes
- `scanValue` `String(255)` original scan payload
- `parsedBin` `String(40)` parsed bin value
- `material` `String(40)` parsed material value
- `serialNumber` `String(40)` parsed serial value
- `handlingUnit` `String(40)` parsed HU value
- `isValid` `Boolean` scan validity
- `message` `String(255)` parse or validation outcome

### Future Extensibility
- add raw scanner metadata
- add camera source id
- add parser version
- add device identifier

## Entity: ConnectionStatus
Represents runtime and connectivity health.

### Keys
- `ID` as `cuid`

### Attributes
- `mode` `String(20)` mock or production
- `endpoint` `String(255)` destination or local backend reference
- `status` `String(20)` connected, degraded, unavailable
- `latencyMs` `Integer` measured or simulated latency
- `lastCheck` `Timestamp` last health check

### Future Extensibility
- add destination name
- add connectivity route id
- add service instance id
- add health score

## Suggested Relationships
- A warehouse task may have many scan records.
- A connection status entry may be associated with many diagnostics events.
- A confirmation event should reference a warehouse task and optionally a scan record.

## Suggested Future Entities
- `PickHistory`
- `TaskEvents`
- `DiagnosticsLogs`
- `ValidationRules`
- `IntegrationMessages`

## Model Rules
- External identifiers should remain business-friendly and not expose persistence internals.
- New CDS fields should be additive whenever possible.
- Existing entity names should remain stable to protect service contracts.