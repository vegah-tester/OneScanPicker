# SAP System Information & Landscape Parameters Required

This document provides a comprehensive, structured checklist of technical information required from your SAP ECC/EWM environment to configure the real connectivity layer in OneScanPicker.

> [!IMPORTANT]
> **Security & Confidentiality Rule**:
> - **DO NOT provide passwords, client secrets, private keys, or authentication tokens.**
> - Passwords and secrets must only be entered locally by you in your private `.env` file or in the SAP BTP Cockpit Destination Service configuration.
> - Only provide the architectural metadata (hostnames, port numbers, client IDs, service names, and entity set names) outlined below.

---

## 1. Summary Checklist of Required Information

| # | Parameter Category | Item Description | Sensitivity / Safe to Share? | Status |
| :- | :--- | :--- | :--- | :--- |
| **1** | **ECC / ERP Landscape** | ERP System ID (SID) & Client Number | **SAFE** | `[ ] Pending` |
| **2** | **ECC / ERP Landscape** | Plant (`WERKS`) & Storage Location (`LGORT`) | **SAFE** | `[ ] Pending` |
| **3** | **SAP EWM Landscape** | Deployment Type (Embedded vs Decentralized S/4 or NetWeaver) | **SAFE** | `[ ] Pending` |
| **4** | **SAP EWM Landscape** | Warehouse Number (`LGNUM`) | **SAFE** | `[ ] Pending` |
| **5** | **SAP EWM Landscape** | Warehouse Process Type (`WPT`) for Picking | **SAFE** | `[ ] Pending` |
| **6** | **SAP Gateway** | Gateway Hostname / FQDN or Internal IP | **SAFE** | `[ ] Pending` |
| **7** | **SAP Gateway** | Gateway HTTP/HTTPS Port (e.g. `8000` / `44300`) | **SAFE** | `[ ] Pending` |
| **8** | **SAP Gateway** | SSL / TLS Certificate Type (CA Signed vs Self-Signed) | **SAFE** | `[ ] Pending` |
| **9** | **OData Service** | Technical Service Name (e.g. `/SCWM/WAREHOUSE_TASK_SRV`) | **SAFE** | `[ ] Pending` |
| **10** | **OData Service** | EntitySet Name for Open Tasks (e.g. `WarehouseTasks`) | **SAFE** | `[ ] Pending` |
| **11** | **OData Service** | Confirmation Endpoint / Function (e.g. `ConfirmWarehouseTask`) | **SAFE** | `[ ] Pending` |
| **12** | **Authentication** | Technical User ID (Username only — **NO PASSWORDS**) | **SAFE** (Username only) | `[ ] Pending` |
| **13** | **Cloud Connector** | Virtual Host & Port (e.g. `virtual-sap-ewm:44300`) | **SAFE** | `[ ] Pending` |
| **14** | **BTP Destination** | Destination Service Name in BTP (e.g. `SAP_EWM_DESTINATION`) | **SAFE** | `[ ] Pending` |

---

## 2. Detailed Technical Breakdown by Layer

---

### Layer A: SAP ECC / ERP Information

#### 1. ERP System ID (SID) & Mandant (Client)
- **Why OneScanPicker Needs It**: Used in HTTP header `sap-client: <MANDT>` to route requests to the correct SAP logical database partition.
- **Where to Find in SAP**: In SAP GUI status bar (bottom right) or menu **System** -> **Status...** -> field **Client** (e.g. `100`, `200`, `800`).
- **Safe to Provide**: **YES** (Standard 3-digit number).

#### 2. Plant Code (`WERKS`) & Storage Location (`LGORT`)
- **Why OneScanPicker Needs It**: Needed to identify warehouse assignment and goods movement transactions during delivery picking.
- **Where to Find in SAP**: Transaction `OX09` (Enterprise Structure Storage Locations) or transaction `MM03` on any warehouse-managed material.
- **Safe to Provide**: **YES** (e.g. Plant `1000`, SLoc `0001`).

---

### Layer B: SAP EWM Information

#### 3. EWM Deployment Model & Version
- **Why OneScanPicker Needs It**: Determines whether OData services run on the S/4HANA embedded gateway stack or decentralized NetWeaver EWM.
- **Where to Find in SAP**: In SAP GUI, transaction `SPAM` (Installed Software Component Versions) -> check for `S4CORE` (Embedded) or `SCWM` / `SAP_BASIS` (Decentralized EWM).
- **Safe to Provide**: **YES** (e.g. "S/4HANA 2022 Embedded" or "EWM 9.5 on NetWeaver 7.50").

#### 4. EWM Warehouse Number (`LGNUM`)
- **Why OneScanPicker Needs It**: Filters warehouse tasks in `/SCWM/ORDIM_O` to your specific warehouse partition.
- **Where to Find in SAP**: Transaction `/SCWM/MON` (Warehouse Management Monitor) -> initial pop-up prompts for **Warehouse Number** (e.g. `W001`, `100`).
- **Safe to Provide**: **YES** (3 or 4 character code).

#### 5. Warehouse Process Type (`WPT`) for Picking
- **Why OneScanPicker Needs It**: Filters open tasks specific to outbound delivery stock removal (e.g. WPT `2010` - Standard Pick).
- **Where to Find in SAP**: Transaction `/SCWM/MON` -> Node *Outbound Process* -> *Warehouse Tasks* or SPRO Customizing: *SCM Extended Warehouse Management > Cross-Process Settings > Define Warehouse Process Type*.
- **Safe to Provide**: **YES** (e.g. `2010`, `PICK`).

---

### Layer C: SAP Gateway & Network Information

#### 6. Gateway Host & Port
- **Why OneScanPicker Needs It**: The destination hostname/IP and TCP port for Direct Mode connections or Cloud Connector mapping.
- **Where to Find in SAP**:
  - Transaction `SMICM` -> Menu **Goto** -> **Services** -> Note the **HTTP** or **HTTPS** port and host.
  - Or transaction `/IWFND/MAINT_SERVICE` -> click **Service Documentation** or **Call Browser**.
- **Safe to Provide**: **YES** (Internal IP or FQDN e.g. `192.168.1.50` or `sapewm.local`, Port `8000` / `44300`).

#### 7. SSL / TLS Certificate Policy
- **Why OneScanPicker Needs It**: Configures Node.js TLS agent (`strictSSL: true/false`).
- **Where to Find in SAP**: Transaction `STRUST` (Trust Manager). If using default self-signed certificates, `strictSSL=false` is configured in `.env`.
- **Safe to Provide**: **YES** (State whether certificate is self-signed or CA-signed).

---

### Layer D: OData Service & Entity Set Information

#### 8. Technical Gateway Service Name & ICF Node
- **Why OneScanPicker Needs It**: The exact URI path to dispatch OData V2/V4 calls.
- **Where to Find in SAP**: Transaction `/IWFND/MAINT_SERVICE`. Search for active picking services (standard `/SCWM/WAREHOUSE_TASK_SRV` or custom `Z_ONESCAN_SRV`).
- **Safe to Provide**: **YES** (e.g. `/sap/opu/odata/scwm/WAREHOUSE_TASK_SRV`).

#### 9. EntitySet Name for Open Tasks
- **Why OneScanPicker Needs It**: The OData collection queried with `$filter=ConfirmationStatus eq 'O'`.
- **Where to Find in SAP**: Transaction `/IWFND/GW_CLIENT` -> enter service root and press Enter to view the Service Document XML/JSON listing all EntitySets (e.g. `WarehouseTasks` or `WarehouseTaskSet`).
- **Safe to Provide**: **YES** (Entity name string).

#### 10. Confirmation Endpoint Signature
- **Why OneScanPicker Needs It**: The OData Function Import or entity POST endpoint to update task status to Confirmed (`C`).
- **Where to Find in SAP**: In `/IWFND/GW_CLIENT` metadata (`$metadata`), locate `<FunctionImport Name="ConfirmWarehouseTask"...>` or entity POST capability.
- **Safe to Provide**: **YES** (Function name and parameter schema).

---

### Layer E: Authentication & Authorization

#### 11. Technical Service User
- **Why OneScanPicker Needs It**: Configures Basic Authentication or Principal Propagation.
- **Where to Find in SAP**: Transaction `SU01` (User Maintenance). The technical user must have RFC and Gateway authorizations.
- **Safe to Provide**:
  - **Username**: **YES** (e.g. `RFC_ONESCAN` or `SAP_BATCH`).
  - **Password**: **NO! NEVER SHARE YOUR PASSWORD.** Enter it only into your local `.env` or BTP Cockpit.

---

### Layer F: SAP Cloud Connector (SCC) & BTP Information

#### 12. Cloud Connector Virtual Mapping
- **Why OneScanPicker Needs It**: In BTP Production mode, BTP destinations connect to the Virtual Hostname configured in Cloud Connector, which SCC tunnels to your internal SAP Gateway.
- **Where to Find**: In Cloud Connector Admin UI (`https://localhost:8443`) -> *Cloud to On-Premise* -> *Virtual Host* and *Virtual Port* (e.g. `virtual-sap-ewm:44300`).
- **Safe to Provide**: **YES** (Virtual DNS name).

#### 13. BTP Destination Service Instance
- **Why OneScanPicker Needs It**: Matches `ONE_SCAN_DESTINATION_NAME` in `mta.yaml` and `.env`.
- **Where to Find**: SAP BTP Cockpit -> Subaccount -> *Connectivity* -> *Destinations* (e.g. `SAP_EWM_DESTINATION`).
- **Safe to Provide**: **YES** (Destination name string).
