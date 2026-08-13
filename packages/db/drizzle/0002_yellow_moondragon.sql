CREATE TYPE "public"."user_plan" AS ENUM('hobby', 'professional', 'business', 'enterprise');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan" "user_plan" DEFAULT 'hobby' NOT NULL;