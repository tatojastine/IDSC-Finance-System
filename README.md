# IDSC Finance System

The *IDSC Finance System* is the Finance Module of the College Management System developed for the *System Integration and Architecture (Java)* course.

The system manages student financial information including assessments, payments, receipts, balances, and collection reports. The module is designed to communicate with the other modules of the College Management System through REST APIs.

## Project Overview

The class project consists of eight modules:

1. Landing Page
2. Library
3. Student Portal
4. *Finance*
5. Faculty
6. Clinic
7. Registrar
8. Inventory

This repository contains the *Finance Module*.

---

# Technology Stack

## Frontend

* Figma
* Class Shared Design System
* High-Fidelity Prototype
* Desktop and Mobile layouts
* Clickable prototype flows

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Swagger / OpenAPI
* CORS
* REST API

## Documentation

* Markdown
* OpenAPI Specification
* Architecture Decision Record (ADR)
* System architecture documentation
* Data model documentation
* Integration documentation
* Design system documentation

---

# System Structure

text
IDSC-Finance-System/
│
├── backend/
│   ├── models/
│   │   ├── Assessment.js
│   │   ├── Payment.js
│   │   ├── Receipt.js
│   │   └── Student.js
│   │
│   ├── routes/
│   │   ├── assessments.js
│   │   ├── finance.js
│   │   ├── payments.js
│   │   ├── receipts.js
│   │   ├── reports.js
│   │   └── students.js
│   │
│   ├── db.js
│   ├── openapi.yaml
│   ├── server.js
│   └── package.json
│
├── docs/
│   └── decisions/
│       └── 001-backend-framework.md
│
└── README.md

---

# Frontend

The Finance Module frontend is designed as a *high-fidelity Figma prototype* using the class-approved shared design system.

The prototype represents the main Finance workflows and uses realistic financial information that matches the backend API.

## Frontend Features

* Finance Dashboard
* Student Financial Account
* Assessment Details
* Payment Management
* Payment History
* Receipt Information
* Outstanding Balance
* Collection Information
* Student Search
* Form Validation
* Success Messages
* Error States
* Empty States
* Confirmation Dialogs

## Frontend Requirements

The prototype follows the shared College Management System design system.

It includes:

* Shared navigation
* Shared colors
* Shared typography
* Shared buttons
* Shared forms
* Shared tables
* Shared cards
* Shared status badges
* Shared spacing and layout
* Desktop layouts
* Mobile layouts

The frontend screens are designed to match the data and endpoints provided by the Finance API.

---

# Backend

The Finance backend is a REST API built using *Node.js and Express.js*.

## Backend Features

* Student management
* Assessment management
* Payment management
* Receipt management
* Student financial accounts
* Collection reports
* Outstanding balance reports
* API health check
* Error handling
* Swagger/OpenAPI documentation
* MongoDB database connection

## API Base URL

text
http://localhost:5000/api/v1

## Swagger Documentation

Swagger UI is available at:

text
http://localhost:5000/docs

Swagger allows developers to view and test the API using *Try it out*.

---

# API Endpoints

## Health

GET /api/v1/health

Example response:

{
  "status": "ok"
}

## Students

GET    /api/v1/students
GET    /api/v1/students/{id}
POST   /api/v1/students
PUT    /api/v1/students/{id}
DELETE /api/v1/students/{id}

## Assessments

GET    /api/v1/assessments
GET    /api/v1/assessments/student/{studentId}
GET    /api/v1/assessments/{id}
POST   /api/v1/assessments
PUT    /api/v1/assessments/{id}
DELETE /api/v1/assessments/{id}

## Payments

GET    /api/v1/payments
GET    /api/v1/payments/student/{studentId}
GET    /api/v1/payments/{id}
POST   /api/v1/payments
PUT    /api/v1/payments/{id}
DELETE /api/v1/payments/{id}

## Receipts

GET    /api/v1/receipts
GET    /api/v1/receipts/student/{studentId}
GET    /api/v1/receipts/{id}
POST   /api/v1/receipts
PUT    /api/v1/receipts/{id}
DELETE /api/v1/receipts/{id}

## Finance

GET /api/v1/finance/{studentId}

This endpoint provides the student's financial account information, including assessments, payments, balances, and account status.

## Reports

GET /api/v1/reports/collections
GET /api/v1/reports/outstanding

These endpoints provide collection and outstanding balance information.

---

# API Error Handling

The API uses standard HTTP status codes.

### 400 Bad Request

Returned when the request contains invalid or missing information.

### 404 Not Found

Returned when the requested resource or student account does not exist.

Error responses use *Problem Details JSON*.

Example:

{
  "type": "https://example.com/problems/not-found",
  "title": "Not Found",
  "status": 404,
  "detail": "The requested endpoint was not found"
}

---

# Backend Architecture

The backend follows a layered structure:

text
Client
   │
   ▼
Routes
   │
   ▼
Services
   │
   ▼
Data / Database

### Routes

Handles HTTP requests and responses.

### Services

Handles business logic and processing.

### Data / Database

Handles stored application data using MongoDB and Mongoose.

This structure makes the backend easier to maintain, test, and extend.

---

# Database

The backend uses MongoDB.

Database:

text
idsc_finance

Connection:

text
mongodb://127.0.0.1:27017/idsc_finance

Main data entities include:

* Students
* Assessments
* Payments
* Receipts

---

# Documentation

The project documentation explains how the Finance Module is designed, implemented, and integrated with the other College Management System modules.

## Documentation Files

### Architecture

text
docs/architecture.md

Contains the overall system architecture, backend structure, frontend screens, and API relationships.

### Data Model

text
docs/data-model.md

Contains the entities, fields, relationships, and data model used by the Finance Module.

### Integration

text
docs/integration.md

Contains information about how the Finance Module communicates with other College Management System modules and the agreements between modules.

### Design System

text
docs/design-system.md

Contains information about the shared class design system and the Finance Module's specific screens and components.

### Architecture Decision Record

text
docs/decisions/001-backend-framework.md

Documents the decision to use *Node.js with Express.js* as the backend framework.

---

# API Contract

The API contract is defined in:

text
backend/openapi.yaml

The OpenAPI specification documents:

* Endpoints
* Request parameters
* Request bodies
* Response schemas
* Examples
* Error responses

The API contract is used by the backend and frontend to maintain consistency.

---

# Getting Started

## 1. Clone the Repository

git clone https://github.com/tatojastine/IDSC-Finance-System.git

## 2. Open the Project

cd IDSC-Finance-System

## 3. Open the Backend

cd backend

## 4. Install Dependencies

npm install

## 5. Start MongoDB

Make sure MongoDB is running locally.

The application uses:

text
mongodb://127.0.0.1:27017/idsc_finance

## 6. Start the Backend

node server.js

The server runs on:

text
http://localhost:5000

## 7. Open Swagger

Open the following URL in your browser:

text
http://localhost:5000/docs

## 8. Test the Health API

Open:

text
http://localhost:5000/api/v1/health

Expected response:

{
  "status": "ok"
}

---

# Project Status

## Frontend

* [ ] Finance Module prototype
* [ ] High-fidelity screen design
* [ ] Shared design system
* [ ] Finance dashboard
* [ ] Student financial account screens
* [ ] Assessment screens
* [ ] Payment screens
* [ ] Receipt screens
* [ ] Outstanding balance screens
* [ ] Desktop layouts
* [ ] Mobile layouts
* [ ] Clickable prototype flows
* [ ] Validation and error states
* [ ] Confirmation dialogs

## Backend

* [ ] Node.js and Express.js REST API
* [ ] MongoDB connection
* [ ] Student API
* [ ] Assessment API
* [ ] Payment API
* [ ] Receipt API
* [ ] Finance API
* [ ] Reports API
* [ ] Health API
* [ ] Swagger/OpenAPI documentation
* [ ] API error handling
* [ ] /api/v1 API versioning
* [ ] Backend framework ADR

## Documentation

* [ ] README
* [ ] OpenAPI contract
* [ ] Backend framework ADR
* [ ] Architecture documentation
* [ ] Data model documentation
* [ ] Integration documentation
* [ ] Design system documentation

---

# Project Requirements

The Finance Module follows the System Integration and Architecture project requirements:

* REST API under /api/v1
* Swagger/OpenAPI API contract
* Health endpoint
* Proper HTTP status codes
* Problem Details JSON for errors
* Layered backend architecture
* Backend framework ADR
* High-fidelity frontend prototype
* Desktop and mobile designs
* Shared class design system
* Documentation for architecture, data, integration, and design
* Integration with the other College Management System modules

---

# Repository

GitHub Repository:

https://github.com/tatojastine/IDSC-Finance-System

---

# Course Information

*Course:* System Integration and Architecture (Java)

*Project:* College Management System

*Module:* Finance

*Module Type:* Finance Management REST API and High-Fidelity Prototype
