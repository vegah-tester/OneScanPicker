# Architecture Decision Record

## Decision Summary
OneScan will use SAP CAP for backend business logic, SAPUI5 for the frontend, SAP BTP Destination Service and Connectivity Service for controlled integration, and Cloud Connector for secure access to the on-premise SAP EWM landscape.

## Why CAP
SAP CAP provides a structured service layer, OData-friendly contracts, and a good fit for enterprise business logic in Node.js.

### Benefits
- clear separation of service and data model
- strong alignment with OData and SAP BTP patterns
- supports local development with SQLite
- allows mock and production modes behind the same API contract

## Why SAPUI5
SAPUI5 is the natural enterprise UI framework for SAP BTP applications and gives the team a stable way to build task, scan, and diagnostics screens.

### Benefits
- strong fit for SAP workflows
- enterprise UI consistency
- predictable integration with OData services
- supports a clean separation from backend concerns

## Why Destination Service
Destination Service centralizes target resolution so the backend never hardcodes on-premise endpoints.

### Benefits
- environment-specific routing without code changes
- cleaner promotion from mock to production
- support for secure external system configuration

## Why Connectivity Service and Cloud Connector
Connectivity Service and Cloud Connector provide the secure bridge to the internal SAP EWM system without exposing that system directly to the internet.

### Benefits
- secure tunnel to on-premise resources
- reduced network exposure
- consistent SAP BTP integration pattern

## Why SAP Gateway
SAP Gateway is used as the OData-facing integration surface when SAP EWM is exposed through standard SAP service patterns.

### Benefits
- standard SAP service access model
- predictable OData contracts
- compatible with enterprise SAP backend landscapes

## Separation of Concerns
### UI Layer
Responsible only for rendering, navigation, and user interactions.

### Business Logic Layer
Responsible for validation, state transitions, confirmation rules, and orchestration.

### Integration Layer
Responsible for destination resolution, backend communication, and response mapping.

### SAP Backend Layer
Responsible for actual warehouse task execution and authoritative business outcomes.

## Architectural Principles
- The UI must not know whether it is in mock or production mode.
- The business contract must stay stable across environments.
- Integration concerns must be isolated from controllers and view logic.
- Mock implementations must follow the same shapes and status semantics as production.

## Compatibility Policy
- Additive changes are allowed.
- Breaking field renames are not allowed without a versioned contract.
- New business states or errors must not change the meaning of existing ones.
- Local mock behavior must remain semantically aligned with SAP production behavior.