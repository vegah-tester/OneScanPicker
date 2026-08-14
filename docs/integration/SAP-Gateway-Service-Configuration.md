# SAP Gateway & OData Service Configuration for EWM

This guide documents the SAP ABAP NetWeaver / SAP Gateway steps to activate and verify the SAP EWM picking service endpoints.

---

## 1. Gateway Service Activation (`/IWFND/MAINT_SERVICE`)

1. Log into your SAP ECC / EWM system using SAP GUI.
2. Enter transaction code `/IWFND/MAINT_SERVICE`.
3. Click **Add Service**:
   - **System Alias**: `LOCAL` (or your EWM backend system alias).
   - **Technical Service Name**: `/SCWM/WAREHOUSE_TASK_SRV` (or custom service `Z_ONESCAN_SRV`).
4. Click **Get Services**.
5. Select the service and click **Add Selected Services**.
6. Set Package Assignment (e.g. `$TMP` for local testing or custom development package) and click **Continue** (Enter).
7. Verify that the service appears in the active service catalog with a **Green** status light.

---

## 2. ICF Node Activation (`SICF`)

1. Enter transaction code `SICF`.
2. Execute with Hierarchy Type `SERVICE`.
3. Navigate to path:
   ```
   default_host > sap > opu > odata > scwm > WAREHOUSE_TASK_SRV
   ```
4. Right-click the service node and choose **Activate Service**.
5. Test the service by right-clicking and selecting **Test Service** (opens browser at Gateway service root).

---

## 3. Required User Authorizations

The technical user configured in `.env` / BTP Destination requires the following SAP authorization objects:

| Authorization Object | Field | Recommended Value | Description |
| :--- | :--- | :--- | :--- |
| `S_SERVICE` | `SRV_NAME` | `*` | SAP Gateway OData runtime access |
| `S_RFC` | `RFC_NAME` | `/SCWM/*`, `RFC_METADATA` | RFC function execution |
| `/SCWM/WT` | `ACTVT` | `03` (Display), `02` (Confirm) | Warehouse Task operations in EWM |
| `/SCWM/LGNUM` | `LGNUM` | `*` (or your Warehouse Number) | Warehouse number authorization |

---

## 4. Testing Endpoints via SAP Gateway Client (`/IWFND/GW_CLIENT`)

1. In transaction `/IWFND/MAINT_SERVICE`, select `/SCWM/WAREHOUSE_TASK_SRV`.
2. Click **SAP Gateway Client** (or transaction `/IWFND/GW_CLIENT`).
3. Execute GET request:
   ```http
   GET /sap/opu/odata/scwm/WAREHOUSE_TASK_SRV/WarehouseTasks?$filter=ConfirmationStatus eq 'O'
   ```
4. Execute CSRF Token Fetch:
   ```http
   GET /sap/opu/odata/scwm/WAREHOUSE_TASK_SRV/
   Header: X-CSRF-Token: Fetch
   ```
5. Confirm HTTP response status `200 OK` is returned with JSON payload.
