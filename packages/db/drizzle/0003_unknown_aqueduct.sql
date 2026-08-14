CREATE TYPE "public"."moderation_verdict" AS ENUM('clean', 'review', 'block');--> statement-breakpoint
CREATE TYPE "public"."newsletter_send_status" AS ENUM('sent', 'blocked_rate_limit', 'blocked_no_recipients', 'blocked_moderation', 'error');--> statement-breakpoint
CREATE TABLE "newsletter_send_logs" (
	"serial" serial PRIMARY KEY NOT NULL,
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"api_key_id" uuid NOT NULL,
	"subject" text NOT NULL,
	"recipient_count" integer DEFAULT 0 NOT NULL,
	"skipped_non_subscribers" integer DEFAULT 0 NOT NULL,
	"status" "newsletter_send_status" NOT NULL,
	"moderation_verdict" "moderation_verdict",
	"moderation_category" text,
	"moderation_reason" text,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_send_logs_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "newsletter_send_logs" ADD CONSTRAINT "newsletter_send_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_send_logs" ADD CONSTRAINT "newsletter_send_logs_api_key_id_project_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."project_api_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "newsletter_send_logs_project_idx" ON "newsletter_send_logs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "newsletter_send_logs_created_at_idx" ON "newsletter_send_logs" USING btree ("created_at");