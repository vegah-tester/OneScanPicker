# OneScanPicker

OneScanPicker is an enterprise SAP BTP-ready warehouse picking and verification application built with SAP CAP (Node.js) and SAPUI5 / SAP Fiori.

## Architectural Overview
Provide a modern, locally developable picking and verification flow that runs seamlessly against a local SQLite mock data layer first, and transitions to SAP ECC or decentralized SAP EWM via SAP BTP Destination Service and Cloud Connector without frontend refactoring.

```
[ SAPUI5 View / Controller ]
            │ (OData V4 HTTP)
            ▼
[ CAP Service (srv/service.js) ]
            │
            ▼
[ Reusable Services (WarehouseTaskService, ScanService, ValidationService) ]
            │
            ▼
[ EWMConnectorService (Router) ]
       ┌────┴───────────────────────────┐
       ▼                                ▼
[ MockEWMAdapter (SQLite) ]    [ SAPEWMAdapter (SAP BTP Destination) ]
```

## Technology Stack
- **Backend Core**: SAP CAP (`@sap/cds` v8, Node.js)
- **Frontend Framework**: SAPUI5 (v1.120) with Fiori ToolPage Shell layout (`sap.m`, `sap.f`, `sap.tnt`)
- **Database Engine**: SQLite (`db.sqlite`) for local dev, HANA Cloud for production
- **Protocol**: OData V4 (`/odata/v4/one-scan-picker/`)
- **Connector Layer**: `services/EWMConnectorService.js`, `services/DestinationService.js`, and `services/adapters/`

## Completed Features
- **Adapter-Based Integration Layer**: Decoupled `EWMConnectorService` routing requests to `MockEWMAdapter` (SQLite) or `SAPEWMAdapter` (SAP BTP Destination Service) via `ONE_SCAN_MODE`.
- **BTP Destination Abstraction**: Centralized `DestinationService.js` resolving destinations and building authenticated SAP EWM client requests without leaking secrets.
- **Live Dashboard**: Real-time counts for Open, Confirmed, and Failed tasks dynamically queried via OData V4.
- **Warehouse Task Management**: Task table with search filters by material, status, and bin, plus step-by-step pick inspection details.
- **Scan & Verification Engine**: Supports 1D/2D barcode string parsing (`BIN|MATERIAL|SERIAL|HU`), multi-attribute pick validation, and task confirmation.
- **System Diagnostics**: Diagnostic panel displaying mode (`mock`/`production`), backend health, BTP Destination status, SAP EWM adapter status, and latency metrics.
- **Automated Unit Test Suite**: Comprehensive unit test suite (`npm test`) covering mock mode, destination resolution, and error handling.

## Local Startup & Test Guide

1. Install dependencies:
   ```bash
   npm install
   ```
2. Deploy SQLite database schema and seed mock data:
   ```bash
   npm run deploy:db
   ```
3. Run unit tests:
   ```bash
   npm test
   ```
4. Start both CAP backend and UI5 dev server concurrently:
   ```bash
   npm start
   ```
5. Access points:
   - **UI5 Web Application**: `http://localhost:8080/index.html`
   - **CAP OData V4 Service**: `http://localhost:4004/odata/v4/one-scan-picker/`

## Verification Points
- `npm test` passes 16/16 test cases covering adapter routing, mock functions, and error handling.
- CAP OData endpoint `/odata/v4/one-scan-picker/DashboardSummary` returns dynamic metrics.
- UI5 Dashboard cards render numeric counts correctly without `null` placeholders.
- Task status changes update dynamically upon scanning and confirmation.
