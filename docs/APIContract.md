# API Contract

## Overview
All frontend and integration behavior must use the following CAP contract. This contract is intended to remain stable across mock mode and SAP production mode.

## Common Response Envelope
When a response needs metadata, the backend may use the following structure:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "message": "Optional human-readable message"
}
```

For error responses:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_MISSING_FIELD",
    "message": "Task number is required",
    "details": []
  }
}
```

## Endpoint: GET /dashboard
Returns summary metrics for the dashboard.

### Success Response 200
```json
{
  "success": true,
  "data": {
    "openTasks": 15,
    "validatedTasks": 95,
    "failedTasks": 2,
    "mode": "mock"
  }
}
```

### Errors
- 500 `INTERNAL_ERROR`

## Endpoint: GET /tasks
Returns a collection of warehouse tasks.

### Success Response 200
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "taskNumber": "WT1001",
      "material": "MAT-1001",
      "sourceBin": "BIN-A01",
      "destinationBin": "BIN-B01",
      "handlingUnit": "HU-9001",
      "serialNumber": "SER-1001",
      "status": "OPEN"
    }
  ]
}
```

### Errors
- 500 `INTERNAL_ERROR`

## Endpoint: GET /tasks/{id}
Returns one warehouse task by identifier.

### Success Response 200
```json
{
  "success": true,
  "data": {
    "id": "1",
    "taskNumber": "WT1001",
    "status": "OPEN"
  }
}
```

### Errors
- 404 `TASK_NOT_FOUND`
- 500 `INTERNAL_ERROR`

## Endpoint: POST /scan
Parses and validates a scan payload.

### Request Body
```json
{
  "scanValue": "BIN-A01|MAT-1001|SER-1001|HU-9001"
}
```

### Success Response 200
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "message": "Scan parsed successfully",
    "parsedBin": "BIN-A01",
    "material": "MAT-1001",
    "serialNumber": "SER-1001",
    "handlingUnit": "HU-9001"
  }
}
```

### Errors
- 400 `VALIDATION_INVALID_SCAN`
- 422 `SCAN_UNPARSABLE`
- 500 `INTERNAL_ERROR`

## Endpoint: POST /validate
Validates task, bin, material, HU, and serial fields.

### Request Body
```json
{
  "taskNumber": "WT1001",
  "material": "MAT-1001",
  "sourceBin": "BIN-A01",
  "destinationBin": "BIN-B01",
  "handlingUnit": "HU-9001",
  "serialNumber": "SER-1001"
}
```

### Success Response 200
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "message": "Validation passed"
  }
}
```

### Errors
- 400 `VALIDATION_MISSING_FIELD`
- 409 `VALIDATION_STATE_CONFLICT`
- 500 `INTERNAL_ERROR`

## Endpoint: POST /confirm
Confirms a warehouse task after validation.

### Request Body
```json
{
  "taskNumber": "WT1001"
}
```

### Success Response 200
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Task WT1001 confirmed"
  }
}
```

### Errors
- 400 `CONFIRMATION_INVALID_REQUEST`
- 409 `CONFIRMATION_NOT_ALLOWED`
- 502 `SAP_BACKEND_FAILURE`
- 504 `CONNECTIVITY_TIMEOUT`
- 500 `INTERNAL_ERROR`

## Endpoint: GET /history
Returns historical scan or pick records.

### Success Response 200
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "scanValue": "BIN-A01|MAT-1001|SER-1001|HU-9001",
      "isValid": true,
      "message": "Scan parsed successfully"
    }
  ]
}
```

### Errors
- 500 `INTERNAL_ERROR`

## Endpoint: GET /connection
Returns connection and runtime mode status.

### Success Response 200
```json
{
  "success": true,
  "data": {
    "mode": "mock",
    "status": "Connected",
    "endpoint": "local-sqlite",
    "latencyMs": 12
  }
}
```

### Errors
- 503 `CONNECTION_UNAVAILABLE`
- 500 `INTERNAL_ERROR`

## HTTP Status Rules
- 200 for successful read and action requests.
- 400 for malformed or incomplete client input.
- 404 when a requested entity does not exist.
- 409 when the request conflicts with current task state.
- 422 when the payload is syntactically valid but semantically unusable.
- 500 for unexpected backend failures.
- 502 for SAP backend gateway or upstream failures.
- 503 for connection or availability issues.
- 504 for timeouts.

## Compatibility Rules
- New response fields may be added, but existing field names and meanings must not change.
- Optional request fields may be introduced in the future, but required fields must remain stable.
- Error codes must remain machine-readable and versionable.