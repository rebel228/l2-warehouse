CREATE TYPE "itemEventType" AS ENUM('item_created', 'item_deleted', 'owner_change', 'reassignment', 'transfer');--> statement-breakpoint
CREATE TABLE "item_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "item_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"item_id" integer NOT NULL,
	"type" "itemEventType" NOT NULL,
	"from_owner_user_id" integer,
	"to_owner_user_id" integer,
	"from_assigned_id" integer,
	"to_assigned_id" integer,
	"from_holder_id" integer,
	"to_holder_id" integer,
	"changed_by_user_id" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "item_events_item_id_idx" ON "item_events" ("item_id");--> statement-breakpoint
CREATE INDEX "item_events_created_at_id_idx" ON "item_events" ("created_at","id");--> statement-breakpoint
ALTER TABLE "item_events" ADD CONSTRAINT "item_events_from_owner_user_id_users_id_fkey" FOREIGN KEY ("from_owner_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "item_events" ADD CONSTRAINT "item_events_to_owner_user_id_users_id_fkey" FOREIGN KEY ("to_owner_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "item_events" ADD CONSTRAINT "item_events_from_assigned_id_characters_id_fkey" FOREIGN KEY ("from_assigned_id") REFERENCES "characters"("id");--> statement-breakpoint
ALTER TABLE "item_events" ADD CONSTRAINT "item_events_to_assigned_id_characters_id_fkey" FOREIGN KEY ("to_assigned_id") REFERENCES "characters"("id");--> statement-breakpoint
ALTER TABLE "item_events" ADD CONSTRAINT "item_events_from_holder_id_characters_id_fkey" FOREIGN KEY ("from_holder_id") REFERENCES "characters"("id");--> statement-breakpoint
ALTER TABLE "item_events" ADD CONSTRAINT "item_events_to_holder_id_characters_id_fkey" FOREIGN KEY ("to_holder_id") REFERENCES "characters"("id");--> statement-breakpoint
ALTER TABLE "item_events" ADD CONSTRAINT "item_events_changed_by_user_id_users_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id");