import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { HonoAdapter } from "@bull-board/hono";
import { extractEventTimestamp } from "@farcaster/hub-nodejs";
import { type Context, Hono } from "hono";
import { getLatestEvent } from "../api/event";
import { backfillQueue } from "./backfill";
import { log } from "./logger";
import { serveStatic } from "@hono/node-server/serve-static";
import { streamQueue } from "./subscriber";

export function initHonoApp() {
  const app = new Hono();

  const serverAdapter = new HonoAdapter(serveStatic);

  createBullBoard({
    queues: [new BullMQAdapter(backfillQueue), new BullMQAdapter(streamQueue)],
    serverAdapter,
  });

  const basePath = "/ui";
  serverAdapter.setBasePath(basePath);
  app.route(basePath, serverAdapter.registerPlugin());

  // /stats endpoint
  app.get("/stats", async (c: Context) => {
    let latestEventTimestamp;
    const latestEventId = await getLatestEvent();
    const isBackfillActive = (await backfillQueue.getActiveCount()) > 0;

    if (latestEventId) {
      latestEventTimestamp = extractEventTimestamp(latestEventId);
    }

    return c.json({ latestEventId, latestEventTimestamp, isBackfillActive });
  });

  const server = Bun.serve({
    fetch: app.fetch,
    port: 3000,
    hostname: "localhost",
    development: process.env.NODE_ENV !== "production",
  });

  log.info(`Running on ${server.hostname}:${server.port}...`);
  log.info(`For the UI of instance1, open http://localhost:${server.port}/ui`);
  log.info("Make sure Redis is running on port 6379 by default");
  log.info("To populate the queue, run:");
  log.info(`  curl http://localhost:${server.port}/add?title=Example`);
}
