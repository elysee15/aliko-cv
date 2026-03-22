CREATE TYPE "public"."source_type" AS ENUM('web', 'telegram', 'api', 'import');--> statement-breakpoint
ALTER TABLE "resume" ALTER COLUMN "accent_color" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "resume" ALTER COLUMN "font_family" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "resume_entry" ADD COLUMN "source" "source_type" DEFAULT 'web' NOT NULL;--> statement-breakpoint
ALTER TABLE "resume_section" ADD COLUMN "source" "source_type" DEFAULT 'web' NOT NULL;--> statement-breakpoint
CREATE INDEX "resume_slug_status_idx" ON "resume" USING btree ("slug","status");--> statement-breakpoint
CREATE INDEX "resumeEntry_source_createdAt_idx" ON "resume_entry" USING btree ("source","created_at");