CREATE TABLE "simulation_resumption" (
	"id" serial PRIMARY KEY NOT NULL,
	"simulation_id" integer NOT NULL,
	"ts" timestamp NOT NULL,
	"seed" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "simulation_resumption" ADD CONSTRAINT "simulation_id_fk" FOREIGN KEY ("simulation_id") REFERENCES "public"."simulations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "simulation_id_resumption_index" ON "simulation_resumption" USING btree ("simulation_id");--> statement-breakpoint
CREATE INDEX "simulation_id_resumption_ts_index" ON "simulation_resumption" USING btree ("ts");