# Task Management API

A simple Task Management System built with **Node.js/Express.js**, using **MongoDB** for data storage and **BullMQ** (Redis) for background processing. Includes JWT authentication and basic unit tests with Jest.

---

## Table of Contents
- [Prerequisites](#prerequisites)
- [Setup & Run (Docker Compose)](#setup--run-docker-compose)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Tasks](#tasks)
- [Notes & Design Decisions](#notes--design-decisions)

---

## Prerequisites
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed.

---

## Setup & Run (Docker Compose)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/task-management-api.git
   cd task-management-api
   ```

2. **Create/Update Environment Files (optional but recommended):**

   - `.env` for local development (if you run the app without Docker, or if you want to share environment variables with Docker).
   - `.env.test` for running tests locally (`npm test`).

   Example `.env`:
   ```ini
   MONGO_URI=mongodb://localhost:27017/taskmanager
   REDIS_HOST=localhost
   REDIS_PORT=6379
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your-secret-key
   ```

   Example `.env.test` (for tests):
   ```ini
   MONGO_URI=mongodb://localhost:27017/taskmanager_test
   REDIS_HOST=localhost
   REDIS_PORT=6379
   PORT=3001
   NODE_ENV=test
   JWT_SECRET=your-secret-key
   ```

3. **Run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

   This spins up:
   - `app`: The Node.js/Express container
   - `mongo`: MongoDB
   - `redis`: Redis for BullMQ

   Once up, the API should be available at `http://localhost:3000`.

---

## Environment Variables

| Variable     | Description                          | Default / Example                        |
|-------------|--------------------------------------|------------------------------------------|
| MONGO_URI   | MongoDB connection string           | `mongodb://mongo:27017/taskmanager`      |
| REDIS_HOST  | Hostname where Redis is running     | `redis` or `localhost`                   |
| REDIS_PORT  | Redis port                           | `6379`                                   |
| PORT        | Port for the Express server         | `3000`                                   |
| NODE_ENV    | Node environment                    | `development`                            |
| JWT_SECRET  | Secret key for JWT tokens          | `your-secret-key`                        |

> When running via `docker-compose`, the environment variables in `docker-compose.yml` override these.

---

## Testing

We use **Jest** (with **Supertest**) for unit/integration tests.

- Make sure you have MongoDB running locally or in Docker (for the test DB).
- Ensure your `.env.test` is configured with a test database (e.g., `taskmanager_test`).

Install dependencies:
```bash
npm install
```

Run tests:
```bash
npm test
```

This will:
- Load `.env.test`
- Run all tests in `test/` folder
- Output pass/fail and coverage info (if configured)

---

## API Documentation

Below are the main endpoints with example request and response bodies. The base URL is typically `http://localhost:3000` (assuming the default port).

### Authentication

#### Register a new user

**POST /auth/register**

Request Body:
```json
{
  "username": "testuser",
  "password": "testpassword"
}
```

Success Response (201):
```json
{
  "message": "User registered successfully"
}
```

Error Response (400):
```json
{
  "message": "Username already taken"
}
```

---

#### Login

**POST /auth/login**

Request Body:
```json
{
  "username": "testuser",
  "password": "testpassword"
}
```

Success Response (200):
```json
{
  "token": "<jwt-token-string>"
}
```

Error Response (401):
```json
{
  "message": "Invalid credentials"
}
```

---

### Tasks

> All `/tasks` endpoints require a valid JWT in the `Authorization` header.  
> **Example:** `Authorization: Bearer <jwt-token>`

#### Create a Task

**POST /tasks**

Request Header:
```text
Authorization: Bearer <jwt-token>
```

Request Body:
```json
{
  "title": "My New Task",
  "description": "Some details"
}
```

Success Response (201):
```json
{
  "_id": "64f945eb...",
  "title": "My New Task",
  "description": "Some details",
  "status": "Pending",
  "user": "64f945aa...",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

---

#### Get All Tasks

**GET /tasks**

Request Header:
```text
Authorization: Bearer <jwt-token>
```

Success Response (200):
```json
[
  {
    "_id": "64f945eb...",
    "title": "Task A",
    "description": "Desc A",
    "status": "Pending",
    "user": "64f945aa...",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

---

## Notes & Design Decisions

- **MongoDB / NoSQL**: Chosen for simplicity and speed of iteration. Each Task is linked to a User via a reference (`user` field).
- **Authentication**: JSON Web Tokens (JWT). The auth middleware checks for a valid `Authorization: Bearer <token>` header.
- **Asynchronous Processing**: BullMQ/Redis is used to demonstrate background task handling (e.g., queueing status updates).
- **Testing**:
  - Jest is used for unit/integration tests, with Supertest for HTTP calls.
  - `auth.test.js` covers user registration/login.
  - `tasks.test.js` covers CRUD operations for tasks.
- **Docker**:
  - `docker-compose.yml` sets up the app, MongoDB, and Redis in separate containers.
  - A single `Dockerfile` is used to build the Node.js application container.

---

Thank you for checking out the Task Management API! Feel free to reach out with any questions.
