# OneScanPicker

**OneScanPicker** is an enterprise-grade warehouse picking and verification application built on **SAP CAP (Node.js)** and **SAPUI5 / SAP Fiori Horizon**.

It streamlines warehouse logistics by enabling instant 1-scan composite barcode verification (`BIN|MATERIAL|SERIAL|HU`), step-by-step picking flows, audit logging, and seamless multi-mode integration with **SAP S/4HANA (MCD)**, decentralized **SAP EWM**, and **SAP BTP**.

---

## Architecture Overview

OneScanPicker is designed with a decoupled 3-tier architecture that allows local offline development against SQLite, direct on-premise connection to SAP Gateway on your local network, or deployment to SAP BTP using Destination Service and Cloud Connector — all without altering frontend code.

```
┌─────────────────────────────────────────────────────────────┐
│             SAPUI5 Frontend (Fiori Horizon)                 │
│      Dashboard • Task List • 1-Scan Verification • Audit     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / OData V4 (:8080 -> :4004)
┌──────────────────────────────▼──────────────────────────────┐
│             SAP CAP Service Layer (srv/service.js)          │
│   Entities: Tasks, DashboardSummary, Dashboard, Scans       │
│   Actions:  scan, validate, confirm, connection, history    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│           Unified Connector Layer (EWMConnectorService)     │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
     [ONE_SCAN_MODE=mock]           [ONE_SCAN_MODE=direct|production]
               │                              │
┌──────────────▼──────────────┐┌──────────────▼───────────────┐
│     MockEWMAdapter.js       ││       SAPEWMAdapter.js       │
│  - Local SQLite (db.sqlite) ││  - S/4HANA MCD Gateway       │
│  - Seeded Warehouse Tasks   ││  - OData V2 (API_WH_TASK)    │
│  - Fast Offline Dev & Tests ││  - CSRF & Session Management │
│                             ││  - BTP Destination Service   │
└─────────────────────────────┘└──────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Backend Core** | SAP CAP (`@sap/cds` v8.9) | Node.js runtime, Express HTTP engine, CDS compiler |
| **Frontend Framework** | SAPUI5 (v1.120.17) | SAP Fiori Horizon theme (`sap.m`, `sap.f`, `sap.tnt`, `sap.ui.layout`) |
| **Local Database** | SQLite3 (`db.sqlite`) | File-based SQL persistence and CSV seed loader |
| **Connector Layer** | Axios + Custom Adapters | Automatic CSRF handshake, session pooling, ABAP field normalization |
| **API Protocol** | OData V4 (`/odata/v4/one-scan-picker/`) | Standard CAP service endpoints |
| **Target SAP System** | SAP S/4HANA (SID: `MCD`) | `API_WAREHOUSE_ORDER_TASK` Gateway OData V2 service |

---

## Core Features

- **SAP Fiori Horizon Interface**: Responsive layouts, TNT side navigation, metric KPI cards, status badges, and interactive picking tables.
- **Hash-Based Routing**: Deep links for all views (`#/dashboard`, `#/tasks`, `#/tasks/{taskId}`, `#/scan`, `#/history`, `#/diagnostics`).
- **1-Scan Barcode Engine**: Parses 2D composite barcodes (`BIN|MATERIAL|SERIAL|HU`), validates each component against the target warehouse task, and records the scan event.
- **Three-Tier Adapter Architecture**: Switch seamlessly between local SQLite mock data, direct on-premise SAP Gateway (MCD), and SAP BTP Destination Service via simple environment variables.
- **Live System Diagnostics**: Real-time diagnostic ping button measuring roundtrip latency (ms), reporting active mode, destination name, endpoint reachability, and CSRF token status.
- **Automated Verification**: Comprehensive unit and integration test suite (`npm test`) with 21 passing test cases covering configuration resolution, adapters, and ABAP mapping.

---

## Local Quickstart Guide

### Prerequisites
- **Node.js**: v20+ LTS
- **Git**: Git for Windows 2.44+

### 1. Install Dependencies
```bash
# Install backend and development dependencies
npm install

# Install UI5 frontend dependencies
npm --prefix app/ui5 install
```

### 2. Initialize Database & Mock Data
```bash
npm run deploy:db
```
*Deploys `db/schema.cds` and loads seed CSV data from `db/data/` into `db.sqlite`.*

### 3. Run Automated Tests
```bash
npm test
```
*Executes all 21 integration tests covering mock mode, direct mode, production routing, CSRF negotiation, and ABAP normalization.*

### 4. Start the Application
```bash
npm start
```
*Runs the CAP backend and UI5 frontend concurrently:*
- **Frontend UI5 Application**: [http://localhost:8080/index.html](http://localhost:8080/index.html)
- **CAP OData V4 Service**: [http://localhost:4004/odata/v4/one-scan-picker/](http://localhost:4004/odata/v4/one-scan-picker/)

---

## Runtime Integration Modes

Configure your mode in `.env` (copied from `.env.example`):

### Mode 1: Mock Mode (`ONE_SCAN_MODE=mock`)
Default mode for offline development. Uses local SQLite persistence and pre-seeded tasks. No SAP connection is required.

### Mode 2: Direct SAP Gateway (`ONE_SCAN_MODE=direct`)
Direct HTTP/HTTPS communication with your On-Premise SAP S/4HANA or ECC system over local network or VPN.
```env
ONE_SCAN_MODE=direct
SAP_EWM_HOST=192.168.1.50
SAP_EWM_PORT=8000
SAP_EWM_USE_SSL=false
SAP_EWM_CLIENT=100
SAP_EWM_USER=YOUR_SAP_USER
SAP_EWM_PASSWORD=YOUR_SAP_PASSWORD
SAP_EWM_BASE_PATH=/sap/opu/odata/sap/API_WAREHOUSE_ORDER_TASK
SAP_EWM_TASK_ENTITY=WarehouseTask
SAP_EWM_CONFIRM_FUNCTION=ConfirmWarehouseTask
SAP_EWM_FALLBACK_SIMULATION=true
```

### Mode 3: SAP BTP Production (`ONE_SCAN_MODE=production`)
Routes requests through SAP BTP Destination Service and SAP Cloud Connector.
```env
ONE_SCAN_MODE=production
ONE_SCAN_DESTINATION_NAME=SAP_EWM_DESTINATION
SAP_EWM_BASE_URL=https://sap-ewm.btp.internal/odata/v2/
```

---

## 9-Step SAP Gateway Diagnostic Tool

To test and verify live connectivity with your SAP system before running the UI:
```bash
node scripts/test-sap-connection.js
```

This diagnostic script runs 9 sequential verification steps:
1. **DNS & Host Resolution**: Resolves host FQDN or IP.
2. **HTTP Root Reachability**: Tests network access to the SAP Gateway base URL.
3. **Authentication Verification**: Validates HTTP Basic Auth credentials against SAP client.
4. **CSRF Token Handshake**: Tests `X-CSRF-Token: Fetch` and session cookies.
5. **$metadata Retrieval**: Fetches and inspects EDMX schema for `WarehouseTask`.
6. **EntitySet Collection Query**: Queries the task entity set (`?$top=1`).
7. **Open Tasks Query**: Retrieves live open warehouse tasks from SAP EWM.
8. **Task Validation**: Runs sample validation through the adapter pipeline.
9. **Confirmation Action**: Checks confirmation endpoint configuration.

---

## Directory Structure

```
OneScanPicker/
├── app/ui5/                           # SAPUI5 application
│   ├── webapp/                        # Views, Controllers, Component.js, manifest.json
│   └── ui5.yaml                       # Simpleproxy to CAP (:8080 -> :4004)
├── db/                                # CDS Data model and CSV seed data
├── srv/                               # CAP OData V4 service definition and handlers
├── handlers/                          # Business logic (Dashboard, Tasks, Scans)
├── services/                          # Reusable services and connector adapters
│   └── adapters/                      # MockEWMAdapter.js & SAPEWMAdapter.js
├── scripts/                           # Connectivity tests & mock data generators
├── test/                              # Automated test suite (index.test.js)
├── docs/                              # Architecture decision records & integration checklists
│   └── integration/                   # Detailed SAP GUI discovery guides
├── AGENTS.md                          # Comprehensive instructions for AI coding agents
├── .env.example                       # Environment configuration template
├── mta.yaml                           # SAP BTP Cloud Foundry deployment descriptor
└── package.json                       # Project configuration and lifecycle scripts
```

---

## Verification & Health Check

1. `npm test` passes 21/21 tests.
2. `http://localhost:8080/index.html` loads with the Fiori Horizon theme and active navigation.
3. `http://localhost:8080/odata/v4/one-scan-picker/Tasks` returns warehouse tasks.
4. The **Diagnostics** page (`#/diagnostics`) displays mode status, target endpoint, and roundtrip ping latency.