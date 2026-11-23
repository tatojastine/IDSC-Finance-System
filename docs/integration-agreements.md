# Shared gateway agreements

No partner group has agreed to a live Finance integration yet. The Finance partner routes in `backend/openapi.yaml` give teams a starting point for discussion. Existing tests exercise those routes locally with fictional data.

Start with the Registrar team. A small candidate is for Finance to request a student's enrollment for one academic term through the class gateway. Confirm the flow with the partner team before choosing a path, response schema, or credentials.

| Record before implementation | Agreed value |
|---|---|
| Date and both groups' contacts | Pending |
| Business action, caller, and source of truth | Pending |
| Shared gateway URL, method, and path | Pending |
| Request, response, and error schemas | Pending |
| Authentication method and credential owner | Pending |
| Timeout, user feedback, and retry behavior | Pending |
| Public demo or staging environments | Pending |
| Successful test and offline test evidence | Pending |

Record the agreed behavior and safe test identifiers here. Store credentials in the hosting environment. For an enrollment lookup, the proposed offline behavior is to show that Registrar is temporarily unavailable, preserve Finance records and allow a retry. Confirm that behavior and demonstrate both outcomes before marking the integration complete.
