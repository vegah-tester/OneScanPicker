# OneScanPicker Agent Instructions

## Purpose
This repository is for OneScan Intelligent Picking & Verification, built around SAP CAP (Node.js) and SAPUI5/Fiori.

## Core Rules
- Keep the UI independent from SAP EWM integration details.
- Keep controllers thin; put business logic in services and handlers.
- Use local SQLite and mock services for development first.
- Switch to SAP BTP Destination Service and Cloud Connector only through a dedicated connector layer.
- Prefer small, focused changes over large rewrites.

## Expected Project Shape
- `app/` for SAPUI5 frontend
- `db/` for CDS data model and seed data
- `srv/` for CAP service definitions and handlers
- `handlers/` for business flows
- `services/` for reusable backend services
- `utils/` for shared helpers
- `mock/` for local mock data and adapters
- `test/` for automated tests

## Working Style
- Start with the nearest concrete file or behavior.
- Create or update docs before implementation when the structure is still being established.
- Preserve the architecture brief unless a change is explicitly requested.

## Validation
- Prefer simple, local checks after each code change.
- If a module does not exist yet, add the smallest useful scaffold and document the open decisions.