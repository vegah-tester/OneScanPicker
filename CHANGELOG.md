# Changelog

## 0.3.0 - Milestone 2: SAP EWM Connector & BTP Integration Abstraction (2026-08-12)
- **Adapter Architecture**: Created `MockEWMAdapter.js` and `SAPEWMAdapter.js` under `services/adapters/` routed dynamically via `EWMConnectorService.js` based on `ONE_SCAN_MODE` (`mock` vs `production`).
- **Destination Abstraction**: Enhanced `services/DestinationService.js` with `getMode()`, `getDestinationInfo()`, `getEWMClient()`, and `getConnectionStatus()`, supporting BTP Destination Service resolution without exposing credentials or secrets.
- **Diagnostics Extension**: Enhanced `Diagnostics.view.xml` and backend `/connection` action to render CAP Backend status, BTP Destination status, SAP EWM status, active destination name, and roundtrip latency.
- **EWM Integration Contract**: Authored `docs/integration/EWM-Integration-Contract.md` specifying OData V2/V4 field mappings, HTTP methods, and SAP error mapping codes (`SAP_BACKEND_FAILURE`, `CONNECTIVITY_TIMEOUT`, `DESTINATION_NOT_FOUND`).
- **Automated Test Suite**: Added `test/index.test.js` (16 passed test cases) covering adapter routing, destination resolution, mock operations, and error handling.
- **Environment Settings**: Updated `.env.example` to document `ONE_SCAN_MODE`, `ONE_SCAN_DESTINATION_NAME`, `SAP_EWM_CLIENT`, and `SAP_EWM_BASE_URL`.

## 0.2.0 - Enterprise Local Picking Engine & Modern UI5 Shell (2026-08-07)
- **Dashboard Fix**: Resolved `null` value binding issue in `Dashboard.view.xml` by switching to absolute paths (`{dashboard>/...}`) and fetching live OData V4 metrics from `/odata/v4/one-scan-picker/DashboardSummary`.
- **UI5 Routing & Navigation**: Integrated `sap.ui5/routing` in `manifest.json` with standard Fiori `ToolPage` layout in `App.view.xml` (`sap.tnt` header and side navigation).
- **Warehouse Task Management**: Added `TaskList` view with status filter, material search bar, and `TaskDetails` view with step-by-step picking protocol.
- **Scan & Verification Engine**: Built barcode/QR parser (`BIN|MATERIAL|SERIAL|HU`), multi-field pick validator, and task confirmation action wired to CAP backend.
- **Pick History & Diagnostics**: Implemented historical audit log table bound to `/Scans` entity and system diagnostic panel with live latency monitoring.
- **EWM Connector Layer**: Refined `EWMConnectorService` and `DestinationService` abstractions to isolate BTP/EWM integration logic from UI components.

## 0.1.0 - Milestone 1: Local Runnable Prototype
- Added local development runtime for CAP + SQLite + UI5 tooling.
- Added OData-backed dashboard contract and live mock data summary.
- Added launch, tasks, environment, and ignore files for VS Code usage.
- Added startup guide and local prototype wiring.
