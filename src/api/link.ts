import type { Message } from "@farcaster/hub-nodejs";
import { and, eq } from "drizzle-orm";
import { db, links } from "../db";
import { log } from "../lib/logger";
import { breakIntoChunks, farcasterTimeToDate, formatLinks } from "../lib/utils";

export async function insertLinks(msgs: Message[]) {
  const linkRows = formatLinks(msgs);
  if (linkRows.length === 0) return;
  const chunks = breakIntoChunks(linkRows, 1000);

  for (const chunk of chunks) {
    try {
      await db.insert(links).values(chunk);
      log.debug(`LINKS INSERTED`);
    } catch (error) {
      log.error(error, "ERROR INSERTING LINKS");
      throw error;
    }
  }
}

export async function deleteLinks(msgs: Message[]) {
  try {
    await db.transaction(async (tx) => {
      for (const msg of msgs) {
        const data = msg.data!;
        await tx
          .update(links)
          .set({ deletedAt: farcasterTimeToDate(data.timestamp) })
          .where(and(eq(links.fid, data.fid), eq(links.targetFid, data.linkBody!.targetFid!)))
          .execute();
      }
    });
    log.debug(`LINKS DELETED`);
  } catch (error) {
    log.error(error, "ERROR DELETING LINKS");
    throw error;
  }
}

export async function pruneLinks(msgs: Message[]) {
  try {
    await db.transaction(async (tx) => {
      for (const msg of msgs) {
        const data = msg.data!;
        await tx
          .update(links)
          .set({ prunedAt: farcasterTimeToDate(data.timestamp) })
          .where(and(eq(links.fid, data.fid), eq(links.targetFid, data.linkBody!.targetFid!)))
          .execute();
      }
    });
    log.debug(`LINKS PRUNED`);
  } catch (error) {
    log.error(error, "ERROR PRUNING LINKS");
    throw error;
  }
}
