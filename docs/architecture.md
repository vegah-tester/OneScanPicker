# Architecture Overview

## Guiding Principle
The UI must never know whether the backend is running in mock mode or production mode. That boundary belongs to the backend connector layer.

## Proposed Layers
1. SAPUI5 frontend for user interaction.
2. CAP backend for application logic and OData services.
3. Service layer for picking, validation, scanning, and history logic.
4. Connector layer for destination resolution and SAP EWM communication.
5. Data layer using SQLite locally and HANA Cloud in production.

## Service Responsibilities
- Scan service: parse and normalize scan payloads.
- Validation service: validate bin, material, HU, serial, and WT data.
- Warehouse task service: query, confirm, cancel, and track warehouse tasks.
- EWM connector service: call EWM through destination-based communication.
- Destination service: resolve local mock or BTP target configuration.
- Logger service: provide consistent structured logging.

## Frontend Pages
- Dashboard
- Scan Page
- Warehouse Task Details
- Pick History
- System Diagnostics

## Runtime Modes
- Mock mode for local development.
- Production mode for BTP deployment and on-premise EWM connectivity.

## Open Questions
- Should the first implementation target a pure mock backend, or should CAP service contracts be created before any UI work?
- Should the initial UI be SAPUI5 freestyle only, or should any pages use Fiori elements where it helps accelerate delivery?
- Should we include authentication scaffolding in the first pass, or defer it until the business flow is stable?