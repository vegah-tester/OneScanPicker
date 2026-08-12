# SAP EWM Integration Contract Specification

## Overview
This document specifies the technical integration contract between OneScanPicker (`EWMConnectorService`) and the external SAP EWM system via SAP BTP Destination Service and Cloud Connector.

---

## Architectural Data Flow

```
[ SAPUI5 Frontend ]
        │ (OData V4 HTTP)
        ▼
[ CAP Service (srv/service.js) ]
        │
        ▼
[ EWMConnectorService ]
   ├── ONE_SCAN_MODE === 'mock'       ──> [ MockEWMAdapter ] (SQLite db.sqlite)
   └── ONE_SCAN_MODE === 'production' ──> [ SAPEWMAdapter ] (SAP BTP Destination)
                                                │
                                                ▼
                                    [ SAP BTP Destination Service ]
                                                │
                                                ▼
                                    [ SAP Connectivity / Cloud Connector ]
                                                │
                                                ▼
                                    [ On-Premise SAP EWM / SAP Gateway ]
```

---

## Environment & BTP Configuration Parameters

| Parameter | Environment Variable | Default Value | Description |
| :--- | :--- | :--- | :--- |
| **Runtime Mode** | `ONE_SCAN_MODE` | `mock` | `mock` for local SQLite development, `production` for BTP Destination routing. |
| **Destination Name** | `ONE_SCAN_DESTINATION_NAME` | `SAP_EWM_DESTINATION` | SAP BTP Destination Service instance name. |
| **SAP Client** | `SAP_EWM_CLIENT` | `100` | Target SAP Client mandant number. |
| **SAP Base URL** | `SAP_EWM_BASE_URL` | `https://sap-ewm.btp.internal/odata/v2/` | Base URL for SAP EWM OData V2 service endpoints. |

---

## Entity Field Mapping (OneScanPicker vs SAP EWM)

| OneScanPicker CDS Entity Field | SAP EWM OData Field (V2/V4) | Field Description | Status |
| :--- | :--- | :--- | :--- |
| `taskNumber` | `WarehouseTask` / `TANUM` | Unique Warehouse Task Document Number | **Confirmed** |
| `material` | `Product` / `MATNR` | Material Master SKU Identifier | **Confirmed** |
| `sourceBin` | `SourceStorageBin` / `VLPLA` | Source Storage Bin Coordinate | **Confirmed** |
| `destinationBin` | `DestinationStorageBin` / `NLPLA` | Destination Storage Bin Coordinate | **Confirmed** |
| `handlingUnit` | `SourceHandlingUnit` / `VLENR` | Handling Unit (HU) Container ID | **Confirmed** |
| `serialNumber` | `SerialNumber` / `SERNR` | Individual Equipment Serial Number | **Confirmed** |
| `status` | `ConfirmationStatus` / `TAPOS` | `O` (Open) / `C` (Confirmed) | **Confirmed** |

---

## Expected SAP Endpoints & API Signatures

> [!NOTE]
> On-premise SAP EWM OData endpoints below are structured around standard SAP EWM service `/SCWM/WAREHOUSE_TASK_SRV`. Concrete endpoint path URIs are marked **TBD / To Be Confirmed** until backend connection verification.

### 1. GET Open Warehouse Tasks
- **SAP Endpoint**: `GET /WarehouseTasks?$filter=ConfirmationStatus eq 'O'` *(TBD / To Be Confirmed)*
- **HTTP Method**: `GET`
- **Headers**:
  ```http
  Accept: application/json
  sap-client: 100
  ```
- **Response Structure**:
  ```json
  {
    "d": {
      "results": [
        {
          "WarehouseTask": "WT1001",
          "Product": "MAT-1001",
          "SourceStorageBin": "BIN-A01",
          "DestinationStorageBin": "BIN-B01",
          "SourceHandlingUnit": "HU-9001",
          "SerialNumber": "SER-1001",
          "ConfirmationStatus": "O"
        }
      ]
    }
  }
  ```

### 2. POST Warehouse Task Confirmation
- **SAP Endpoint**: `POST /ConfirmWarehouseTask` *(TBD / To Be Confirmed)*
- **HTTP Method**: `POST`
- **Request Body**:
  ```json
  {
    "WarehouseTask": "WT1001",
    "ConfirmationStatus": "C"
  }
  ```
- **Response Structure**:
  ```json
  {
    "d": {
      "WarehouseTask": "WT1001",
      "ConfirmationStatus": "C",
      "Message": "Warehouse Task WT1001 confirmed successfully"
    }
  }
  ```

---

## SAP Error Mapping

| SAP Gateway / HTTP Error | Internal Error Code | User-Facing Message | HTTP Status |
| :--- | :--- | :--- | :--- |
| `401 Unauthorized` | `SAP_AUTHENTICATION_ERROR` | BTP Destination authentication failed | `502` |
| `404 Not Found` | `TASK_NOT_FOUND` | Requested warehouse task not found in SAP EWM | `404` |
| `409 Conflict` | `TASK_ALREADY_CONFIRMED` | Task has already been confirmed in SAP EWM | `409` |
| `500 Backend Error` | `SAP_BACKEND_FAILURE` | SAP EWM returned a backend application error | `502` |
| `503 Gateway Timeout` | `CONNECTIVITY_TIMEOUT` | Cloud Connector / SAP Gateway connection timed out | `504` |
