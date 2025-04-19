# Farcaster Indexer

This is an indexer that listens for messages from a
[Farcaster Hub](https://docs.farcaster.xyz/learn/architecture/hubs) and inserts
relevant data into a postgres database.

## Tech Stack / 技術スタック

- **Deno**: Runtime environment for TypeScript/JavaScript
- **Drizzle ORM**: Type-safe ORM for PostgreSQL
- **BullMQ**: Distributed job and queue management (with Redis)
- **Hono**: Lightweight web framework for Deno
- **PostgreSQL**: Main database
- **Redis**: Queue backend for BullMQ
- **Farcaster Hub**: Source of events/messages
- **Pino**: Logging
- **その他**: dotenv, cli-progress, viem など

---

The most performant way to run this is to co-locate everything (hub, Deno app,
postgres, redis) on the same machine. I recommend
[Latitude](https://www.latitude.sh/r/673C7DB2) (referral code for $200 of free
credits).

## Prerequisites

- Deno
- Docker and Docker Compose (for PostgreSQL and Redis)

## Docker Setup

### Start Services

```bash
# Start PostgreSQL
docker run -d \
  --name postgres-farcaster \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=farcaster \
  -p 5432:5432 \
  postgres:15

# Start Redis
docker run -d \
  --name redis-farcaster \
  -p 6379:6379 \
  redis:7
```

### Cleanup and Restart

```bash
# Stop and remove containers
docker stop postgres-farcaster redis-farcaster
docker rm postgres-farcaster redis-farcaster

# Restart services (use the same commands as above to start)
```

## How to run

Clone this repo

```bash
git clone -b hubs https://github.com/gskril/farcaster-indexer.git
cd farcaster-indexer
```

Install dependencies (Deno will auto-install on first run, but you can
pre-cache)

```bash
deno cache src/index.ts
```

Create a `.env` file with your hub, database, and redis connection details

```bash
cp .env.example .env
```

Run the latest database migrations

```bash
deno run --allow-env --allow-net --allow-read ./src/db/migrator.ts
```

Run the indexer

```bash
# Recommended to get the full state. You only need to run this once.
# Streaming will start after the backfill is complete.
deno run --allow-env --allow-net --allow-read ./src/index.ts --backfill

# Ignores backfill and starts streaming from the latest recorded event.
# You should run this after one initial backfill.
deno run --allow-env --allow-net --allow-read ./src/index.ts
```

## How it works

- Backfill and streaming are separate processes.
- Every operation is run through [BullMQ](https://bullmq.io/) for better
  concurrency and error handling.
- For backfill, the indexer adds all FIDs (in batches of 100) to a queue and
  processes them in parallel. The `WORKER_CONCURRENCY` environment variable
  controls how many workers are spawned.
- Once backfill is complete, the indexer subscribes to a hub's event stream and
  processes messages as they arrive. BullMQ is used as middleware to ensure that
  hub events are getting handled fast enough, otherwise the stream will
  disconnect.

## Extras

If you want to add search functionality, you can manually apply the SQL
migration at [src/db/search-migrations.sql](./src/db/search-migrations.sql)
