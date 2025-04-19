CREATE TABLE "casts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone,
	"pruned_at" timestamp with time zone,
	"fid" bigint NOT NULL,
	"parent_fid" bigint,
	"hash" "bytea" NOT NULL,
	"root_parent_hash" "bytea",
	"parent_hash" "bytea",
	"root_parent_url" text,
	"parent_url" text,
	"text" text NOT NULL,
	"embeds" json DEFAULT '[]'::json NOT NULL,
	"mentions" json DEFAULT '[]'::json NOT NULL,
	"mentions_positions" json DEFAULT '[]'::json NOT NULL,
	CONSTRAINT "casts_hash_unique" UNIQUE("hash")
);
--> statement-breakpoint
CREATE TABLE "fids" (
	"fid" bigint PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"registered_at" timestamp with time zone NOT NULL,
	"custody_address" "bytea" NOT NULL,
	"recovery_address" "bytea" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hubs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"gossip_address" text NOT NULL,
	"rpc_address" text NOT NULL,
	"excluded_hashes" json DEFAULT '[]'::json NOT NULL,
	"count" integer NOT NULL,
	"hub_version" text NOT NULL,
	"network" text NOT NULL,
	"app_version" text NOT NULL,
	"timestamp" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone,
	"pruned_at" timestamp with time zone,
	"fid" bigint NOT NULL,
	"target_fid" bigint,
	"display_timestamp" timestamp with time zone,
	"type" text NOT NULL,
	"hash" "bytea" NOT NULL,
	CONSTRAINT "links_hash_unique" UNIQUE("hash")
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone,
	"pruned_at" timestamp with time zone,
	"fid" bigint NOT NULL,
	"target_cast_fid" bigint,
	"type" integer NOT NULL,
	"hash" "bytea" NOT NULL,
	"target_cast_hash" "bytea",
	"target_url" text,
	CONSTRAINT "reactions_hash_unique" UNIQUE("hash")
);
--> statement-breakpoint
CREATE TABLE "signers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"added_at" timestamp with time zone NOT NULL,
	"removed_at" timestamp with time zone,
	"fid" bigint NOT NULL,
	"requester_fid" bigint NOT NULL,
	"key" "bytea" NOT NULL,
	"key_type" integer NOT NULL,
	"metadata" json NOT NULL,
	"metadata_type" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "storage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"rented_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"fid" bigint NOT NULL,
	"units" integer NOT NULL,
	"payer" "bytea" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userData" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone,
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone,
	"fid" bigint NOT NULL,
	"hash" "bytea" NOT NULL,
	"signer_address" "bytea" NOT NULL,
	"block_hash" "bytea" NOT NULL,
	"signature" "bytea" NOT NULL,
	CONSTRAINT "verifications_hash_unique" UNIQUE("hash")
);
