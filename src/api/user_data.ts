import { Message } from "@farcaster/hub-nodejs";
import { sql } from "drizzle-orm";
import { db, userData } from "../db/index.ts";
import { log } from "../lib/logger.ts";
import { formatUserDatas } from "../lib/utils.ts";

export async function insertUserDatas(msgs: Message[]) {
  const userDatasRows = formatUserDatas(msgs);
  if (userDatasRows.length === 0) return;

  try {
    await db.insert(userData)
      .values(userDatasRows)
      .onConflictDoUpdate({
        target: [userData.fid, userData.type],
        set: {
          hash: sql`excluded.hash`,
          value: sql`excluded.value`,
        },
      });
    log.debug(`USER DATA INSERTED`);
  } catch (error) {
    log.error(error, "ERROR INSERTING USER DATA");
    throw error;
  }
}
