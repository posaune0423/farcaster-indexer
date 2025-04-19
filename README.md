# Farcaster Indexer

This is an indexer that listens for messages from a
[Farcaster Hub](https://docs.farcaster.xyz/learn/architecture/hubs) and inserts
relevant data into a postgres database.

## Tech Stack

- **Bun**: Runtime environment for TypeScript/JavaScript
- **Drizzle ORM**: Type-safe ORM for PostgreSQL
- **BullMQ**: Distributed job and queue management (with Redis)
- **Hono**: Lightweight web framework for Bun
- **PostgreSQL**: Main database
- **Redis**: Queue backend for BullMQ
- **Farcaster Hub**: Source of events/messages
- **Pino**: Logging
- **Others**: dotenv, cli-progress, viem

---

The most performant way to run this is to co-locate everything (hub, Bun app,
postgres, redis) on the same machine. I recommend
[Latitude](https://www.latitude.sh/r/673C7DB2) (referral code for $200 of free
credits).

## Prerequisites

- Bun
- Docker and Docker Compose (for PostgreSQL and Redis)

## Docker Setup

### Start Services

```bash
# Start PostgreSQL
docker run -d \
  --name farcaster-indexer-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=farcaster \
  -p 5432:5432 \
  postgres:15

# Start Redis
docker run -d \
  --name farcaster-indexer-redis \
  -p 6379:6379 \
  redis:7
```

### Cleanup and Restart

```bash
# Stop and remove containers
docker stop farcaster-indexer-postgres farcaster-indexer-redis
docker rm farcaster-indexer-postgres farcaster-indexer-redis

# Restart services (use the same commands as above to start)
```

## How to run

Clone this repo

```bash
git clone https://github.com/posaune0423/farcaster-indexer.git
cd farcaster-indexer
```

Install dependencies

```bash
bun install
```

Create a `.env` file with your hub, database, and redis connection details

```bash
cp .env.example .env
```

Run the latest database migrations

```bash
bun run db:migrate
```

Run the indexer

```bash
# Recommended to get the full state. You only need to run this once.
# Streaming will start after the backfill is complete.
bun run start --backfill

# Ignores backfill and starts streaming from the latest recorded event.
# You should run this after one initial backfill.
bun run start
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
