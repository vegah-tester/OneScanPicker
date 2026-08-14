# SAP ECC to EWM End-to-End Business & Integration Flow

This document details the complete end-to-end business lifecycle connecting **SAP ECC (ERP)**, **SAP EWM (Decentralized / Embedded)**, and **OneScanPicker (SAP BTP & Mobile Picker)**.

---

## 1. End-to-End Business Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: ORDER ENTRY & DELIVERY IN SAP ECC                                       │
│ 1. Sales Order (VA01) or Stock Transport Order (ME21N) is created.               │
│ 2. Outbound Delivery (VL01N / VL10B) is generated.                               │
│ 3. ECC replicates the Outbound Delivery to EWM via qRFC / CIF (Queue SMQ1/SMQ2). │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ qRFC (Outbound Delivery Notification)
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: WAREHOUSE TASK GENERATION IN SAP EWM                                    │
│ 1. EWM creates Outbound Delivery Order (ODO) in transaction /SCWM/PRDO.          │
│ 2. Wave creation & release generates Warehouse Tasks (WTs) for picking.          │
│ 3. WTs are stored in table /SCWM/ORDIM_O with Source Bin, HU, Material, Qty.     │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ OData V2 / V4 via SAP Gateway
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: ONESCAN INTELLIGENT PICKING & VERIFICATION                              │
│ 1. Picker opens OneScanPicker on mobile / handheld / RF terminal.                │
│ 2. App fetches open WTs via SAPEWMAdapter (/WarehouseTasks?$filter=Status eq 'O')│
│ 3. Picker performs 1-Scan (BIN|MATERIAL|SERIAL|HU) at source bin.                │
│ 4. ValidationService checks barcode integrity against EWM Task requirements.     │
│ 5. Picker confirms pick -> OneScanPicker dispatches POST /ConfirmWarehouseTask.  │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ OData Confirmation
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: EWM GOODS ISSUE & ECC REPLICATION                                       │
│ 1. EWM updates WT status to Confirmed (table /SCWM/ORDIM_C).                     │
│ 2. Packing & Staging completed; Goods Issue (GI) is posted in /SCWM/PRDO.        │
│ 3. EWM sends Goods Issue confirmation back to ECC via qRFC.                      │
│ 4. ECC updates Delivery status to Goods Issued (MVT 601) and triggers Billing.   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Key SAP Data Tables & Transactions

| Component | Business Entity | SAP Transaction | Database Table |
| :--- | :--- | :--- | :--- |
| **SAP ECC** | Sales Order | `VA01` / `VA02` / `VA03` | `VBAK`, `VBAP` |
| **SAP ECC** | Outbound Delivery | `VL01N` / `VL02N` / `VL03N` | `LIKP`, `LIPS`, `VBUK`, `VBUP` |
| **SAP ECC** | qRFC Monitor (Outbound/Inbound) | `SMQ1` / `SMQ2` | `TRFCQOUT`, `TRFCQIN` |
| **SAP EWM** | Outbound Delivery Order | `/SCWM/PRDO` | `/SCDL/DB_PROCH_O`, `/SCDL/DB_PROCI_O` |
| **SAP EWM** | Open Warehouse Tasks | `/SCWM/MON` (Node: Open WTs) | `/SCWM/ORDIM_O` |
| **SAP EWM** | Confirmed Warehouse Tasks | `/SCWM/MON` (Node: Confirmed WTs) | `/SCWM/ORDIM_C` |
| **SAP EWM** | Storage Bins & Handling Units | `/SCWM/LS03N`, `/SCWM/MON` | `/SCWM/LAGP`, `/SCWM/HUHDR` |

---

## 3. OneScanPicker Integration Touchpoints

### Step 1: Open Tasks Retrieval
- **HTTP Request**: `GET /WarehouseTasks?$filter=ConfirmationStatus eq 'O'`
- **Internal Adapter**: `services/adapters/SAPEWMAdapter.js` -> `getOpenWarehouseTasks()`
- **Result**: Normalized array of open tasks presented in Dashboard and Task List.

### Step 2: Barcode Scanning & Multi-Field Parsing
- **Scan Payload Structure**: `BIN-A01|MAT-1001|SER-1001|HU-9001`
- **Validation**:
  - Material SKU matches WT expected product (`MATNR`).
  - Source storage bin matches WT location (`VLPLA`).
  - Handling unit matches container ID (`VLENR`).
  - Serial number matches individual unit (`SERNR`).

### Step 3: Pick Confirmation
- **HTTP Request**: `POST /ConfirmWarehouseTask` with `X-CSRF-Token` and session cookies.
- **Payload**:
  ```json
  {
    "WarehouseTask": "WT1001",
    "ConfirmationStatus": "C"
  }
  ```
- **SAP Function Module executed behind the Gateway**: `/SCWM/TO_CONFIRM` or `/SCWM/WT_CONFIRMATION_CREATE`.

---

## 4. Error Handling & Troubleshooting

1. **Queue Stuck in ECC/EWM (`SMQ1`/`SMQ2`)**:
   - Check transaction `SMQ1` in ECC or `SMQ2` in EWM.
   - Unlock blocked queues with `LUW` analysis if master data (e.g. material/batch/plant) is missing in EWM.
2. **Missing Warehouse Task**:
   - Verify wave release in `/SCWM/WAVE` or manual WT creation in `/SCWM/PRDO` -> *Follow-On Functions* -> *Warehouse Task*.
3. **Gateway Authorization Error (`401` / `403`)**:
   - Ensure the technical user has authorizations for authorization object `/SCWM/WT` and Gateway service `/SCWM/WAREHOUSE_TASK_SRV`.
