CREATE TYPE "itemStatus" AS ENUM('in_bank', 'assigned', 'held');--> statement-breakpoint
CREATE TYPE "userRole" AS ENUM('member', 'admin', 'superadmin');--> statement-breakpoint
CREATE TABLE "characters" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "characters_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"class" varchar(255) NOT NULL,
	"user_id" integer NOT NULL,
	"clan_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clans" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "clans_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"image_url" varchar(500),
	"status" "itemStatus" DEFAULT 'in_bank'::"itemStatus" NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"owner_user_id" integer,
	"owner_clan_id" integer,
	"assigned_id" integer,
	"holder_id" integer
);
--> statement-breakpoint
CREATE TABLE "reassignments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reassignments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"item_id" integer NOT NULL,
	"from_assigned_id" integer,
	"to_assigned_id" integer,
	"changed_by_user_id" integer NOT NULL,
	"reassigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transfers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "transfers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"item_id" integer NOT NULL,
	"from_holder_id" integer,
	"to_holder_id" integer,
	"changed_by_user_id" integer NOT NULL,
	"transferred_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"role" "userRole" DEFAULT 'member'::"userRole" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "characters_user_id_idx" ON "characters" ("user_id");--> statement-breakpoint
CREATE INDEX "characters_clan_id_idx" ON "characters" ("clan_id");--> statement-breakpoint
CREATE INDEX "items_owner_user_id_idx" ON "items" ("owner_user_id");--> statement-breakpoint
CREATE INDEX "items_owner_clan_id_idx" ON "items" ("owner_clan_id");--> statement-breakpoint
CREATE INDEX "items_assigned_id_idx" ON "items" ("assigned_id");--> statement-breakpoint
CREATE INDEX "items_holder_id_idx" ON "items" ("holder_id");--> statement-breakpoint
CREATE INDEX "items_status_idx" ON "items" ("status");--> statement-breakpoint
CREATE INDEX "reassignments_item_id_idx" ON "reassignments" ("item_id");--> statement-breakpoint
CREATE INDEX "reassignments_from_assigned_id_idx" ON "reassignments" ("from_assigned_id");--> statement-breakpoint
CREATE INDEX "reassignments_to_assigned_id_idx" ON "reassignments" ("to_assigned_id");--> statement-breakpoint
CREATE INDEX "transfers_item_id_idx" ON "transfers" ("item_id");--> statement-breakpoint
CREATE INDEX "transfers_from_holder_id_idx" ON "transfers" ("from_holder_id");--> statement-breakpoint
CREATE INDEX "transfers_to_holder_id_idx" ON "transfers" ("to_holder_id");--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_clan_id_clans_id_fkey" FOREIGN KEY ("clan_id") REFERENCES "clans"("id");--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_owner_user_id_users_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_owner_clan_id_clans_id_fkey" FOREIGN KEY ("owner_clan_id") REFERENCES "clans"("id");--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_assigned_id_characters_id_fkey" FOREIGN KEY ("assigned_id") REFERENCES "characters"("id");--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_holder_id_characters_id_fkey" FOREIGN KEY ("holder_id") REFERENCES "characters"("id");--> statement-breakpoint
ALTER TABLE "reassignments" ADD CONSTRAINT "reassignments_item_id_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id");--> statement-breakpoint
ALTER TABLE "reassignments" ADD CONSTRAINT "reassignments_from_assigned_id_characters_id_fkey" FOREIGN KEY ("from_assigned_id") REFERENCES "characters"("id");--> statement-breakpoint
ALTER TABLE "reassignments" ADD CONSTRAINT "reassignments_to_assigned_id_characters_id_fkey" FOREIGN KEY ("to_assigned_id") REFERENCES "characters"("id");--> statement-breakpoint
ALTER TABLE "reassignments" ADD CONSTRAINT "reassignments_changed_by_user_id_users_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_item_id_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id");--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_from_holder_id_characters_id_fkey" FOREIGN KEY ("from_holder_id") REFERENCES "characters"("id");--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_to_holder_id_characters_id_fkey" FOREIGN KEY ("to_holder_id") REFERENCES "characters"("id");--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_changed_by_user_id_users_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id");