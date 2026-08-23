# SAP BTP Cloud Foundry Deployment Readiness Checklist

This document details the deployment architecture, service requirements, and preparation checklist for deploying **OneScanPicker** to SAP Business Technology Platform (BTP).

---

## 1. BTP Multi-Target Application (MTA) Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SAP BTP Cloud Foundry Subaccount & Space                                     │
│                                                                             │
│  ┌───────────────────────┐         ┌─────────────────────────────────────┐  │
│  │ onescanpicker-ui5     │         │ onescanpicker-srv                   │  │
│  │ (SAPUI5 HTML5 App)    │         │ (Node.js CAP OData Backend)         │  │
│  └───────────┬───────────┘         └──────────────────┬──────────────────┘  │
│              │                                        │                     │
│              ▼                                        ▼                     │
│  ┌───────────────────────┐         ┌─────────────────────────────────────┐  │
│  │ HTML5 Application     │         │ SAP BTP Managed Services:           │  │
│  │ Repository            │         │  1. Destination Service (lite)      │  │
│  │ (Approuter)           │         │  2. Connectivity Service (lite)     │  │
│  └───────────────────────┘         │  3. XSUAA Authentication Service    │  │
│                                    │  4. SAP HANA Cloud (hdi-shared)     │  │
│                                    └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. BTP Services & Module Readiness Matrix

| Component / Service | MTA Resource Name | Service Plan | Purpose | Status in Codebase |
| :--- | :--- | :--- | :--- | :--- |
| **CAP Backend Module** | `onescanpicker-srv` | Node.js (512M) | Core OData V4 Picking & Verification API | **READY** (`srv/service.js`, `gen/srv`) |
| **SAPUI5 Frontend Module** | `onescanpicker-ui5` | HTML5 / custom | Fiori ToolPage mobile picking interface | **READY** (`app/ui5`, `app/ui5/dist`) |
| **Security Service (XSUAA)** | `onescanpicker-auth` | `xsuaa:application` | User authentication, scopes & role templates | **READY** (`xs-security.json`) |
| **Destination Service** | `onescanpicker-destination-service` | `destination:lite` | Routes requests to SAP EWM on-premise backend | **READY** (`mta.yaml`, `DestinationService.js`) |
| **Connectivity Service** | `onescanpicker-connectivity-service` | `connectivity:lite` | Provides SOCKS5 proxy tunnel to Cloud Connector | **READY** (`mta.yaml`) |
| **HANA Cloud Database** | `onescanpicker-db` | `hana:hdi-shared` | Persistent task history and scan logs | **READY** (`db/schema.cds`, `gen/db`) |

---

## 3. Pre-Deployment Verification Checklist

- [x] `mta.yaml` configured with valid MTA version 3.1.0 and service bindings.
- [x] `xs-security.json` configured with role templates (`PickerUserRole`, `SupervisorRole`, `AdminRole`).
- [x] CAP backend build verified with `npm run build:cds` (outputs to `gen/srv`).
- [x] SAPUI5 build verified with `npm run build:ui5` (outputs to `app/ui5/dist`).
- [x] SQLite fallback enabled for development and local testing.
- [ ] SAP Cloud Connector paired to BTP subaccount with active green status.
- [ ] Destination `SAP_EWM_DESTINATION` created in BTP Cockpit pointing to virtual host.
- [ ] Target Cloud Foundry space created and targeted (`cf target -o <org> -s <space>`).
- [ ] MTA build executed using Cloud MTA Build Tool: `mbt build`.
- [ ] MTA archive deployed using Cloud Foundry CLI: `cf deploy mta_archives/onescanpicker_1.0.0.mtar`.
