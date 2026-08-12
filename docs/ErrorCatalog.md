# Error Catalog

## Purpose
This catalog defines all business and technical errors in a stable, user-facing format.

## Error Format
```json
{
  "code": "VALIDATION_MISSING_FIELD",
  "message": "Task number is required",
  "severity": "error",
  "details": []
}
```

## Business Errors

### VALIDATION_MISSING_FIELD
- Message: One or more required fields are missing.
- User action: Scan again or complete the missing field.
- HTTP status: 400

### VALIDATION_INVALID_SCAN
- Message: The scan payload is not in a supported format.
- User action: Rescan the code.
- HTTP status: 400

### VALIDATION_STATE_CONFLICT
- Message: The task is not in a state that allows validation.
- User action: Refresh the task and try again.
- HTTP status: 409

### CONFIRMATION_NOT_ALLOWED
- Message: The task cannot be confirmed in its current state.
- User action: Validate the task before confirming.
- HTTP status: 409

### TASK_NOT_FOUND
- Message: The requested warehouse task could not be found.
- User action: Search for another task or refresh the list.
- HTTP status: 404

### TASK_ALREADY_CONFIRMED
- Message: The task has already been confirmed.
- User action: Reload the task list.
- HTTP status: 409

### TASK_CANCELLED
- Message: The task has been cancelled and can no longer be processed.
- User action: Select a different task.
- HTTP status: 409

## Technical Errors

### SAP_BACKEND_FAILURE
- Message: SAP backend rejected the request.
- User action: Retry later or contact support.
- HTTP status: 502

### SAP_GATEWAY_ERROR
- Message: The SAP gateway returned an unexpected response.
- User action: Retry later.
- HTTP status: 502

### CONNECTIVITY_TIMEOUT
- Message: The connection to the backend timed out.
- User action: Retry the operation.
- HTTP status: 504

### CONNECTION_UNAVAILABLE
- Message: The destination or connectivity path is unavailable.
- User action: Check system status and retry.
- HTTP status: 503

### CLOUD_CONNECTOR_FAILURE
- Message: Cloud Connector could not establish or maintain the tunnel.
- User action: Check network and connector availability.
- HTTP status: 503

### DESTINATION_NOT_FOUND
- Message: No valid BTP destination is configured.
- User action: Verify destination configuration.
- HTTP status: 500

### NETWORK_FAILURE
- Message: The system cannot reach the target service.
- User action: Retry or check connectivity.
- HTTP status: 503

### INTERNAL_ERROR
- Message: An unexpected internal error occurred.
- User action: Retry later.
- HTTP status: 500

## Mock Mode Errors
- `MOCK_DATA_MISSING` when seed data is absent.
- `MOCK_PAYLOAD_INVALID` when a fixture is malformed.
- `MOCK_STATE_NOT_FOUND` when a test references unknown mock state.

## User-Facing Message Rules
- Keep messages actionable and free of transport jargon.
- Do not expose SAP payloads, destination names, or connector internals to end users.
- Use stable error codes for automation and logging.

## Logging Guidance
- Log the error code, correlation id, and technical cause.
- Never log credentials or private SAP payloads.
- Use the same code in mock and production mode when the business meaning is the same.