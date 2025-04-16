import { extractEventTimestamp } from "@farcaster/hub-nodejs";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Context, Hono } from "jsr:@hono/hono";

import { getLatestEvent } from "../api/event.ts";
import { backfillQueue } from "./backfill.ts";
import { log } from "./logger.ts";

export function initHonoApp() {
  const app = new Hono();

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

  // Deno.serve で起動
  serve(app.fetch, { port: 3001 });
  log.info("Server started on http://localhost:3001");
}
