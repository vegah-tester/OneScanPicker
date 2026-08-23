# SAP GUI Discovery Guide: Finding Gateway & EWM Parameters

This guide explains how to discover the technical parameters of your SAP Gateway and EWM system using standard SAP GUI transactions.

> [!IMPORTANT]
> **Read-Only Discovery**:
> Follow these steps only to **inspect and read** existing system parameters. **Do not create, modify, or delete any SAP settings at this stage.**

---

## 1. Transaction `SM51` — System Identification

### Purpose
To identify the SAP Application Server instance, Hostname, and SAP System ID (SID).

### Steps
1. Enter transaction `/nSM51` in the command field.
2. Review the list of active application servers.
3. Note the following:
   - **System ID (SID)**: Displayed in the title or server name (e.g., `S4H`, `ECC`).
   - **Server Hostname**: The machine name hosting the SAP ABAP application server.

---

## 2. Transaction `SMICM` — Gateway Host & Active Ports

### Purpose
To find the active HTTP and HTTPS network ports used by SAP Gateway.

### Steps
1. Enter transaction `/nSMICM`.
2. In the top menu, navigate to: **Goto** → **Services** (or press `Shift + F1`).
3. Look at the table of active communication protocols:
   - Find protocol **`HTTP`**: Note the **Port** (e.g. `8000`, `8080`) and verify **Active = Yes**.
   - Find protocol **`HTTPS`**: Note the **Port** (e.g. `44300`, `443`) and verify **Active = Yes**.
   - Note the **Host Name** column (this is the FQDN/IP address).

---

## 3. Transaction `SICF` — ICF Service Hierarchy Activation

### Purpose
To confirm that the OData ICF runtime node is activated and discover the base URL path.

### Steps
1. Enter transaction `/nSICF`.
2. In the selection screen:
   - **Virtual Host**: `DEFAULT_HOST`
   - **Service Path**: `/sap/opu/odata/`
3. Click **Execute (F8)**.
4. Expand the hierarchy tree:
   - `/default_host/sap/opu/odata/`
5. Check if standard EWM namespaces exist:
   - `/sap/opu/odata/scwm/`
   - or `/sap/opu/odata/sap/`
6. Verify that the nodes are **Active** (black text, not grayed out).

---

## 4. Transaction `/IWFND/MAINT_SERVICE` — OData Service Discovery

### Purpose
To find the exact Technical Service Name, OData Version, and System Alias for Warehouse Tasks.

### Steps
1. Enter transaction `/n/IWFND/MAINT_SERVICE`.
2. In the **Service Catalog** table on the top half:
   - Look for services matching:
     - `*SCWM*`
     - `*WAREHOUSE*`
     - `*TASK*`
     - `*PICK*`
     - or custom `Z*` services.
3. When you select a candidate service (e.g., `/SCWM/WAREHOUSE_TASK_SRV` or `C_WAREHOUSETASK_CDS`):
   - Note the **Technical Service Name** (e.g. `/SCWM/WAREHOUSE_TASK_SRV`).
   - Note the **Service Version** (e.g. `0001`).
   - In the bottom-right panel (**System Aliases**): Note the assigned **System Alias** (e.g., `LOCAL`).
   - In the bottom-left panel (**ICF Nodes**): Note the **Technical Service Name** and confirm the ICF status is Green.

---

## 5. Transaction `/IWFND/GW_CLIENT` — Gateway Client & Metadata

### Purpose
To inspect the `$metadata` document, explore Entity Sets, and find the exact property field names.

### Steps
1. From `/IWFND/MAINT_SERVICE`, select your warehouse service and click the **SAP Gateway Client** button (or enter `/n/IWFND/GW_CLIENT`).
2. In the **Request URI** field, enter:
   ```
   /sap/opu/odata/scwm/WAREHOUSE_TASK_SRV/$metadata
   ```
   *(Replace with your technical service name from Step 4).*
3. Set **HTTP Method** to `GET`.
4. Click **Execute (F8)**.
5. In the **HTTP Response** (right panel):
   - Check the **Status Code** (must be `HTTP/1.1 200 OK`).
   - Look for `<EntitySet Name="...">`: Note all EntitySet names (e.g., `WarehouseTasks`, `WarehouseTaskSet`).
   - Look inside `<EntityType Name="...">` for property names:
     - Storage Bin (`SourceStorageBin`, `VLPLA`, `SourceBin`)
     - Material / Product (`Product`, `MATNR`, `Material`)
     - Handling Unit (`SourceHandlingUnit`, `VLENR`, `HUIDENT`)
     - Serial Number (`SerialNumber`, `SERNR`)
     - Confirmation Status (`ConfirmationStatus`, `TAPOS`)

---

## 6. Transaction `/SCWM/MON` — Warehouse Number & Open Task Verification

### Purpose
To find the active Warehouse Number (`LGNUM`) and view live open warehouse tasks for verification.

### Steps
1. Enter transaction `/n/SCWM/MON`.
2. In the initial dialog:
   - Note your **Warehouse Number** (e.g., `W001`, `100`, `EWM1`).
   - **Monitor**: `SAP` (Standard)
3. Click **Execute (F8)**.
4. In the left navigation tree, expand:
   - **Inbound / Outbound / Internal Processing** → **Warehouse Task** (or **Documents** → **Warehouse Task**).
5. Double-click **Open Warehouse Tasks**.
6. View the columns:
   - Note an open Task Number (e.g., `1000234`).
   - Note the Product/Material, Source Bin, Destination Bin, and Handling Unit.
   - This task can later be used as test data when validating the picker interface.

---

## 7. Summary of What Information to Copy

| GUI Transaction | Values to Copy |
| :--- | :--- |
| `SM51` | System ID (SID) |
| `SMICM` | Gateway Host/IP, HTTP Port, HTTPS Port |
| `SICF` | Activated Service Path |
| `/IWFND/MAINT_SERVICE` | Technical Service Name, Version, System Alias |
| `/IWFND/GW_CLIENT` | EntitySet names, Property field names, `$metadata` payload |
| `/SCWM/MON` | Warehouse Number (`LGNUM`), Sample Open Task Number |
