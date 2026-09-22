ALTER TABLE "items" ALTER COLUMN "slot" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "equipmentSlot";--> statement-breakpoint
CREATE TYPE "equipmentSlot" AS ENUM('weapon', 'offhand', 'helmet', 'chest', 'legs', 'gloves', 'boots', 'necklace', 'earring_left', 'earring_right', 'ring_left', 'ring_right');--> statement-breakpoint
ALTER TABLE "items" ALTER COLUMN "slot" SET DATA TYPE "equipmentSlot" USING "slot"::"equipmentSlot";