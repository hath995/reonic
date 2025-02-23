CREATE TABLE "arrival_probabilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"simulation_id" integer NOT NULL,
	"time" time NOT NULL,
	"probability" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demand_probabilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"simulation_id" integer NOT NULL,
	"demand" integer NOT NULL,
	"probability" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "simulations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255)
);
