# Todo App

A full-stack todo application built as a monorepo with React, Fastify, Prisma, and PostgreSQL.

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Vite 8
- **Backend:** Fastify 5, TypeScript, Prisma 7 (ORM), PostgreSQL 17
- **Testing:** Jest, React Testing Library
- **Containerization:** Docker / Podman with Docker Compose
- **Linting & Formatting:** ESLint 9, Prettier

## Project Structure

```
todo-app-bmad/
├── packages/
│   ├── client/          # React SPA (Vite + Tailwind)
│   └── server/          # Fastify REST API (Prisma + PostgreSQL)
├── docker-compose.yml   # Container orchestration
├── package.json         # Monorepo root (npm workspaces)
└── tsconfig.base.json   # Shared TypeScript config
```

## Prerequisites

- **Node.js** >= 22
- **npm** >= 10
- **Docker** or **Podman** (for containerized or database-only setup)

## Getting Started

### Option 1: Docker / Podman (recommended)

Run the entire stack in containers with a single command:

```bash
# Start all services (client, server, database)
podman compose up -d --build

# Run database migrations
podman compose exec server npx prisma migrate deploy
```

The app is now available at:

| Service  | URL                    |
| -------- | ---------------------- |
| Client   | http://localhost:8080   |
| API      | http://localhost:3001   |

To stop the application:

```bash
# Stop and remove containers (keeps database data)
podman compose down

# Stop and remove containers AND database data
podman compose down -v
```

> Replace `podman` with `docker` if using Docker.

### Option 2: Local Development (hot-reload)

**1. Start the database:**

```bash
podman compose up -d db
```

**2. Install dependencies:**

```bash
npm install
```

**3. Run database migrations:**

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/todoapp" \
  npx prisma migrate deploy --schema packages/server/prisma/schema.prisma
```

**4. Start dev servers** (in separate terminals):

```bash
# Terminal 1 — API server (http://localhost:3000)
npm run dev:server

# Terminal 2 — Client dev server (http://localhost:5173)
npm run dev:client
```

## Scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev:client`  | Start client dev server (Vite)       |
| `npm run dev:server`  | Start API server (tsx watch)         |
| `npm test`           | Run all tests                        |
| `npm run test:client` | Run client tests only                |
| `npm run test:server` | Run server tests only                |
| `npm run lint`       | Lint all packages                    |
| `npm run format`     | Format code with Prettier            |
| `npm run format:check`| Check formatting                    |

## API Endpoints

| Method   | Endpoint          | Description         |
| -------- | ----------------- | ------------------- |
| `GET`    | `/api/todos`      | List all todos      |
| `POST`   | `/api/todos`      | Create a new todo   |
| `PATCH`  | `/api/todos/:id`  | Update a todo       |
| `DELETE` | `/api/todos/:id`  | Delete a todo       |
| `GET`    | `/health`         | Health check        |

## License

[MIT](LICENSE)
