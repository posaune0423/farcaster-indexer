import type { Message } from "@farcaster/hub-nodejs";
import { sql } from "drizzle-orm";
import { db, userData } from "../db";
import { log } from "../lib/logger";
import { formatUserData } from "../lib/utils";

export async function insertUserDatas(msgs: Message[]) {
  const userDataRows = formatUserData(msgs);
  if (userDataRows.length === 0) return;

  try {
    await db
      .insert(userData)
      .values(userDataRows)
      .onConflictDoUpdate({
        target: [userData.fid, userData.type],
        set: {
          hash: sql`excluded.hash`,
          value: sql`excluded.value`,
          updatedAt: new Date(),
        },
      });
    log.debug(`USER DATA INSERTED`);
  } catch (error) {
    log.error(error, "ERROR INSERTING USER DATA");
    throw error;
  }
}
