import { getLatestEvent } from "./api/event.ts";
import { backfill, backfillQueue, backfillWorker } from "./lib/backfill.ts";
import { initHonoApp } from "./lib/express.ts";
import { log } from "./lib/logger.ts";
import { subscribe } from "./lib/subscriber.ts";

initHonoApp();

if (Deno.args[0] === "--backfill") {
  await backfill({
    maxFid: Number(Deno.env.get("BACKFILL_MAX_FID")) || undefined,
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
