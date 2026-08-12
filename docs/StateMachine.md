# Warehouse Task State Machine

## Purpose
This state machine defines the allowed lifecycle of a warehouse task so that both mock mode and SAP production mode follow the same business semantics.

## States
- `CREATED` task exists but has not been validated
- `OPEN` task is available for picking or review
- `VALIDATED` scan and business rules have passed
- `CONFIRMED` task has been successfully completed
- `FAILED` task has a business failure that requires attention
- `CANCELLED` task was cancelled by a user or system action
- `ERROR` an unexpected technical failure occurred

## Suggested Transition Rules
- `CREATED` -> `OPEN`
- `OPEN` -> `VALIDATED`
- `VALIDATED` -> `CONFIRMED`
- `OPEN` -> `FAILED`
- `VALIDATED` -> `FAILED`
- `OPEN` -> `CANCELLED`
- `VALIDATED` -> `CANCELLED`
- any state -> `ERROR` on technical failure

## Transition Matrix
| From | To | Trigger |
|---|---|---|
| CREATED | OPEN | Task loaded or released |
| OPEN | VALIDATED | Scan and rule checks pass |
| VALIDATED | CONFIRMED | Confirmation succeeds |
| OPEN | FAILED | Business validation fails |
| VALIDATED | FAILED | External backend rejects the request |
| OPEN | CANCELLED | User cancels the task |
| VALIDATED | CANCELLED | User cancels before commit |
| Any | ERROR | Integration, connectivity, or unexpected runtime failure |

## State Semantics
- `CREATED` is an internal intake state.
- `OPEN` is the normal working state visible to users.
- `VALIDATED` means the task is safe to confirm.
- `CONFIRMED` is terminal for a successful pick.
- `FAILED` is terminal for a business failure unless corrected.
- `CANCELLED` is terminal for user or system cancellation.
- `ERROR` is terminal until the operator retries or the system recovers.

## Error Mapping to States
- Validation errors typically map to `FAILED`.
- SAP backend or network issues typically map to `ERROR`.
- User initiated aborts map to `CANCELLED`.

## Compatibility Rules
- Do not rename existing states once the UI starts depending on them.
- New states should only be added if the current set cannot express a new business outcome.
- State meaning must remain the same in mock and production modes.