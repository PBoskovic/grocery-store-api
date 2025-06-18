
# Grocery Store API

A demo backend API for organizational management (offices, stores, employees, and managers), designed with clear access control and best practices for maintainability and auditability.



---

## Table of Contents

1. [Features](#features)
2. [Getting Started](#getting-started)
    * [Prerequisites](#prerequisites)
    * [Running with Docker Compose](#running-with-docker-compose)
    * [Environment Variables](#environment-variables)
    * [Seeding Demo Data](#seeding-demo-data)
3. [Running tests](#running-tests)
4. [CI/CD](#ci-cd)
5. [Notes](#notes)
---

## Features

* **TypeScript** + **Express** API
* **MongoDB** (Mongoose models)
* JWT authentication (with role and org node scoping)
* Explicit access rules:
    * Admins: full access
    * Managers: CRUD on users in their org node + descendants
    * Employees: view employees in their org node + descendants
* Interactive OpenAPI (Swagger) documentation is available at /api/docs.
* API endpoints for users and org nodes (with filtering)
* Tests with [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server)
* Dockerized for easy setup and local testing
* Seed script matches provided org diagram for clarity and auditability

---

## Getting Started

### Prerequisites

* [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/) installed
* (Alternatively: Node.js v20+ and MongoDB for local-only setup)

### Running with Docker Compose

1. **Clone the repository**

   ```bash
   git clone https://github.com/PBoskovic/grocery-store-api.git
   cd grocery-store-api
   ```

2. **Copy the example environment file**

   ```bash
   cp .env.example .env
   ```

    * Edit `.env` if you want to override defaults (see [Environment Variables](#environment-variables) below).

3. **Build and start the containers**

   ```bash
   docker-compose up --build
   ```

   This will start both the **API** and a **MongoDB** database.
   The API will be accessible at [http://localhost:3000](http://localhost:3000) (or the port you set).

4. **Seeding Demo Data**

    * The database is seeded with demo users and org nodes on first startup, matching the provided organizational diagram.
    * To reseed, set `SEED_DB=true` in your `.env` and restart the container.

5. **API Docs / Usage**

    * Test endpoints with [Postman](https://www.postman.com/), [Insomnia](https://insomnia.rest/), or `curl`.
    * Example login, CRUD, and orgnode routes are described below.

---

## Environment Variables

| Name             | Default                               | Description                                              |
| ---------------- | ------------------------------------- | -------------------------------------------------------- |
| `PORT`           | 3000                                  | Port the API will run on                                 |
| `MONGODB_URI`    | mongodb://mongodb:27017/grocery-store | Mongo connection string (Docker uses `mongodb` hostname) |
| `JWT_SECRET`     | secret                                | Secret key for signing JWT tokens                        |
| `JWT_EXPIRES_IN` | 2h                                    | JWT token lifetime (e.g. `1d`, `12h`, `3600s`)           |
| `SEED_DB`        | true                                  | Seed database on container start                         |

> **Tip:** For production, always set a strong, random `JWT_SECRET`.

---

## Seeding Demo Data

* Demo data **matches provided org chart**.
* For larger or more randomized data, see [faker](https://github.com/marak/Faker.js/) or adjust `seed.ts`.
* To re-seed, stop containers, set `SEED_DB=true`, and run `docker-compose up`.

---

## Running Tests

This project uses **Jest** and **supertest** for API integration/unit tests, with **mongodb-memory-server** for a disposable, in-memory MongoDB instance (no external DB needed).

**Test files are located in**:

* `test/users/users.routes.test.ts`
* `test/orgnodes/orgnodes.routes.test.ts`

### **How to Run Tests**

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run the tests:**

   ```bash
   npm test
   ```

**Test Coverage:**

   * CRUD operations for users (admin/manager/employee)
   * OrgNode access controls (subtree access, forbidden cases)
   * Authentication and JWT usage
   * Basic validation (email, required fields)
   * Unauthorized access

### **Example**

```bash
# Run all tests
npm test

# Output:
# PASS  test/users/users.routes.test.ts
# PASS  test/orgnodes/orgnodes.routes.test.ts
# Test Suites: 2 passed, 2 total
# Tests:       18 passed, 18 total
```

### **Troubleshooting**

* If you get errors about “openUri() on an active connection”, ensure you are not connecting to MongoDB in your main app during tests. The project is set up to avoid this when `NODE_ENV=test`.
* If a test hangs, run with `npm test -- --detectOpenHandles` to find open connections.

---


### CI/CD
[![CI](https://github.com/PBoskovic/grocery-store-api/actions/workflows/ci.yml/badge.svg)](https://github.com/PBoskovic/grocery-store-api/actions)

This project includes a GitHub Actions workflow for automated testing:

- **Runs lint, typecheck, build, and test on every push and pull request**
- Fails early if there are type errors, lint issues, or test failures

Example workflow steps:

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: '20'
- run: npm ci
- run: npm run lint
- run: npm run typecheck
- run: npm run build
- run: npm test
```


---

## API Documentation

Interactive OpenAPI docs are available at [`/api/docs`](http://localhost:3000/api/docs).

All endpoints are documented with request/response examples, schemas, and error codes.

**How docs are generated:**
- OpenAPI (Swagger) docs are auto-generated from JSDoc annotations in route files.
- See `src/routes/users.ts`, `src/routes/auth.ts`, and `src/routes/orgnodes.ts` for examples.

> To add/extend documentation, simply annotate new endpoints in the corresponding route/controller file.


## **Notes**

* No manual DB setup is required for tests.
* All tests are designed to run outside the Docker environment (i.e., directly via your local Node.js install).
  This is because they use an in-memory MongoDB instance and do not depend on any Docker containers or external services.

Production/CI integration:
If needed, tests can be adapted to run in a Dockerized environment (for example, as part of a CI pipeline or pre-deployment check) by:

## Why this setup?

- **Demo data and access control**: Explicitly matches your spec for clarity and review.
- **Tests and CI**: Covers core business logic, access rules, and validation to showcase production readiness.
- **Documentation**: All routes are annotated and browsable via OpenAPI.
- **TypeScript + Lint**: Ensures maintainability, safety, and style consistency.
- **Extensible**: Ready for cloud deployment (AWS/Azure/GCP), larger datasets, or UI integration.


---
