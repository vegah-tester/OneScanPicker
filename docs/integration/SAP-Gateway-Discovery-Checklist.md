# SAP Gateway & EWM Discovery Checklist

This document is the discovery template to collect exact configuration parameters from your SAP system before enabling direct SAP Gateway integration in **OneScanPicker**.

> [!CAUTION]
> **Security Rule**:
> - **DO NOT enter passwords, API secrets, private keys, or credentials in this file or any Git-tracked file.**
> - Passwords belong solely in your local `.env` file or in SAP BTP Destination Service.

---

## A. SAP System Identification

| Parameter | Required Value / Format | Your SAP Value | Status |
| :--- | :--- | :--- | :--- |
| **System Type** | ECC 6.0 / S/4HANA On-Premise / S/4HANA Cloud / SAP EWM Standalone | `[Enter System Type]` | **REQUIRED** |
| **System ID (SID)** | 3-character SAP SID (e.g., `S4H`, `ECC`, `EWM`) | `[Enter SID]` | **REQUIRED** |
| **SAP Mandant / Client** | 3-digit client number (e.g., `001`, `100`, `200`) | `001` | **KNOWN** |
| **SAP Release / Version** | e.g., `S/4HANA 2023`, `EWM 9.5`, `ECC 6.0 EHP8` | `[Enter SAP Release]` | **REQUIRED** |
| **EWM Deployment Model** | `Embedded EWM` (inside S/4) OR `Decentralized EWM` | `[Embedded / Decentralized]` | **REQUIRED** |

---

## B. SAP Gateway Network & Communication

| Parameter | Required Value / Format | Your SAP Value | Status |
| :--- | :--- | :--- | :--- |
| **SAP Gateway Host** | FQDN or IP reachable from server/BAS (e.g. `sap-gw.corp.internal` or `192.168.x.x`) | `[Enter Host / IP]` | **REQUIRED** |
| **Gateway HTTP Port** | HTTP port from `SMICM` (e.g. `8000`, `8080`) | `[Enter HTTP Port]` | **REQUIRED** |
| **Gateway HTTPS Port** | HTTPS port from `SMICM` (e.g. `44300`, `443`) | `[Enter HTTPS Port]` | **REQUIRED** |
| **Protocol** | `HTTP` or `HTTPS` | `[HTTP / HTTPS]` | **REQUIRED** |
| **SAP System Alias** | System alias mapped in `/IWFND/MAINT_SERVICE` (e.g. `LOCAL`, `ERP_PGW`, `EWM_CLNT001`) | `[Enter System Alias]` | **REQUIRED** |

---

## C. OData Service Definition

| Parameter | Required Value / Format | Your SAP Value | Status |
| :--- | :--- | :--- | :--- |
| **Technical Service Name** | Registered in `/IWFND/MAINT_SERVICE` (e.g., `/SCWM/WAREHOUSE_TASK_SRV`, `Z_EWM_PICKING_SRV`) | `[Enter Technical Service Name]` | **REQUIRED** |
| **Service Version** | `0001` (default) or custom version | `0001` | **REQUIRED TO CONFIRM** |
| **OData Protocol Version** | `OData V2` or `OData V4` | `[OData V2 / V4]` | **REQUIRED** |
| **Service Base URL** | e.g. `/sap/opu/odata/scwm/WAREHOUSE_TASK_SRV/` | `[Enter Service URL]` | **REQUIRED** |
| **$metadata URL** | e.g. `http(s)://<host>:<port>/sap/opu/odata/<service>/$metadata` | `[Enter $metadata URL]` | **REQUIRED** |
| **Open Tasks EntitySet** | Collection name for open tasks (e.g., `WarehouseTasks`, `WarehouseTaskSet`) | `[Enter EntitySet Name]` | **REQUIRED** |
| **Pick Confirmation Action** | FunctionImport or POST entity (e.g., `ConfirmWarehouseTask`, `ConfirmTaskSet`) | `[Enter Action Name]` | **REQUIRED** |

---

## D. Warehouse Task Data Model & Field Mapping

| Business Attribute | Expected ABAP / OData Field Name | Field in Your SAP Service | Status |
| :--- | :--- | :--- | :--- |
| **Warehouse Number** | `LGNUM` / `WarehouseNumber` | `[e.g., W001 / 100]` | **REQUIRED** |
| **Warehouse Task Number** | `TANUM` / `WarehouseTask` / `WT_NUM` | `[Enter field name]` | **REQUIRED** |
| **Warehouse Order (if used)**| `WHO` / `WarehouseOrder` / `WO_NUM` | `[Enter field name if used]`| **OPTIONAL** |
| **Product / Material** | `MATNR` / `Product` / `Material` | `[Enter field name]` | **REQUIRED** |
| **Source Storage Bin** | `VLPLA` / `SourceStorageBin` / `SourceBin` | `[Enter field name]` | **REQUIRED** |
| **Destination Storage Bin**| `NLPLA` / `DestinationStorageBin` / `DestBin`| `[Enter field name]` | **REQUIRED** |
| **Handling Unit (HU)** | `VLENR` / `SourceHandlingUnit` / `HUIDENT` | `[Enter field name]` | **REQUIRED** |
| **Serial Number** | `SERNR` / `SerialNumber` | `[Enter field name]` | **REQUIRED** |
| **Target / Pick Quantity** | `VSOLA` / `Quantity` / `TargetQuantity` | `[Enter field name]` | **REQUIRED** |
| **Unit of Measure (UoM)** | `MEINS` / `UoM` / `BaseUnit` | `[Enter field name]` | **REQUIRED** |
| **Confirmation Status** | `TAPOS` / `ConfirmationStatus` (`O`=Open, `C`=Confirmed) | `[Enter field name]` | **REQUIRED** |

---

## E. Authentication Specification

| Parameter | Allowed Value | Your Selection |
| :--- | :--- | :--- |
| **Authentication Type** | `BasicAuthentication` (Dialog/RFC User) OR `X.509 Certificate` OR `OAuth2SAMLBearerAssertion` | `[Select Auth Type]` |
| **Technical Username** | Dialog or System technical username | `Vegah1` |
| **User Role / Authorizations** | Authorizations for ICF nodes, `/IWFND/*`, and SCWM warehouse activity | `[Assigned in PFCG]` |

> [!NOTE]
> Do **NOT** provide or document the password here.
