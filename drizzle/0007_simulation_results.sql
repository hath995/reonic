CREATE TABLE "cars" (
	"id" serial PRIMARY KEY NOT NULL,
	"simulation_id" integer NOT NULL,
	"demand" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "charge_ports" (
	"id" serial PRIMARY KEY NOT NULL,
	"simulation_id" integer NOT NULL,
	"car_id" integer NOT NULL,
	"demand_kw" double precision NOT NULL,
	"ts" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "simulations" ALTER COLUMN "seed" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "simulation_id_fk" FOREIGN KEY ("simulation_id") REFERENCES "public"."simulations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_ports" ADD CONSTRAINT "simulation_id_fk" FOREIGN KEY ("simulation_id") REFERENCES "public"."simulations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_ports" ADD CONSTRAINT "car_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "simulation_id_car_index" ON "cars" USING btree ("simulation_id");--> statement-breakpoint
CREATE INDEX "simulation_id_cp_index" ON "charge_ports" USING btree ("simulation_id");