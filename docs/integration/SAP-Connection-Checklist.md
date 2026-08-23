# SAP ECC / EWM Direct Connection Checklist

This document provides the status checklist of technical parameters required for direct SAP Gateway connectivity in OneScanPicker.

> [!IMPORTANT]
> **Security Notice**:
> - **DO NOT include passwords or private keys in this document or in git commits.**
> - Passwords and credentials must only be stored in your local `.env` file or in SAP BTP Destination Service.

---

## Technical Parameter Status Table

| Parameter | Technical Field / Header | Current Value / Setting | Status | Description / Source |
| :--- | :--- | :--- | :--- | :--- |
| **SAP Client** | `sap-client` / `SAP_EWM_CLIENT` | `001` | **KNOWN** | SAP Client / Mandant number configured in `.env` |
| **Technical User** | Basic Auth Username / `SAP_EWM_USER` | `Vegah1` | **KNOWN** | Username for SAP Gateway authentication |
| **Authentication Method** | `Authorization` header | `BasicAuthentication` | **KNOWN** | Standard HTTP Basic Authentication with technical user |
| **SAP Gateway Host / IP** | `SAP_EWM_HOST` | `localhost` *(Pending target host)* | **REQUIRED FROM SAP TEAM** | FQDN or internal IP of SAP ECC / EWM Gateway server |
| **SAP Gateway Port** | `SAP_EWM_PORT` | `8000` *(HTTP)* / `44300` *(HTTPS)* | **REQUIRED FROM SAP TEAM** | Gateway HTTP/HTTPS port (transaction `SMICM` -> Services) |
| **SSL / Certificate Policy** | `SAP_EWM_USE_SSL`, `SAP_EWM_STRICT_SSL` | `USE_SSL=false`, `STRICT_SSL=false` | **KNOWN** | Configured to support HTTP or self-signed HTTPS certificates |
| **Gateway Base Path** | `SAP_EWM_BASE_PATH` | `/sap/opu/odata/scwm/WAREHOUSE_TASK_SRV` | **KNOWN (Standard)** / **REQUIRED TO CONFIRM** | OData service path registered in `/IWFND/MAINT_SERVICE` |
| **OData Service Name** | Technical Service Name | `/SCWM/WAREHOUSE_TASK_SRV` | **KNOWN (Standard)** | Standard SAP EWM Warehouse Task Gateway Service |
| **Warehouse Number** | `LGNUM` / `WarehouseNumber` | *TBD (e.g. `W001`, `100`)* | **REQUIRED FROM SAP TEAM** | Target warehouse partition in SAP EWM |
| **Open Tasks EntitySet** | EntitySet Collection | `WarehouseTasks` (or `WarehouseTaskSet`) | **KNOWN (Standard)** | OData collection queried via `$filter=ConfirmationStatus eq 'O'` |
| **Task Confirmation Action** | FunctionImport / Entity POST | `ConfirmWarehouseTask` | **KNOWN (Standard)** | OData action to confirm pick with `ConfirmationStatus = 'C'` |
| **CSRF Token Policy** | `X-CSRF-Token` | `Fetch` on GET, pass token on POST | **KNOWN** | Automated token handshake handled by `SAPEWMAdapter.js` |

---

## Parameter Summary & Actions

1. **Known & Configured in OneScanPicker**:
   - Client Mandant (`001`)
   - Technical User (`Vegah1`)
   - Basic Auth & CSRF token negotiation engine
   - Entity mapping (`WarehouseTasks`, `ConfirmWarehouseTask`)
   - Data normalization for standard ABAP fields (`TANUM`, `MATNR`, `VLPLA`, `NLPLA`, `VLENR`, `SERNR`, `TAPOS`)

2. **Required from SAP Basis / EWM Team**:
   - Exact SAP Gateway Host IP or Hostname (reachable from BAS / Network).
   - Gateway TCP port (e.g., `8000` HTTP or `44300` HTTPS).
   - Confirmation that `/SCWM/WAREHOUSE_TASK_SRV` is activated in transaction `/IWFND/MAINT_SERVICE` and ICF node activated in `SICF`.
   - Assigned Warehouse Number (`LGNUM`).
