import { HubEvent, HubEventType } from "@farcaster/hub-nodejs";
import { Buffer } from "node:buffer";
import { saveLatestEventId } from "../api/event.ts";
import { createQueue, createWorker } from "./bullmq.ts";
import { handleEvent } from "./event.ts";
import { hubClient } from "./hub_client.ts";
import { log } from "./logger.ts";

export const streamQueue = createQueue<Buffer>("stream");
createWorker<Buffer>("stream", handleEvent, { concurrency: 1 });

/**
 * Listen for new events from a Hub
 */
export async function subscribe(fromEventId: number | undefined) {
  const result = await hubClient.subscribe({
    eventTypes: [
      HubEventType.MERGE_MESSAGE,
      HubEventType.PRUNE_MESSAGE,
      HubEventType.REVOKE_MESSAGE,
      HubEventType.MERGE_ON_CHAIN_EVENT,
    ],
    fromId: fromEventId,
  });

  if (result.isErr()) {
    log.error(result.error, "Error starting stream");
    return;
  }

  result.match(
    (stream) => {
      log.info(
        `Subscribed to stream from ${
          fromEventId ? `event ${fromEventId}` : "head"
        }`,
      );

      stream.on("data", async (e: HubEvent) => {
        const encodedEvent = Buffer.from(HubEvent.encode(e).finish());
        await streamQueue.add("stream", encodedEvent);
        // TODO: we can probably remove the `hub:latest-event-id` key and just use the last event ID in the queue
        await saveLatestEventId(e.id);
      });

      stream.on("close", () => {
        log.warn(`Hub stream closed`);
      });

      stream.on("end", () => {
        log.warn(`Hub stream ended`);
      });
    },
    (e) => {
      log.error(e, "Error streaming data.");
    },
  );
}
