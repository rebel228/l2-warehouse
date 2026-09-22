CREATE TYPE "equipmentSlot" AS ENUM('weapon', 'shield', 'helmet', 'chest', 'legs', 'gloves', 'boots', 'necklace', 'earring_left', 'earring_right', 'ring_left', 'ring_right');--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "weapon_type" varchar(50);--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "bodypart" varchar(50);--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "slot" "equipmentSlot";--> statement-breakpoint
CREATE UNIQUE INDEX "items_holder_slot_unique" ON "items" ("holder_id","slot") WHERE "slot" is not null;