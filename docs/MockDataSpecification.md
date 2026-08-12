# Mock Data Specification

## Purpose
The mock dataset must support realistic end-to-end local development, including dashboard metrics, task browsing, validation, confirmation, history, and diagnostics.

## Mock Warehouse Tasks
Create a seed set with enough variation to exercise success and failure paths.

### Required Task Types
- Open task ready for validation
- Validated task ready for confirmation
- Confirmed task in history
- Failed task due to validation
- Cancelled task for user flow testing
- Task with missing serial number for negative testing
- Task with mismatched bin for validation testing
- Task with long text values for UI overflow testing

### Suggested Records
| Task Number | Material | Source Bin | Destination Bin | HU | Serial | Status | Purpose |
|---|---|---|---|---|---|---|---|
| WT1001 | MAT-1001 | BIN-A01 | BIN-B01 | HU-9001 | SER-1001 | OPEN | Standard happy path |
| WT1002 | MAT-1002 | BIN-A02 | BIN-B02 | HU-9002 | SER-1002 | VALIDATED | Ready for confirmation |
| WT1003 | MAT-1003 | BIN-A03 | BIN-B03 | HU-9003 | SER-1003 | CONFIRMED | History display |
| WT1004 | MAT-1004 | BIN-A04 | BIN-B04 | HU-9004 | SER-1004 | FAILED | Validation failure |
| WT1005 | MAT-1005 | BIN-A05 | BIN-B05 | HU-9005 | SER-1005 | CANCELLED | Cancellation path |
| WT1006 | MAT-1006 | BIN-A06 | BIN-B06 | HU-9006 |  | OPEN | Missing serial negative case |
| WT1007 | MAT-1007 | BIN-A07 | BIN-B07 | HU-9007 | SER-1007 | OPEN | Mismatched scan test |
| WT1008 | MAT-1008-LONG-DESCRIPTION | BIN-A08 | BIN-B08 | HU-9008 | SER-1008 | OPEN | Long text UI stress test |

## Mock Scan Payloads
Scan payloads should be deterministic and cover supported formats.

### Supported Format A: Delimited String
```json
{
  "scanValue": "BIN-A01|MAT-1001|SER-1001|HU-9001"
}
```

### Supported Format B: Structured Fields
```json
{
  "scanValue": "task:WT1002;bin:BIN-A02;material:MAT-1002;serial:SER-1002;hu:HU-9002"
}
```

### Negative Payloads
```json
{ "scanValue": "" }
```

```json
{ "scanValue": "INVALID_PAYLOAD" }
```

```json
{ "scanValue": "BIN-A07|MAT-1007|SER-XXXX|HU-9007" }
```

## Mock Dashboard Data
- Open tasks: 3
- Validated tasks: 2
- Confirmed tasks: 1
- Failed tasks: 1
- Cancelled tasks: 1

## Mock Connection Data
- mode: `mock`
- status: `Connected`
- endpoint: `local-sqlite`
- latencyMs: simulated value between 8 and 25 ms

## History Data
History should contain a mix of successful and failed scans.

### Minimum History Coverage
- one successful confirmation
- one validation failure
- one cancelled task
- one parse failure
- one simulated connection failure

## Data Rules
- IDs and task numbers must be stable across runs.
- Seed data must be predictable so UI snapshots remain consistent.
- Mock data should mimic realistic SAP naming and business values.
- Negative cases must be explicit and easy to identify.

## Extensibility
Future mock data may add:
- batch numbers
- work centers
- process types
- exception reason codes
- confirmations with partial quantity