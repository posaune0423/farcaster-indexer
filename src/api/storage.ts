import { isStorageRentOnChainEvent, type OnChainEvent, OnChainEventType } from "@farcaster/hub-nodejs";
import { sql } from "drizzle-orm";
import { db, storage as storageTable } from "../db";
import { hubClient } from "../lib/hub_client";
import { getOnChainEventsByFidInBatchesOf } from "../lib/paginate";
import { farcasterTimeToDate, MAX_PAGE_SIZE } from "../lib/utils";

export async function getAllStorageByFid(fid: number) {
  let storageEvents: OnChainEvent[] = [];

  for await (const events of getOnChainEventsByFidInBatchesOf(hubClient, {
    fid,
    pageSize: MAX_PAGE_SIZE,
    eventTypes: [OnChainEventType.EVENT_TYPE_STORAGE_RENT],
  })) {
    storageEvents = storageEvents.concat(...events);
  }

  // Since there could be many events, ensure we process them in sorted order
  const sortedEventsForFid = storageEvents.sort((a, b) =>
    a.blockNumber === b.blockNumber ? a.logIndex - b.logIndex : a.blockNumber - b.blockNumber,
  );

  return sortedEventsForFid;
}

export async function insertStorage(storageEvents: OnChainEvent[]) {
  for (const storage of storageEvents) {
    if (!isStorageRentOnChainEvent(storage)) {
      throw new Error(`Invalid SignerOnChainEvent: ${storage}`);
    }

    const body = storage.storageRentEventBody;
    const timestamp = new Date(storage.blockTimestamp * 1000);

    await db
      .insert(storageTable)
      .values({
        fid: storage.fid,
        units: body.units,
        payer: body.payer,
        rentedAt: timestamp,
        expiresAt: farcasterTimeToDate(body.expiry),
      })
      .onConflictDoUpdate({
        target: [storageTable.fid, storageTable.expiresAt],
        set: {
          units: sql`excluded.units`,
          payer: sql`excluded.payer`,
          expiresAt: sql`excluded.expires_at`,
          rentedAt: sql`excluded.rented_at`,
          updatedAt: new Date(),
        },
      });
  }
}
