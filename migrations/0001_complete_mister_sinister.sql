ALTER TABLE "users" ADD COLUMN "recovery_code" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_recovery_code_unique" UNIQUE("recovery_code");