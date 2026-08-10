ALTER TYPE "public"."payment_provider" ADD VALUE 'paddle' BEFORE 'manual';--> statement-breakpoint
CREATE TABLE "segment_subscribers" (
	"serial" serial PRIMARY KEY NOT NULL,
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"segment_id" uuid NOT NULL,
	"subscriber_id" uuid NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "segment_subscribers_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "segments" (
	"serial" serial PRIMARY KEY NOT NULL,
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"criteria" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "segments_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "segment_subscribers" ADD CONSTRAINT "segment_subscribers_segment_id_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."segments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "segment_subscribers" ADD CONSTRAINT "segment_subscribers_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "segments" ADD CONSTRAINT "segments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "segment_subscribers_segment_idx" ON "segment_subscribers" USING btree ("segment_id");--> statement-breakpoint
CREATE INDEX "segment_subscribers_subscriber_idx" ON "segment_subscribers" USING btree ("subscriber_id");--> statement-breakpoint
CREATE UNIQUE INDEX "segment_subscribers_segment_subscriber_idx" ON "segment_subscribers" USING btree ("segment_id","subscriber_id");--> statement-breakpoint
CREATE INDEX "segments_project_idx" ON "segments" USING btree ("project_id");