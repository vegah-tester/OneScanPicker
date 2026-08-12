# Changelog

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