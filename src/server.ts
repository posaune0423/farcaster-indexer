import { getLatestEvent } from "./api/event";
import { backfill, backfillQueue, backfillWorker } from "./lib/backfill";
import { initHonoApp } from "./lib/hono";
import { log } from "./lib/logger";
import { subscribe } from "./lib/subscriber";

initHonoApp();

if (process.argv[2] === "--backfill") {
  await backfill({
    maxFid: Number(process.env.BACKFILL_MAX_FID) || undefined,
  });

  // Once backfill completes, start subscribing to new events
  let subscriberStarted = false;
  backfillWorker.on("completed", async () => {
    if (subscriberStarted) return;
    const queueSize = await backfillQueue.getActiveCount();

    if (queueSize === 0) {
      subscriberStarted = true;
      log.info("Finished backfill");
      subscribe(await getLatestEvent());
    }
  });
} else {
  subscribe(await getLatestEvent());
}
