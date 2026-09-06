CREATE TYPE "item_grade" AS ENUM('NG', 'D', 'C', 'B', 'A', 'S');--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "grade" "item_grade" DEFAULT 'D'::"item_grade" NOT NULL;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "enchant_level" integer DEFAULT 0 NOT NULL;