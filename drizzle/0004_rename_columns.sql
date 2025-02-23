ALTER TABLE "arrival_probabilities" RENAME COLUMN "periodStart" TO "period_start";--> statement-breakpoint
ALTER TABLE "arrival_probabilities" RENAME COLUMN "periodEnd" TO "period_end";--> statement-breakpoint
ALTER TABLE "simulation_settings" ADD COLUMN "settings" json;--> statement-breakpoint
ALTER TABLE "simulation_settings" DROP COLUMN "chargePoints";--> statement-breakpoint
ALTER TABLE "simulation_settings" DROP COLUMN "consumptionPer100Km";--> statement-breakpoint
ALTER TABLE "simulation_settings" DROP COLUMN "chargePointWatts";--> statement-breakpoint
ALTER TABLE "simulation_settings" DROP COLUMN "arrivalMultiplied";