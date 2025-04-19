import type { Job } from "bullmq";

import { insertCasts } from "../api/cast";
import { saveLatestEventId } from "../api/event";
import { insertRegistrations } from "../api/fid";
import { insertLinks } from "../api/link";
import { insertReactions } from "../api/reaction";
import { insertSigners } from "../api/signer";
import { insertStorage } from "../api/storage";
import { insertUserDatas } from "../api/user_data";
import { insertVerifications } from "../api/verification";
import { createQueue, createWorker } from "../lib/bullmq";
import { log } from "../lib/logger";
import { getFullProfileFromHub } from "../lib/utils";
import { makeLatestEventId } from "./event";
import { hubClient } from "./hub_client";

type BackfillJob = {
  fids: number[];
};

export const backfillQueue = createQueue<BackfillJob>("backfill");
export const backfillWorker = createWorker<BackfillJob>("backfill", handleJob);

async function addFidsToBackfillQueue(maxFid?: number) {
  const fids = (await getAllFids()).slice(0, maxFid);
  const batchSize = 10;

  for (let i = 0; i < fids.length; i += batchSize) {
    const batch = fids.slice(i, i + batchSize);
    await backfillQueue.add("backfill", { fids: batch });
  }

  log.info("Added fids to queue");
}

/**
 * Backfill the database with data from a hub. This may take a while.
 */
export async function backfill({ maxFid }: { maxFid?: number | undefined }) {
  // Only add fids to the queue if it's empty, otherwise it creates duplicate jobs
  if ((await backfillQueue.getWaitingCount()) > 0) {
    log.info("Backfill queue already has jobs waiting.");
    return;
  }

  log.info("Starting backfill");

  // Save the latest event ID so we can subscribe from there after backfill completes
  const latestEventId = makeLatestEventId();
  await saveLatestEventId(latestEventId);
  await addFidsToBackfillQueue(maxFid);
  await getDbInfo();
  // await getHubs();
}

/**
 * Get all fids
 * @returns array of fids
 */
async function getAllFids() {
  const maxFidResult = await hubClient.getFids({
    pageSize: 1,
    reverse: true,
  });

  if (maxFidResult.isErr()) {
    throw new Error("Unable to backfill", { cause: maxFidResult.error });
  }

  const maxFid = maxFidResult.value.fids[0];
  return Array.from({ length: Number(maxFid) }, (_, i) => i + 1);
}

// /**
//  * Get all hubs
//  */
// async function getHubs() {
//   const peers = await hubClient.getPeers();

//   if (peers.isErr()) {
//     throw new Error("Unable to backfill Hubs", { cause: peers.error });
//   }

//   insertHubs(peers.value.contacts);
// }

async function getDbInfo() {
  const dbInfo = await hubClient.getInfo({
    dbStats: true,
  });

  if (dbInfo.isErr()) {
    throw new Error("Unable to get DB info", { cause: dbInfo.error });
  }

  log.info(dbInfo.value);
}

async function handleJob(job: Job) {
  const { fids } = job.data;

  for (let i = 0; i < fids.length; i++) {
    const fid = fids[i];

    const p = await getFullProfileFromHub(fid).catch((err) => {
      log.error(err, `Error getting profile for FID ${fid}`);
      return null;
    });

    if (!p) continue;

    await insertCasts(p.casts);
    await insertLinks(p.links);
    await insertReactions(p.reactions);
    await insertUserDatas(p.userData);
    await insertVerifications(p.verifications);

    await insertRegistrations(await p.registrations);
    await insertSigners(await p.signers);
    await insertStorage(await p.storage);

    await job.updateProgress(((i + 1) / fids.length) * 100);
  }

  await job.updateProgress(100);
}
