import type { ContactInfoContentBody } from "@farcaster/hub-nodejs";

import { db, hubs as hubsTable } from "../db";
import { log } from "../lib/logger";
import { breakIntoChunks, formatHubs } from "../lib/utils";

/**
 * Insert hubs in the database
 * @param msg List of connected peers
 */
export async function insertHubs(contacts: ContactInfoContentBody[]) {
  const hubs = formatHubs(contacts);
  if (hubs.length === 0) return;
  const chunks = breakIntoChunks(hubs, 1000);

  for (const chunk of chunks) {
    try {
      await db
        .insert(hubsTable)
        .values(chunk)
        .onConflictDoUpdate({
          target: [hubsTable.id],
          set: {
            updatedAt: new Date(),
          },
        });

      log.debug(`HUBS INSERTED`);
    } catch (error) {
      log.error(error, "ERROR INSERTING HUBS");
    }
  }
}
