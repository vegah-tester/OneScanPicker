# Copilot Instructions for OneScanPicker

This repository builds an enterprise SAP BTP picking app using SAP CAP and SAPUI5.

## Architecture Summary
- Backend: SAP CAP (Node.js), CDS, SQLite for local development, HANA Cloud for production.
- Frontend: SAPUI5 Freestyle with MVC, responsive Fiori Horizon theme, OData V4.
- Integration: all SAP EWM communication must go through a dedicated connector/service layer.

## Development Modes
- Mock mode: local SQLite plus mock EWM responses.
- Production mode: SAP BTP Destination Service plus Cloud Connector to on-premise SAP EWM.

## Implementation Rules
- Do not place SAP integration logic inside controllers.
- Keep business flows in services and handlers.
- Use environment-based configuration for local vs. BTP runtime.
- Include validation, logging, and error handling in all service entry points.

## UI Pages
- Dashboard
- Scan Page
- Warehouse Task Details
- Pick History
- System/Connection Diagnostics

## Backend Modules
- ScanService
- ValidationService
- WarehouseTaskService
- EWMConnectorService
- DestinationService
- LoggerService

## Output Expectations
- Favor maintainable structure and clear separation of concerns.
- Document any open decision that affects runtime, deployment, or integration.