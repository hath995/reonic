CREATE TABLE "charging_port_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"simulation_id" integer NOT NULL,
	"charge_port_id" integer NOT NULL,
	"car_id" integer NOT NULL,
	"demand_kw" double precision NOT NULL,
	"ts" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "charge_ports" DROP CONSTRAINT "car_id_fk";
--> statement-breakpoint
ALTER TABLE "charge_ports" ADD COLUMN "local_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "charging_port_records" ADD CONSTRAINT "simulation_id_fk" FOREIGN KEY ("simulation_id") REFERENCES "public"."simulations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charging_port_records" ADD CONSTRAINT "car_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charging_port_records" ADD CONSTRAINT "charge_port_id_fk" FOREIGN KEY ("charge_port_id") REFERENCES "public"."charge_ports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "simulation_id_cp_record_index" ON "charging_port_records" USING btree ("simulation_id");--> statement-breakpoint
CREATE INDEX "charge_port_ts_index" ON "charging_port_records" USING btree ("ts");--> statement-breakpoint
ALTER TABLE "charge_ports" DROP COLUMN "car_id";--> statement-breakpoint
ALTER TABLE "charge_ports" DROP COLUMN "demand_kw";--> statement-breakpoint
ALTER TABLE "charge_ports" DROP COLUMN "ts";