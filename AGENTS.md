# OneScanPicker Agent Reference & Instructions

## 1. Project Purpose & High-Level Identity
**OneScanPicker** is an enterprise-grade warehouse picking and verification application designed for SAP BTP, SAP S/4HANA, and decentralized SAP EWM. Built with **SAP CAP (Node.js)** for the backend and **SAPUI5 (SAP Fiori Horizon)** for the frontend, it enables 1-scan barcode verification (`BIN|MATERIAL|SERIAL|HU`), step-by-step picking flows, real-time KPI metrics, and seamless multi-mode SAP backend integration.

---

## 2. Core Architectural Principles & Golden Rules
Any agent working on this repository MUST strictly follow these rules:

1. **UI Independence from SAP EWM**:
   - The SAPUI5 frontend (`app/ui5/`) must NEVER call SAP Gateway or EWM directly.
   - All frontend communication is directed strictly to the local CAP OData V4 service endpoints (`/odata/v4/one-scan-picker/`).
   - The UI remains completely unaware of whether backend data originates from SQLite, direct SAP Gateway, or BTP Destination Service.

2. **Thin Controllers, Rich Services**:
   - SAPUI5 controllers (`app/ui5/webapp/controller/`) must handle UI state, view bindings, and user interactions only.
   - Business flows belong in CAP handlers (`handlers/`) and reusable backend services (`services/`).

3. **Three-Tier Adapter Pattern (`EWMConnectorService`)**:
   - Never hardcode SAP HTTP calls in route handlers.
   - All external warehouse operations go through `services/EWMConnectorService.js`, which dynamically routes to either:
     - `services/adapters/MockEWMAdapter.js` (SQLite-backed mock mode).
     - `services/adapters/SAPEWMAdapter.js` (Live SAP S/4HANA Gateway / Cloud Connector).

4. **Local Development First**:
   - Always verify new logic against local SQLite (`db.sqlite`) before attempting live SAP calls.
   - Keep mock datasets synchronized with live SAP entity structures.

5. **Security & Zero-Credential Policy**:
   - NEVER commit `.env`, passwords, API tokens, or secrets to Git.
   - All live credentials must be read from environment variables or SAP BTP Destination Service bindings.

---

## 3. Directory Layout & Module Responsibilities

```
OneScanPicker/
├── app/
│   └── ui5/                           # SAPUI5 / Fiori Horizon frontend application
│       ├── webapp/
│       │   ├── controller/            # View controllers (App, Dashboard, TaskList, TaskDetail, ScanVerification, PickHistory, ConnectionStatus)
│       │   ├── view/                  # XML views (Fiori Horizon layouts, TNT tool headers, responsive grids)
│       │   ├── css/style.css          # Custom styling and status badges
│       │   ├── i18n/i18n.properties   # Internationalization strings
│       │   ├── Component.js           # UI5 root component & routing initialization
│       │   └── manifest.json          # UI5 app descriptor, routing targets, data sources
│       ├── package.json               # UI5 CLI dependencies
│       └── ui5.yaml                   # UI5 server configuration and simpleproxy (/odata/v4/one-scan-picker -> :4004)
├── db/
│   ├── data/                          # CSV seed data loaded during cds deploy
│   │   ├── onescanpicker.db-ConnectionStatus.csv
│   │   ├── onescanpicker.db-ScanRecords.csv
│   │   └── onescanpicker.db-WarehouseTasks.csv
│   └── schema.cds                     # Core CDS entity definitions (WarehouseTasks, ScanRecords, ConnectionStatus)
├── srv/
│   ├── service.cds                    # OData V4 service interface (Entities: Tasks, DashboardSummary, Scans; Actions: scan, validate, confirm, connection, history)
│   └── service.js                     # CAP service event dispatchers delegating to handlers
├── handlers/
│   ├── DashboardHandler.js            # KPI metrics aggregation and system status resolution
│   ├── ScanHandler.js                 # 2D barcode parsing, multi-field verification, audit recording
│   └── TaskHandler.js                 # Task listing, task detail, pick confirmation orchestration
├── services/
│   ├── adapters/
│   │   ├── MockEWMAdapter.js          # SQLite-backed warehouse task operations
│   │   └── SAPEWMAdapter.js           # Live SAP Gateway / S4HANA OData V2 adapter with CSRF & ABAP field normalization
│   ├── DestinationService.js          # Mode resolution (mock/direct/production) and connectivity diagnostics
│   ├── EWMConnectorService.js         # Unified facade routing requests between adapters
│   ├── LoggerService.js               # Standardized logging utility
│   ├── ScanService.js                 # Barcode parsing regex and format validation
│   ├── ValidationService.js           # Task parameter matching logic
│   └── WarehouseTaskService.js        # High-level task operations facade
├── mock/                              # Standalone browser mock adapters and static snapshots
├── scripts/
│   ├── generate-dashboard-data.js     # Generates static UI5 mock dashboard data
│   └── test-sap-connection.js         # 9-Step automated SAP Gateway discovery and verification suite
├── test/
│   └── index.test.js                  # 21-test automated integration suite (adapters, modes, CSRF, error handling)
├── docs/                              # Full architectural, business flow, state machine, and integration guides
│   └── integration/                   # Step-by-step guides for SAP GUI discovery, Gateway setup, and BTP deployment
├── .cdsrc.json                        # CAP CDS runtime configuration
├── .env.example                       # Environment template for all integration modes
├── mta.yaml                           # SAP BTP Cloud Foundry Multi-Target Application deployment descriptor
└── package.json                       # Root project scripts and dependencies
```

---

## 4. Runtime Architecture & Execution Stack

### Environment Requirements
- **Node.js**: v20+ LTS (Tested on v20.18.0)
- **Git**: Git for Windows 2.44+
- **Database**: SQLite (`db.sqlite`) for local development, SAP HANA Cloud for BTP production

### Server Ports & Communication
| Service | Port | Protocol | Notes |
| :--- | :--- | :--- | :--- |
| **CAP Backend** | `4004` | OData V4 (`/odata/v4/one-scan-picker/`) | Node.js `@sap/cds` Express server |
| **SAPUI5 Frontend** | `8080` | HTTP (`/index.html`) | `@ui5/cli` with `ui5-middleware-simpleproxy` routing `/odata` requests to port `4004` |

### Core Commands
```bash
# Install dependencies across both root and UI5 subproject
npm install
npm --prefix app/ui5 install

# Deploy SQLite schema and seed mock CSV data
npm run deploy:db

# Run automated integration tests (21 test cases)
npm test

# Run the 9-Step SAP Gateway live diagnostic suite
node scripts/test-sap-connection.js

# Start both CAP backend and UI5 frontend concurrently
npm start

# Run CAP backend in watch mode
npm run watch
```

---

## 5. Multi-Mode Backend Switching

The runtime mode is controlled via the `ONE_SCAN_MODE` environment variable in `.env`:

```
ONE_SCAN_MODE=mock | direct | production
```

### 1. `mock` Mode (Default)
- Uses `MockEWMAdapter.js` backed by SQLite `db.sqlite`.
- Does not require network access to SAP.
- Perfect for local feature development, UI testing, and CI/CD pipelines.

### 2. `direct` Mode (On-Premise / LAN / RDP)
- Uses `SAPEWMAdapter.js` with Axios HTTP/HTTPS client.
- Connects directly to an On-Premise SAP S/4HANA or ECC system hosting SAP Gateway.
- Requires `SAP_EWM_HOST`, `SAP_EWM_PORT`, `SAP_EWM_CLIENT`, `SAP_EWM_USER`, `SAP_EWM_PASSWORD`.
- Base URL format: `http(s)://<SAP_EWM_HOST>:<SAP_EWM_PORT><SAP_EWM_BASE_PATH>`.

### 3. `production` / `btp` Mode
- Uses `SAPEWMAdapter.js` configured for SAP BTP Destination Service.
- Resolves destinations configured in SAP BTP Cockpit (e.g., `SAP_EWM_DESTINATION`) routing via SAP Cloud Connector.

---

## 6. Target SAP System: S/4HANA MCD Specifics

This repository is tailored to connect with SAP S/4HANA instance **MCD**:

| Parameter | Configuration for S/4HANA MCD |
| :--- | :--- |
| **SAP System ID (SID)** | `MCD` |
| **System Description** | `S4HANA ...` |
| **Standard OData Gateway Service** | `API_WAREHOUSE_ORDER_TASK` (OData V2) |
| **Service Base Path** | `/sap/opu/odata/sap/API_WAREHOUSE_ORDER_TASK` |
| **Primary Entity Set** | `WarehouseTask` |
| **Confirmation Action** | `ConfirmWarehouseTask` |
| **Supported Field Mappings** | `WarehouseTask`, `Product` (`MATNR`), `SourceStorageBin` (`VLPLA`), `DestinationStorageBin` (`NLPLA`), `SourceHandlingUnit` (`VLENR`), `SerialNumber` (`SERNR`), `ConfirmationStatus` (`TAPOS`) |

---

## 7. OData V4 Service Contract (`srv/service.cds`)

### Entities
- `Tasks`: Projection on `db.WarehouseTasks`. Contains `taskNumber`, `material`, `sourceBin`, `destinationBin`, `handlingUnit`, `serialNumber`, `status` (`Open`, `Confirmed`, `Failed`).
- `DashboardSummary`: Real-time aggregated metrics (`openTasks`, `confirmedTasks`, `failedTasks`, `connectionStatus`, `mode`, `endpoint`).
- `Dashboard`: Projection on `db.ConnectionStatus` for detailed diagnostic cards.
- `Scans`: Projection on `db.ScanRecords` for the pick audit history.

### Actions
- `scan(scanValue: String)`: Parses a 2D composite barcode string (`BIN|MAT|SER|HU`) and returns structured elements.
- `validate(...)`: Cross-checks scanned parameters against task requirements.
- `confirm(taskNumber: String)`: Executes warehouse task confirmation in SQLite or SAP EWM.
- `connection()`: Executes a real-time connectivity health check, measuring roundtrip latency and CSRF status.
- `history()`: Returns the recent scan audit trail.

---

## 8. Development & Verification Rules for Future Agents

- **Always run tests after backend changes**: Execute `npm test` to verify no regressions across the 21 test cases.
- **Do not modify the simpleproxy configuration** in `app/ui5/ui5.yaml` without ensuring port alignments with `package.json`.
- **Preserve fallback simulation**: `SAP_EWM_FALLBACK_SIMULATION=true` in `SAPEWMAdapter.js` allows direct mode to gracefully fall back during off-network testing.
- **Refer to documentation in `docs/integration/`** when modifying SAP communication, discovery steps, or Cloud Connector mappings.