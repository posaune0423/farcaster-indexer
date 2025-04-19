import type { Message } from "@farcaster/hub-nodejs";
import { and, eq, sql } from "drizzle-orm";
import { db, reactions } from "../db";
import { log } from "../lib/logger";
import { breakIntoChunks, farcasterTimeToDate, formatReactions } from "../lib/utils";

/**
 * Insert a reaction in the database
 * @param msg Hub event in JSON format
 */
export async function insertReactions(msgs: Message[]) {
  const reactionRows = formatReactions(msgs);
  if (reactionRows.length === 0) return;
  const chunks = breakIntoChunks(reactionRows, 1000);

  for (const chunk of chunks) {
    try {
      await db
        .insert(reactions)
        .values(chunk)
        .onConflictDoUpdate({
          target: [reactions.hash],
          set: {
            updatedAt: new Date(),
          },
        });
      log.debug(`REACTIONS INSERTED`);
    } catch (error) {
      log.error(error, "ERROR INSERTING REACTIONS");
      throw error;
    }
  }
}

export async function deleteReactions(msgs: Message[]) {
  try {
    await db.transaction(async (tx) => {
      for (const msg of msgs) {
        const data = msg.data!;
        const reaction = data.reactionBody!;
        if (reaction.targetCastId) {
          await tx
            .update(reactions)
            .set({ deletedAt: farcasterTimeToDate(data.timestamp) })
            .where(
              and(
                eq(reactions.fid, data.fid),
                eq(reactions.type, reaction.type),
                eq(reactions.targetCastHash, reaction.targetCastId.hash),
              ),
            )
            .execute();
        } else if (reaction.targetUrl) {
          await tx
            .update(reactions)
            .set({ deletedAt: farcasterTimeToDate(data.timestamp) })
            .where(
              and(
                eq(reactions.fid, data.fid),
                eq(reactions.type, reaction.type),
                eq(reactions.targetUrl, reaction.targetUrl),
              ),
            )
            .execute();
        }
      }
    });
    log.debug(`REACTIONS DELETED`);
  } catch (error) {
    log.error(error, "ERROR DELETING REACTIONS");
    throw error;
  }
}

export async function pruneReactions(msgs: Message[]) {
  try {
    await db.transaction(async (tx) => {
      for (const msg of msgs) {
        const data = msg.data!;
        const reaction = data.reactionBody!;
        if (reaction.targetCastId) {
          await tx
            .update(reactions)
            .set({ prunedAt: farcasterTimeToDate(data.timestamp) })
            .where(
              and(
                eq(reactions.fid, data.fid),
                eq(reactions.type, reaction.type),
                eq(reactions.targetCastHash, reaction.targetCastId.hash),
              ),
            )
            .execute();
        } else if (reaction.targetUrl) {
          await tx
            .update(reactions)
            .set({ prunedAt: farcasterTimeToDate(data.timestamp) })
            .where(
              and(
                eq(reactions.fid, data.fid),
                eq(reactions.type, reaction.type),
                eq(reactions.targetUrl, reaction.targetUrl),
              ),
            )
            .execute();
        }
      }
    });
    log.debug(`REACTIONS PRUNED`);
  } catch (error) {
    log.error(error, "ERROR PRUNING REACTIONS");
    throw error;
  }
}
