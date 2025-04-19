import type { Message } from "@farcaster/hub-nodejs";
import { and, eq } from "drizzle-orm";

import { casts, db } from "../db";
import { log } from "../lib/logger";
import { breakIntoChunks, farcasterTimeToDate, formatCasts } from "../lib/utils";

/**
 * Insert casts in the database
 * @param msgs Raw hub messages
 */
export async function insertCasts(msgs: Message[]) {
  const castRows = formatCasts(msgs);
  if (castRows.length === 0) return;
  const chunks = breakIntoChunks(castRows, 1000);

  for (const chunk of chunks) {
    try {
      await db.insert(casts).values(chunk);
      log.debug(`CASTS INSERTED`);
    } catch (error) {
      log.error(error, "ERROR INSERTING CAST");
      throw error;
    }
  }
}

/**
 * Soft delete casts in the database
 * @param msgs Raw hub messages
 */
export async function deleteCasts(msgs: Message[]) {
  try {
    await db.transaction(async (tx) => {
      for (const msg of msgs) {
        const data = msg.data!;
        await tx
          .update(casts)
          .set({ deletedAt: farcasterTimeToDate(data.timestamp) })
          .where(eq(casts.hash, data.castRemoveBody?.targetHash!))
          .execute();
      }
    });
    log.debug(`CASTS DELETED`);
  } catch (error) {
    log.error(error, "ERROR DELETING CAST");
    throw error;
  }
}

/**
 * Soft prune casts in the database
 * @param msgs Raw hub messages
 */
export async function pruneCasts(msgs: Message[]) {
  try {
    await db.transaction(async (tx) => {
      for (const msg of msgs) {
        const data = msg.data!;
        await tx
          .update(casts)
          .set({ prunedAt: farcasterTimeToDate(data.timestamp) })
          .where(and(eq(casts.fid, data.fid), eq(casts.text, data.castAddBody!.text)))
          .execute();
      }
    });
    log.debug(`CASTS PRUNED`);
  } catch (error) {
    log.error(error, "ERROR PRUNING CAST");
    throw error;
  }
}
