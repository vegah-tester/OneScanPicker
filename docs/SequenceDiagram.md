# Sequence Diagrams

## Local Mock Flow
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Warehouse Operator
    participant UI as SAPUI5 UI
    participant CAP as CAP Service
    participant VAL as Validation Service
    participant DB as SQLite / Mock Data

    Operator->>UI: Open scan screen and submit scan payload
    UI->>CAP: POST /scan
    CAP->>VAL: Parse and normalize payload
    VAL->>DB: Read seeded task and scan reference data
    DB-->>VAL: Matching mock task data
    VAL-->>CAP: Parsed scan result
    CAP-->>UI: 200 OK with normalized payload
    Operator->>UI: Confirm pick
    UI->>CAP: POST /confirm
    CAP->>DB: Persist confirmation state locally
    DB-->>CAP: Updated task state
    CAP-->>UI: 200 OK confirmation result
```

## SAP Production Flow
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Warehouse Operator
    participant UI as SAPUI5 UI
    participant CAP as CAP Service
    participant DST as Destination Service
    participant CONN as Connectivity Service / Cloud Connector
    participant EWM as SAP EWM

    Operator->>UI: Submit scan payload
    UI->>CAP: POST /scan
    CAP->>DST: Resolve target destination
    DST-->>CAP: Destination metadata
    CAP->>CONN: Open secure tunnel
    CONN-->>CAP: Connected route
    CAP->>EWM: Send normalized scan request
    EWM-->>CAP: Scan validation context
    CAP-->>UI: Normalized validation response
    Operator->>UI: Confirm pick
    UI->>CAP: POST /confirm
    CAP->>DST: Resolve confirmation destination
    CAP->>CONN: Route confirmation request
    CAP->>EWM: Send confirmation payload
    EWM-->>CAP: Confirmation result
    CAP-->>UI: 200 OK final state
```

## Warehouse Task Confirmation Flow
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Warehouse Operator
    participant UI as SAPUI5 UI
    participant CAP as CAP Service
    participant TASK as Warehouse Task Service
    participant VAL as Validation Service
    participant INT as EWM Connector Service
    participant BACK as SAP Backend / Mock Backend

    Operator->>UI: Review task details
    UI->>CAP: GET /tasks/{id}
    CAP->>TASK: Load task details
    TASK-->>CAP: Task payload
    CAP-->>UI: Task details response
    Operator->>UI: Confirm task
    UI->>CAP: POST /confirm
    CAP->>VAL: Validate task state and business fields
    VAL-->>CAP: Validation status
    CAP->>INT: Build confirmation command
    INT->>BACK: Send confirmation request
    BACK-->>INT: Success or failure
    INT-->>CAP: Integration result
    CAP-->>UI: Final confirmation response
```

## Diagram Rules
- UI must never call SAP EWM directly.
- CAP remains the single entry point for the frontend.
- Mock and production flows must share the same business contract.