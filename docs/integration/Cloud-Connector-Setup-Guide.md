# SAP Cloud Connector (SCC) Setup & Configuration Guide

This guide walks through configuring **SAP Cloud Connector** on your Windows RDP server to bridge communication between SAP Business Technology Platform (BTP) and your on-premise SAP ECC / EWM system.

---

## 1. Accessing SAP Cloud Connector Administration

1. On your Windows RDP server, open a web browser.
2. Navigate to:
   ```
   https://localhost:8443
   ```
3. Default login credentials (if freshly installed):
   - **User**: `Administrator`
   - **Password**: `manage` *(or your custom admin password)*

---

## 2. Step 1: Add Subaccount Link to SAP BTP

1. In the SCC left navigation bar, click **Add Subaccount**.
2. Fill in your BTP subaccount details:
   - **Region**: Select your BTP region (e.g. `Europe (Frankfurt) - cf-eu10` or `US East (VA) - cf-us10`).
   - **Subaccount ID**: Subaccount GUID from BTP Cockpit overview (e.g. `12345678-abcd-1234-abcd-1234567890ab`).
   - **Subaccount User**: Your SAP BTP user email / S-User.
   - **Password**: Your SAP BTP user password or API key.
   - **Location ID**: (Optional, e.g. `RDP_SERVER_LOCATION` or leave empty for default).
3. Click **Save**. Verify that the Subaccount status indicator turns **Green** (Connected).

---

## 3. Step 2: Configure Cloud To On-Premise Mapping

1. Under the newly added Subaccount, navigate to **Cloud To On-Premise**.
2. Click the **+** (Add) icon under **Mapping Virtual To Internal System**:
   - **Back-end Type**: `ABAP System` (or `Non-SAP System` for general HTTP).
   - **Protocol**: `HTTP` or `HTTPS` (depending on your SAP Gateway configuration).
   - **Internal Host**: Enter the internal IP or hostname of your SAP EWM system (e.g. `192.168.1.100` or `sapewm.corp.local`).
   - **Internal Port**: Internal Gateway port (e.g. `8000` for HTTP or `44300` for HTTPS).
   - **Virtual Host**: A virtual DNS name visible only to BTP (e.g. `virtual-sap-ewm`).
   - **Virtual Port**: Virtual port (e.g. `44300` or `8000`).
   - **Principal Type**: `None` (for Basic Auth) or `X.509 Certificate` (for Principal Propagation).
3. Click **Finish**.

---

## 4. Step 3: Whitelist SAP Gateway Resource Paths

1. In the **Accessible Resources** section below the virtual mapping, click **+** (Add):
   - **URL Path**: `/sap/opu/odata/`
   - **Access Policy**: `Path and all sub-paths`
2. Add additional common paths as needed:
   - **URL Path**: `/sap/bc/`
   - **Access Policy**: `Path and all sub-paths`
3. Verify that the status for all resources is **Green** (Active).

---

## 5. Step 4: Configure SAP BTP Destination Service

1. Open **SAP BTP Cockpit** -> Your Subaccount -> **Connectivity** -> **Destinations**.
2. Click **New Destination** and configure:
   - **Name**: `SAP_EWM_DESTINATION`
   - **Type**: `HTTP`
   - **URL**: `http://virtual-sap-ewm:44300/sap/opu/odata/scwm/WAREHOUSE_TASK_SRV`
   - **Proxy Type**: `OnPremise`
   - **Authentication**: `BasicAuthentication`
   - **User**: `<Your SAP RFC/Dialog User>`
   - **Password**: `<Your SAP Password>`
3. Add Additional Properties:
   - `sap-client`: `100` (or your SAP Mandant)
   - `WebIDEEnabled`: `true`
   - `HTML5.DynamicDestination`: `true`
4. Click **Check Connection**. The response must show:
   ```
   Connection to "SAP_EWM_DESTINATION" established. Response code: 200 OK
   ```

---

## 6. Step 5: Test from OneScanPicker

On your RDP server, run:
```bash
node scripts/test-sap-connection.js
```
The script will confirm reachability, CSRF negotiation, and open task retrieval!
