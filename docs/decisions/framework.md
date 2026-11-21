\# ADR-001: Backend Framework



\## Status



Accepted



\## Context



The Finance Module needs a REST API for the College Management System. The backend must support API endpoints, JSON responses, Swagger/OpenAPI documentation, mock data, and a layered structure using routes, services, and data.



\## Decision



We chose \*\*Node.js with Express.js\*\* as the backend framework.



Express.js was selected because it is lightweight, easy to use, and supports REST API development. It also works well with middleware, Swagger/OpenAPI documentation, and the required layered backend structure.



\## Alternatives Considered



Other backend frameworks could be used, but Node.js with Express.js was selected because it is suitable for the project requirements and is familiar to the development team.



\## Consequences



Using Node.js and Express.js allows the Finance API to be developed and tested quickly. The backend can use mock data for the midterm project and can be connected to a database in a later phase.



The project uses separate routes, services, and data files to make the backend easier to organize and maintain.



\## Date



September 30, 2026



