import {
  bigint,
  customType,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Uint8Array }>({
  dataType() {
    return "bytea";
  },
});

export const casts = pgTable("casts", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull()
    .defaultNow(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  deletedAt: timestamp("deletedAt", { withTimezone: true }),
  prunedAt: timestamp("prunedAt", { withTimezone: true }),
  fid: bigint("fid", { mode: "number" }).notNull(),
  parentFid: bigint("parentFid", { mode: "number" }),
  hash: bytea("hash").notNull().unique(),
  rootParentHash: bytea("rootParentHash"),
  parentHash: bytea("parentHash"),
  rootParentUrl: text("rootParentUrl"),
  parentUrl: text("parentUrl"),
  text: text("text").notNull(),
  embeds: json("embeds").notNull().default([]),
  mentions: json("mentions").notNull().default([]),
  mentionsPositions: json("mentionsPositions").notNull().default([]),
});

export type Cast = typeof casts.$inferSelect;

export const reactions = pgTable("reactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull()
    .defaultNow(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  deletedAt: timestamp("deletedAt", { withTimezone: true }),
  prunedAt: timestamp("prunedAt", { withTimezone: true }),
  fid: bigint("fid", { mode: "number" }).notNull(),
  targetCastFid: bigint("targetCastFid", { mode: "number" }),
  type: integer("type").notNull(),
  hash: bytea("hash").notNull().unique(),
  targetCastHash: bytea("targetCastHash"),
  targetUrl: text("targetUrl"),
});

export type Reaction = typeof reactions.$inferSelect;

export const links = pgTable("links", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull()
    .defaultNow(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  deletedAt: timestamp("deletedAt", { withTimezone: true }),
  prunedAt: timestamp("prunedAt", { withTimezone: true }),
  fid: bigint("fid", { mode: "number" }).notNull(),
  targetFid: bigint("targetFid", { mode: "number" }),
  displayTimestamp: timestamp("displayTimestamp", { withTimezone: true }),
  type: text("type").notNull(),
  hash: bytea("hash").notNull().unique(),
});

export type Link = typeof links.$inferSelect;

export const verifications = pgTable("verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull()
    .defaultNow(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  deletedAt: timestamp("deletedAt", { withTimezone: true }),
  fid: bigint("fid", { mode: "number" }).notNull(),
  hash: bytea("hash").notNull().unique(),
  signerAddress: bytea("signerAddress").notNull(),
  blockHash: bytea("blockHash").notNull(),
  signature: bytea("signature").notNull(),
});

export type Verification = typeof verifications.$inferSelect;

export const userData = pgTable("userData", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull()
    .defaultNow(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  deletedAt: timestamp("deletedAt", { withTimezone: true }),
  fid: bigint("fid", { mode: "number" }).notNull(),
  type: integer("type").notNull(),
  hash: bytea("hash").notNull(),
  value: text("value").notNull(),
});

export type UserData = typeof userData.$inferSelect;

export const fids = pgTable("fids", {
  fid: bigint("fid", { mode: "number" }).primaryKey(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull()
    .defaultNow(),
  registeredAt: timestamp("registeredAt", { withTimezone: true }).notNull(),
  custodyAddress: bytea("custodyAddress").notNull(),
  recoveryAddress: bytea("recoveryAddress").notNull(),
});

export type Fid = typeof fids.$inferSelect;

export const signers = pgTable("signers", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull()
    .defaultNow(),
  addedAt: timestamp("addedAt", { withTimezone: true }).notNull(),
  removedAt: timestamp("removedAt", { withTimezone: true }),
  fid: bigint("fid", { mode: "number" }).notNull(),
  requesterFid: bigint("requesterFid", { mode: "number" }).notNull(),
  key: bytea("key").notNull(),
  keyType: integer("keyType").notNull(),
  metadata: json("metadata").notNull(),
  metadataType: integer("metadataType").notNull(),
});

export type Signer = typeof signers.$inferSelect;

export const storage = pgTable("storage", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull()
    .defaultNow(),
  rentedAt: timestamp("rentedAt", { withTimezone: true }).notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  fid: bigint("fid", { mode: "number" }).notNull(),
  units: integer("units").notNull(),
  payer: bytea("payer").notNull(),
});

export type Storage = typeof storage.$inferSelect;

export const hubs = pgTable("hubs", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull()
    .defaultNow(),
  gossipAddress: text("gossipAddress").notNull(),
  rpcAddress: text("rpcAddress").notNull(),
  excludedHashes: json("excludedHashes").notNull().default([]),
  count: integer("count").notNull(),
  hubVersion: text("hubVersion").notNull(),
  network: text("network").notNull(),
  appVersion: text("appVersion").notNull(),
  timestamp: bigint("timestamp", { mode: "number" }).notNull(),
});

export type Hub = typeof hubs.$inferSelect;
