CREATE TABLE "casts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"deletedAt" timestamp with time zone,
	"prunedAt" timestamp with time zone,
	"fid" bigint NOT NULL,
	"parentFid" bigint,
	"hash" "bytea" NOT NULL,
	"rootParentHash" "bytea",
	"parentHash" "bytea",
	"rootParentUrl" text,
	"parentUrl" text,
	"text" text NOT NULL,
	"embeds" json DEFAULT '[]'::json NOT NULL,
	"mentions" json DEFAULT '[]'::json NOT NULL,
	"mentionsPositions" json DEFAULT '[]'::json NOT NULL,
	CONSTRAINT "casts_hash_unique" UNIQUE("hash")
);
--> statement-breakpoint
CREATE TABLE "fids" (
	"fid" bigint PRIMARY KEY NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"registeredAt" timestamp with time zone NOT NULL,
	"custodyAddress" "bytea" NOT NULL,
	"recoveryAddress" "bytea" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hubs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"gossipAddress" text NOT NULL,
	"rpcAddress" text NOT NULL,
	"excludedHashes" json DEFAULT '[]'::json NOT NULL,
	"count" integer NOT NULL,
	"hubVersion" text NOT NULL,
	"network" text NOT NULL,
	"appVersion" text NOT NULL,
	"timestamp" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"deletedAt" timestamp with time zone,
	"prunedAt" timestamp with time zone,
	"fid" bigint NOT NULL,
	"targetFid" bigint,
	"displayTimestamp" timestamp with time zone,
	"type" text NOT NULL,
	"hash" "bytea" NOT NULL,
	CONSTRAINT "links_hash_unique" UNIQUE("hash")
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"deletedAt" timestamp with time zone,
	"prunedAt" timestamp with time zone,
	"fid" bigint NOT NULL,
	"targetCastFid" bigint,
	"type" integer NOT NULL,
	"hash" "bytea" NOT NULL,
	"targetCastHash" "bytea",
	"targetUrl" text,
	CONSTRAINT "reactions_hash_unique" UNIQUE("hash")
);
--> statement-breakpoint
CREATE TABLE "signers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"addedAt" timestamp with time zone NOT NULL,
	"removedAt" timestamp with time zone,
	"fid" bigint NOT NULL,
	"requesterFid" bigint NOT NULL,
	"key" "bytea" NOT NULL,
	"keyType" integer NOT NULL,
	"metadata" json NOT NULL,
	"metadataType" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "storage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"rentedAt" timestamp with time zone NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"fid" bigint NOT NULL,
	"units" integer NOT NULL,
	"payer" "bytea" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userData" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"deletedAt" timestamp with time zone,
	"fid" bigint NOT NULL,
	"type" integer NOT NULL,
	"hash" "bytea" NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "userData_hash_unique" UNIQUE("hash"),
	CONSTRAINT "userData_fid_type_unique" UNIQUE("fid","type")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"deletedAt" timestamp with time zone,
	"fid" bigint NOT NULL,
	"hash" "bytea" NOT NULL,
	"signerAddress" "bytea" NOT NULL,
	"blockHash" "bytea" NOT NULL,
	"signature" "bytea" NOT NULL,
	CONSTRAINT "verifications_hash_unique" UNIQUE("hash")
);
