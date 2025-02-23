ALTER TABLE "arrival_probabilities" RENAME COLUMN "time" TO "periodStart";--> statement-breakpoint
ALTER TABLE "arrival_probabilities" ADD COLUMN "periodEnd" time NOT NULL;