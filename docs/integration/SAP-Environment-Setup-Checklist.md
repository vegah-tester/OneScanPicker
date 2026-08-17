# SAP Environment Preparation & Configuration Checklist

This runbook details the exact sequence of technical configurations required on the SAP side (ECC/EWM, Gateway, Cloud Connector, and BTP) before live connectivity can be established.

---

## Progress Overview

- **Overall Status**: PRE-CONFIGURATION PHASE
- **Local Application Readiness**: COMPLETED (Mock Mode Operational, Adapter Ready)
- **SAP Landscape Preparation**: PENDING

---

## 1. SAP ABAP Gateway Configuration (`SICF` & `/IWFND/`)

| # | Task Description | SAP Transaction | Status | Notes |
| :- | :--- | :--- | :--- | :--- |
| **1.1** | Verify Internet Communication Manager (ICM) HTTP/HTTPS active | `SMICM` -> *Goto* -> *Services* | `[ ] Not started` | Port 8000 / 44300 must show **Active** |
| **1.2** | Activate SAP Gateway OData runtime node in ICF | `SICF` | `[ ] Not started` | Path: `/default_host/sap/opu/odata/` |
| **1.3** | Register & Activate EWM Picking OData Service | `/IWFND/MAINT_SERVICE` | `[ ] Not started` | Service: `/SCWM/WAREHOUSE_TASK_SRV` or custom `Z_ONESCAN_SRV` |
| **1.4** | Test service root in SAP Gateway Client | `/IWFND/GW_CLIENT` | `[ ] Not started` | Verify HTTP 200 OK returned |
| **1.5** | Verify CSRF Token negotiation in Gateway Client | `/IWFND/GW_CLIENT` | `[ ] Not started` | Header `X-CSRF-Token: Fetch` returns token |
| **1.6** | Test `$metadata` retrieval | `/IWFND/GW_CLIENT` | `[ ] Not started` | EntitySet definitions visible |

---

## 2. SAP Authorization & Security Configuration

| # | Task Description | SAP Transaction | Status | Notes |
| :- | :--- | :--- | :--- | :--- |
| **2.1** | Create Technical Service User (Type: System / Service) | `SU01` | `[ ] Not started` | e.g. `ONESCAN_RFC` |
| **2.2** | Assign Gateway Authorization Object `S_SERVICE` | `PFCG` | `[ ] Not started` | `SRV_NAME = *` or specific technical service |
| **2.3** | Assign RFC Authorization Object `S_RFC` | `PFCG` | `[ ] Not started` | `RFC_NAME = /SCWM/*, RFC_METADATA` |
| **2.4** | Assign EWM Warehouse Task Authorization Object `/SCWM/WT` | `PFCG` | `[ ] Not started` | `ACTVT = 02 (Confirm), 03 (Display)` |
| **2.5** | Assign EWM Warehouse Number Authorization `/SCWM/LGNUM` | `PFCG` | `[ ] Not started` | `LGNUM = <Your Warehouse>` |

---

## 3. SAP EWM Business & Master Data Preparation

| # | Task Description | SAP Transaction | Status | Notes |
| :- | :--- | :--- | :--- | :--- |
| **3.1** | Verify Picking Storage Bins and Bin Coordinates | `/SCWM/LS03N` | `[ ] Not started` | e.g. `BIN-A01`, `BIN-B01` |
| **3.2** | Verify Material Master & Barcode Packaging Data | `MM03` / `/SCWM/MAT1` | `[ ] Not started` | Material SKU and barcode GTIN/EAN |
| **3.3** | Verify Handling Unit (HU) Packaging | `/SCWM/MON` (Node: *Handling Unit*) | `[ ] Not started` | HU container types configured |
| **3.4** | Create Test Outbound Delivery Order (ODO) | `/SCWM/PRDO` | `[ ] Not started` | Originating from ECC delivery or manual test |
| **3.5** | Release Wave & Generate Open Warehouse Tasks (WTs) | `/SCWM/WAVE` or `/SCWM/PRDO` | `[ ] Not started` | Must produce open tasks in `/SCWM/ORDIM_O` |

---

## 4. SAP Cloud Connector (SCC) Configuration *(For BTP Production Mode)*

| # | Task Description | Tool / UI | Status | Notes |
| :- | :--- | :--- | :--- | :--- |
| **4.1** | Access SAP Cloud Connector Admin Console | `https://localhost:8443` | `[ ] Not started` | Default user: `Administrator` |
| **4.2** | Link Subaccount to SAP BTP Cockpit | SCC -> *Add Subaccount* | `[ ] Not started` | Region, Subaccount ID, S-User / Password |
| **4.3** | Verify Subaccount Status indicator | SCC Subaccount Overview | `[ ] Not started` | Indicator must turn **Green** (Connected) |
| **4.4** | Add Cloud-To-On-Premise Virtual Mapping | SCC -> *Cloud To On-Premise* | `[ ] Not started` | Internal host:port -> Virtual `virtual-sap-ewm:44300` |
| **4.5** | Whitelist OData URL Resource Path | SCC -> *Accessible Resources* | `[ ] Not started` | Path: `/sap/opu/odata/` (Sub-paths: Enabled) |
| **4.6** | Whitelist Basis Resource Path | SCC -> *Accessible Resources* | `[ ] Not started` | Path: `/sap/bc/` (Sub-paths: Enabled) |

---

## 5. SAP BTP Destination & Connectivity Service *(For BTP Production Mode)*

| # | Task Description | BTP Tool / Cockpit | Status | Notes |
| :- | :--- | :--- | :--- | :--- |
| **5.1** | Create Destination in BTP Cockpit | BTP Cockpit -> *Destinations* | `[ ] Not started` | Name: `SAP_EWM_DESTINATION` |
| **5.2** | Configure ProxyType and URL | BTP Cockpit -> *Destinations* | `[ ] Not started` | `ProxyType=OnPremise`, URL=`http://virtual-sap-ewm:44300/...` |
| **5.3** | Configure Authentication & User | BTP Cockpit -> *Destinations* | `[ ] Not started` | `BasicAuthentication` or `PrincipalPropagation` |
| **5.4** | Add Extended Properties | BTP Cockpit -> *Destinations* | `[ ] Not started` | `sap-client=100`, `WebIDEEnabled=true`, `HTML5.DynamicDestination=true` |
| **5.5** | Execute BTP "Check Connection" Test | BTP Cockpit -> *Check Connection* | `[ ] Not started` | Must return `200 OK Connection established` |

---

## 6. End-to-End Handshake Verification with OneScanPicker

| # | Verification Action | Execution Tool | Status | Expected Result |
| :- | :--- | :--- | :--- | :--- |
| **6.1** | Test Direct Network Reachability | `node scripts/test-sap-connection.js` | `[ ] Not started` | HTTP 200 OK from Gateway service root |
| **6.2** | Test CSRF Token Fetch | `node scripts/test-sap-connection.js` | `[ ] Not started` | `X-CSRF-Token` and session cookies received |
| **6.3** | Test Open Warehouse Task Query | `node scripts/test-sap-connection.js` | `[ ] Not started` | Live tasks returned from SAP `/SCWM/ORDIM_O` |
| **6.4** | Test UI Diagnostics Ping | Web Browser (`#/diagnostics`) | `[ ] Not started` | Shows live measured latency and connected status |
| **6.5** | Execute 1-Scan Live Pick Confirmation | Web Browser (`#/scan`) | `[ ] Not started` | Task confirmed in EWM (table `/SCWM/ORDIM_C`) |
