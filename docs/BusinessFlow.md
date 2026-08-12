# OneScan Business Flow

## Purpose
OneScan supports warehouse picking and verification in a controlled flow that starts with a scan event, validates the data, resolves the target warehouse task, and finishes with confirmation or a controlled failure state.

## End-to-End Business Process
1. A warehouse operator opens the OneScan UI and selects a warehouse task or begins from the scan screen.
2. The operator scans a QR code, barcode, or structured payload containing warehouse context.
3. The application parses the scan payload into business fields such as task number, material, bin, serial, and handling unit.
4. The backend validates the parsed values against the current warehouse task and business rules.
5. If validation succeeds, the operator reviews the matched task details and confirms the pick.
6. The backend records the confirmation request and updates the warehouse task state.
7. The integration layer either commits the result locally in mock mode or sends the request to SAP EWM in production mode.
8. The UI receives the final state and shows success, warning, or error feedback.

## Local Development Flow
Local development must be fully executable without SAP BTP connectivity.

1. The UI reads and writes against CAP services backed by SQLite.
2. Scan payloads are generated from mock data or test fixtures.
3. Validation uses local business rules and seeded warehouse tasks.
4. Confirmation updates local state only and records a mock confirmation result.
5. Diagnostics show the environment as `mock` or `local` and expose a simulated latency value.

### Local Goals
- Verify the UI flow without network access.
- Validate the contract between UI and CAP before any SAP integration.
- Enable repeatable testing with deterministic mock payloads.

## Production SAP Flow
Production mode is used when the application is deployed to SAP BTP and connected to an on-premise SAP ECC or decentralized EWM system.

1. The UI sends requests only to the CAP backend.
2. CAP resolves the destination through SAP BTP Destination Service.
3. Connectivity Service and Cloud Connector establish the secure route to the on-premise landscape.
4. The integration layer calls the SAP EWM OData or RFC interface through the approved backend proxy layer.
5. SAP EWM returns task, validation, or confirmation results.
6. CAP maps the external response into the stable application contract.
7. The UI only sees the normalized business result, not the SAP-specific transport details.

### Production Goals
- Preserve the same UI behavior as local mode.
- Keep SAP-specific integration details isolated.
- Ensure the business contract remains stable even if the backend transport changes.

## Business Rules
- A scan must always resolve to a known or explainable state.
- A task cannot be confirmed unless it has been validated.
- Validation failures must be user-readable and actionable.
- Integration failures must not expose internal SAP payloads to the UI.
- Every task transition must be auditable.

## Contract Stability Rules
- UI fields must map to named API fields, not to database internals.
- CDS entities may evolve by adding optional fields, but existing keys and response shapes must remain compatible.
- New business steps should be added as new states or new actions, not by changing the meaning of existing ones.