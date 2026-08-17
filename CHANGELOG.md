# Changelog

## 0.6.0 - Milestone: SAP Integration & Landscape Readiness (2026-08-17)
- **SAP Environment Specification Runbook**: Authored `docs/integration/SAP-System-Information-Required.md` defining all non-secret architectural parameters required from the SAP ECC/EWM environment (Host, Port, Mandant, Service Name, Warehouse Number, Technical User, Cloud Connector mapping).
- **SAP-Side Configuration Checklist**: Created `docs/integration/SAP-Environment-Setup-Checklist.md` detailing exact SAP-side prerequisites across SAP Gateway (`/IWFND/MAINT_SERVICE`), `SICF` node activation, authorization profiles (`S_SERVICE`, `S_RFC`, `/SCWM/WT`), master data, and Cloud Connector pairing.
- **Enhanced Connection Diagnostic Utility**: Updated `scripts/test-sap-connection.js` to be configuration-driven and explicitly report `PASS`, `FAIL`, and `NOT CONFIGURED` across DNS host lookup, HTTP reachability, CSRF token negotiation, and task querying.
- **Integration Readiness Milestone Report**: Created `docs/milestones/Milestone-SAP-Integration-Readiness.md` formally categorizing components as `IMPLEMENTED LOCALLY`, `READY FOR SAP CONFIGURATION`, `REQUIRES SAP INFORMATION`, and `NOT TESTED`.

## 0.5.0 - Milestone UI/UX: SAP Fiori Horizon Redesign & Navigation Stabilization (2026-08-17)
- **SAP Fiori Horizon Design System**: Upgraded theme from High Contrast Black (`sap_hcb`) to modern SAP Fiori Horizon (`sap_horizon`), custom stylesheet (`css/style.css`), balanced typography, and responsive spacing tokens.
- **Enterprise Application Shell (`App.view.xml` & `App.controller.js`)**: Polished `ToolHeader` with system status indicators, active mode badges, application avatar, about/help dialog, and synchronized `SideNavigation` with deep route matching.
- **Deterministic Routing**: Enhanced `manifest.json` routing configuration supporting `#/dashboard`, `#/tasks`, `#/tasks/{taskId}`, `#/scan`, `#/history`, `#/diagnostics`, and bypassed fallbacks.
- **Dashboard Redesign (`Dashboard.view.xml`)**: Built responsive 3-column KPI card grid (Open, Confirmed, Discrepant tasks) with click-to-filter task navigation, live runtime health cards, and quick action buttons.
- **Warehouse Tasks & Task Details (`TaskList.view.xml`, `TaskDetails.view.xml`)**: Standardized Fiori table with search, status filters (`ALL`, `Open`, `Confirmed`, `Failed`), semantic status indicators, detailed step-by-step picking protocol, and confirmation dialogs.
- **Scan & Verification Engine (`Scan.view.xml`)**: Built structured 1-Scan 2D barcode reader interface with active task context, demo presets (WT1001, WT1003, Discrepancy), 4-card decoded breakdown, validation alerts, and pick confirmation.
- **Pick History Audit Trail (`History.view.xml`)**: Standardized audit log table with search filtering and verification status badges.
- **Live Diagnostics Ping (`Diagnostics.view.xml`, `Diagnostics.controller.js`)**: Fixed diagnostic ping flow with busy indicator, live latency measurement (ms), active runtime mode indicators, and enterprise architecture readiness checklist.

## 0.4.0 - Milestone 3: Full ECC to EWM Integration, Direct Gateway & BTP Cloud Connector Connectivity (2026-08-14)
- **Direct Gateway & BTP Mode Router**: Enhanced `DestinationService.js` and `EWMConnectorService.js` to support three execution modes: `mock` (SQLite), `direct` (Direct On-Premise SAP Gateway over LAN/RDP), and `production` (BTP Destination Service + Cloud Connector).
- **Production SAP EWM Adapter**: Implemented real HTTP engine in `SAPEWMAdapter.js` with automated `X-CSRF-Token` fetching (`getCsrfToken`), session cookie persistence, ABAP field abbreviation normalization (`TANUM`, `VLPLA`, `NLPLA`, `VLENR`, `SERNR`), and structured SAP Gateway error handling.
- **Diagnostic CLI Tool**: Added `scripts/test-sap-connection.js` for standalone terminal verification of SAP Gateway reachability, CSRF negotiation, open Warehouse Task querying, and latency metrics.
- **BTP Deployment Scaffolding**: Created `mta.yaml` (MTA deployment descriptor for CAP + UI5 + Destination + Connectivity + XSUAA), `xs-security.json` (role templates & scopes), and `default-env.json.example` (local BTP environment simulation).
- **Diagnostics UI Enhancement**: Updated `Diagnostics.view.xml` and `Diagnostics.controller.js` to display CSRF handshake status and connection details dynamically from the backend `/connection` action.
- **End-to-End Runbooks**: Authored comprehensive integration guides:
  - `docs/integration/ECC-EWM-EndToEnd-Integration.md` (ECC Sales Order/Delivery -> EWM ODO/WT -> OneScanPicker confirmation -> ECC Goods Issue flow).
  - `docs/integration/Cloud-Connector-Setup-Guide.md` (SAP Cloud Connector pairing, virtual-to-internal system mapping, resource path whitelisting).
  - `docs/integration/SAP-Gateway-Service-Configuration.md` (ABAP `/IWFND/MAINT_SERVICE`, `SICF` node activation, user authorizations).
- **Expanded Test Suite**: Updated `test/index.test.js` to 21 test cases validating direct gateway resolution, CSRF handling, mock functions, and adapter fallbacks.

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