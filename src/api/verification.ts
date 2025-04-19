import type { Message } from "@farcaster/hub-nodejs";

import { and, eq, sql } from "drizzle-orm";
import { db, verifications as verificationsTable } from "../db/index.ts";
import { log } from "../lib/logger.ts";
import { farcasterTimeToDate, formatVerifications } from "../lib/utils.ts";
/**
 * Insert a new verification in the database
 * @param msg Hub event in JSON format
 */
export async function insertVerifications(msgs: Message[]) {
  const verifications = formatVerifications(msgs);
  if (verifications.length === 0) return;

  try {
    await db
      .insert(verificationsTable)
      .values(verifications)
      .onConflictDoUpdate({
        target: [verificationsTable.hash],
        set: {
          deletedAt: sql`excluded.deletedAt`,
          updatedAt: new Date(),
        },
      });

    log.debug(`VERIFICATIONS INSERTED`);
  } catch (error) {
    log.error(error, "ERROR INSERTING VERIFICATIONS");
    throw error;
  }
}

/**
 * Delete a verification from the database
 * @param msg Hub event in JSON format
 */
export async function deleteVerifications(msgs: Message[]) {
  try {
    await db.transaction(async (trx) => {
      for (const msg of msgs) {
        const data = msg.data!;
        const address = data.verificationRemoveBody!.address;

        await trx
          .update(verificationsTable)
          .set({ deletedAt: farcasterTimeToDate(data.timestamp) })
          .where(
            and(
              eq(verificationsTable.signerAddress, address),
              eq(verificationsTable.fid, data.fid),
            ),
          )
          .execute();
      }
    });

    log.debug("VERIFICATIONS DELETED");
  } catch (error) {
    log.error(error, "ERROR DELETING VERIFICATIONS");
    throw error;
  }
}
