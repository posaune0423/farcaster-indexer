import {
  isSignerOnChainEvent,
  OnChainEvent,
  OnChainEventType,
  SignerEventType,
} from "@farcaster/hub-nodejs";
import { bytesToHex, decodeAbiParameters } from "viem";

import { and, eq, sql } from "drizzle-orm";
import { db, signers as signersTable } from "../db/index.ts";
import { hubClient } from "../lib/hub_client.ts";
import { getOnChainEventsByFidInBatchesOf } from "../lib/paginate.ts";
import { MAX_PAGE_SIZE } from "../lib/utils.ts";

const signedKeyRequestAbi = [
  {
    components: [
      {
        name: "requestFid",
        type: "uint256",
      },
      {
        name: "requestSigner",
        type: "address",
      },
      {
        name: "signature",
        type: "bytes",
      },
      {
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "SignedKeyRequest",
    type: "tuple",
  },
] as const;

export function decodeSignedKeyRequestMetadata(metadata: Uint8Array) {
  return decodeAbiParameters(signedKeyRequestAbi, bytesToHex(metadata))[0];
}

export async function getAllSignersByFid(fid: number) {
  let signerEvents: OnChainEvent[] = [];

  for await (
    const events of getOnChainEventsByFidInBatchesOf(hubClient, {
      fid,
      pageSize: MAX_PAGE_SIZE,
      eventTypes: [OnChainEventType.EVENT_TYPE_SIGNER],
    })
  ) {
    signerEvents = signerEvents.concat(...events);
  }

  // Since there could be many events, ensure we process them in sorted order
  const sortedEventsForFid = signerEvents.sort((a, b) =>
    a.blockNumber === b.blockNumber
      ? a.logIndex - b.logIndex
      : a.blockNumber - b.blockNumber
  );

  return sortedEventsForFid;
}

export async function insertSigners(signers: OnChainEvent[]) {
  for (const signer of signers) {
    if (!isSignerOnChainEvent(signer)) {
      throw new Error(`Invalid SignerOnChainEvent: ${signer}`);
    }

    const body = signer.signerEventBody;
    const timestamp = new Date(signer.blockTimestamp * 1000);

    switch (body.eventType) {
      case SignerEventType.ADD: {
        const signedKeyRequestMetadata = decodeSignedKeyRequestMetadata(
          body.metadata,
        );
        const metadataJson = {
          requestFid: Number(signedKeyRequestMetadata.requestFid),
          requestSigner: signedKeyRequestMetadata.requestSigner,
          signature: signedKeyRequestMetadata.signature,
          deadline: Number(signedKeyRequestMetadata.deadline),
        };

        await db
          .insert(signersTable)
          .values({
            addedAt: timestamp,
            fid: signer.fid,
            requesterFid: metadataJson.requestFid,
            key: body.key,
            keyType: body.keyType,
            metadata: JSON.stringify(metadataJson),
            metadataType: body.metadataType,
          })
          .onConflictDoUpdate({
            target: [signersTable.fid, signersTable.key],
            set: {
              // Update all other fields in case this was a replayed transaction from a block re-org
              addedAt: sql`excluded.addedAt`,
              requesterFid: sql`excluded.requesterFid`,
              keyType: sql`excluded.keyType`,
              metadata: JSON.stringify(metadataJson),
              metadataType: sql`excluded.metadataType`,
              updatedAt: new Date(),
            },
          });

        break;
      }
      case SignerEventType.REMOVE: {
        // Smart contract ensures there will always be an add before a remove, so we know we can update in-place
        db.update(signersTable)
          .set({
            removedAt: timestamp,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(signersTable.fid, signer.fid),
              eq(signersTable.key, body.key),
            ),
          )
          .execute();

        break;
      }
    }
  }
}
