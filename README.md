# RenSeller
A web application that lets RPI students sell and buy anything.

## Run with Docker

Use Docker with the Compose plugin in WSL (Ubuntu). Make sure `docker info` and
`docker compose version` succeed inside WSL first. From a WSL terminal, open
this checkout:

```sh
cd /mnt/j/Code/Projects/RenSeller
```

From the repository root, run:

```sh
docker compose up --build -d --wait
```

Open **http://localhost:8080**. By default, the stack runs the frontend and backend
in separate containers. PostgreSQL is prepared as an optional service for later:

| Service | Purpose | Address inside Docker |
| --- | --- | --- |
| frontend | Builds React with Vite, serves it with Nginx, and proxies `/api/` | `frontend:80` |
| backend | FastAPI served by Uvicorn | `backend:8000` |
| database (optional) | PostgreSQL 17 with persistent storage | `database:5432` |

Only the frontend port is published, bound to the local machine. Browser API
requests should use relative paths such as `fetch('/api/health')`.
The frontend currently displays sample listings; this setup does not add a
listing schema or connect those samples to PostgreSQL.

- API docs: http://localhost:8080/api/docs
- API health: http://localhost:8080/api/health
- API and database readiness: http://localhost:8080/api/health/ready (returns 503 until the database is available)

Compose waits for the backend's `/health` endpoint before starting the frontend.
Neither service requires a database to start. Database-backed features still
need a running database and an application schema.

### Enable the database later

When ready to run PostgreSQL locally:

```sh
docker compose --profile database up --build -d --wait
```

This enables the database container alongside the frontend and backend. The
backend already has matching connection settings. This creates an empty database;
it does not add application tables or migrations. Database data lives in the
`postgres_data` named volume and survives rebuilds and normal shutdowns.

### Configuration

The defaults are for local development. Optionally copy `.env.example` to `.env`
in the repository root and edit the port or database credentials before the first
startup. Compose passes matching database settings to PostgreSQL and the backend;
the backend connects using the database service name, not `localhost`.
PostgreSQL initialization settings only apply to an empty data volume: changing
credentials in `.env` does not change users in an existing database.

For a backend running outside Docker, `backend/.env` can still supply a
`DATABASE_URL`. It is excluded from the image; Compose uses `PGHOST`, `PGPORT`,
`PGDATABASE`, `PGUSER`, and `PGPASSWORD` instead.

### Common commands

```sh
docker compose ps
docker compose logs -f
docker compose up --build -d --wait
docker compose --profile database exec database psql -U renseller -d renseller
docker compose --profile database down
```

Rebuild after source changes; these images do not mount source files or run hot
reload. Adjust the `psql` user/database arguments if you changed their defaults.
The `psql` command requires the optional database to be running. Including the
profile in `down` stops all services, including the database if it was enabled.
To intentionally delete all local database data, run
`docker compose --profile database down -v`.
