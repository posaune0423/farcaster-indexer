import { ContactInfoContentBody } from "@farcaster/hub-nodejs";

import { db } from "../db/kysely.ts";
import { log } from "../lib/logger.ts";
import { breakIntoChunks, formatHubs } from "../lib/utils.ts";

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
        .insertInto("hubs")
        .values(chunk)
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();

      log.debug(`HUBS INSERTED`);
    } catch (error) {
      log.error(error, "ERROR INSERTING HUBS");
    }
  }
}
