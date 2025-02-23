CREATE TABLE "simulation_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"simulation_id" integer NOT NULL,
	"chargePoints" integer NOT NULL,
	"consumptionPer100Km" integer NOT NULL,
	"chargePointWatts" integer NOT NULL,
	"arrivalMultiplied" double precision NOT NULL
);
--> statement-breakpoint
ALTER TABLE "simulation_settings" ADD CONSTRAINT "simulation_settings_id_fk" FOREIGN KEY ("simulation_id") REFERENCES "public"."simulations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "simulation_id_index" ON "simulation_settings" USING btree ("simulation_id");--> statement-breakpoint
ALTER TABLE "arrival_probabilities" ADD CONSTRAINT "simulation_id_fk" FOREIGN KEY ("simulation_id") REFERENCES "public"."simulations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_probabilities" ADD CONSTRAINT "simulation_id_fk" FOREIGN KEY ("simulation_id") REFERENCES "public"."simulations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "simulation_id_arr_index" ON "arrival_probabilities" USING btree ("simulation_id");--> statement-breakpoint
CREATE INDEX "simulation_id_demand_index" ON "demand_probabilities" USING btree ("simulation_id");