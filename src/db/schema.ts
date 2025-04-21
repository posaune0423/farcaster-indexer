import {
  bigint,
  customType,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  unique,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Uint8Array }>({
  dataType() {
    return "bytea";
  },
});

export const casts = pgTable("casts", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  prunedAt: timestamp("pruned_at", { withTimezone: true }),
  fid: bigint("fid", { mode: "number" }).notNull(),
  parentFid: bigint("parent_fid", { mode: "number" }),
  hash: bytea("hash").notNull().unique(),
  rootParentHash: bytea("root_parent_hash"),
  parentHash: bytea("parent_hash"),
  rootParentUrl: text("root_parent_url"),
  parentUrl: text("parent_url"),
  text: text("text").notNull(),
  embeds: json("embeds").notNull().default([]),
  mentions: json("mentions").notNull().default([]),
  mentionsPositions: json("mentions_positions").notNull().default([]),
});

export type Cast = typeof casts.$inferSelect;
export type CastInsert = typeof casts.$inferInsert;

export const reactions = pgTable("reactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  prunedAt: timestamp("pruned_at", { withTimezone: true }),
  fid: bigint("fid", { mode: "number" }).notNull(),
  targetCastFid: bigint("target_cast_fid", { mode: "number" }),
  type: integer("type").notNull(),
  hash: bytea("hash").notNull().unique(),
  targetCastHash: bytea("target_cast_hash"),
  targetUrl: text("target_url"),
});

export type Reaction = typeof reactions.$inferSelect;
export type ReactionInsert = typeof reactions.$inferInsert;

export const links = pgTable("links", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  prunedAt: timestamp("pruned_at", { withTimezone: true }),
  fid: bigint("fid", { mode: "number" }).notNull(),
  targetFid: bigint("target_fid", { mode: "number" }),
  displayTimestamp: timestamp("display_timestamp", { withTimezone: true }),
  type: text("type").notNull(),
  hash: bytea("hash").notNull().unique(),
});

export type Link = typeof links.$inferSelect;
export type LinkInsert = typeof links.$inferInsert;

export const verifications = pgTable("verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  fid: bigint("fid", { mode: "number" }).notNull(),
  hash: bytea("hash").notNull().unique(),
  signerAddress: bytea("signer_address").notNull(),
  blockHash: bytea("block_hash").notNull(),
  signature: bytea("signature").notNull(),
});

export type Verification = typeof verifications.$inferSelect;
export type VerificationInsert = typeof verifications.$inferInsert;

export const userData = pgTable(
  "userData",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    fid: bigint("fid", { mode: "number" }).notNull(),
    type: integer("type").notNull(),
    hash: bytea("hash").notNull().unique(),
    value: text("value").notNull(),
  },
  (table) => [unique().on(table.fid, table.type)],
);

export type UserData = typeof userData.$inferSelect;
export type UserDataInsert = typeof userData.$inferInsert;

export const fids = pgTable("fids", {
  fid: bigint("fid", { mode: "number" }).primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  registeredAt: timestamp("registered_at", { withTimezone: true }).notNull(),
  custodyAddress: bytea("custody_address").notNull(),
  recoveryAddress: bytea("recovery_address").notNull(),
});

export type Fid = typeof fids.$inferSelect;
export type FidInsert = typeof fids.$inferInsert;

export const signers = pgTable(
  "signers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull(),
    removedAt: timestamp("removed_at", { withTimezone: true }),
    fid: bigint("fid", { mode: "number" }).notNull(),
    requesterFid: bigint("requester_fid", { mode: "number" }).notNull(),
    key: bytea("key").notNull(),
    keyType: integer("key_type").notNull(),
    metadata: json("metadata").notNull(),
    metadataType: integer("metadata_type").notNull(),
  },
  (table) => ({
    fidKeyUnique: unique().on(table.fid, table.key),
  }),
);

export type Signer = typeof signers.$inferSelect;
export type SignerInsert = typeof signers.$inferInsert;

export const storage = pgTable("storage", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  rentedAt: timestamp("rented_at", { withTimezone: true }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  fid: bigint("fid", { mode: "number" }).notNull(),
  units: integer("units").notNull(),
  payer: bytea("payer").notNull(),
});

export type Storage = typeof storage.$inferSelect;
export type StorageInsert = typeof storage.$inferInsert;

export const hubs = pgTable("hubs", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  gossipAddress: text("gossip_address").notNull(),
  rpcAddress: text("rpc_address").notNull(),
  excludedHashes: json("excluded_hashes").notNull().default([]),
  count: integer("count").notNull(),
  hubVersion: text("hub_version").notNull(),
  network: text("network").notNull(),
  appVersion: text("app_version").notNull(),
  timestamp: bigint("timestamp", { mode: "number" }).notNull(),
});

export type Hub = typeof hubs.$inferSelect;
export type HubInsert = typeof hubs.$inferInsert;
