ALTER TABLE "charging_port_records" DROP CONSTRAINT "car_id_fk";
--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'cars'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "cars" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "cars" ALTER COLUMN "id" SET DATA TYPE integer;