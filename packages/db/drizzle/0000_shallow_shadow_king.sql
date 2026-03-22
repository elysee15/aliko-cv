CREATE TYPE "public"."resume_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."resume_template" AS ENUM('classic', 'modern', 'minimal', 'executive', 'creative', 'compact');--> statement-breakpoint
CREATE TYPE "public"."section_type" AS ENUM('experience', 'education', 'skills', 'languages', 'projects', 'certifications', 'volunteering', 'interests', 'custom');--> statement-breakpoint
CREATE TYPE "public"."webhook_event" AS ENUM('resume.created', 'resume.updated', 'resume.deleted', 'resume.published', 'resume.exported');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('wishlist', 'applied', 'interview', 'offer', 'rejected', 'archived');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text,
	"phone" text,
	"website" text,
	"linkedin" text,
	"github" text,
	"template" "resume_template" DEFAULT 'classic' NOT NULL,
	"accent_color" text DEFAULT '#6366f1',
	"font_family" text DEFAULT 'inter',
	"status" "resume_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"section_id" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"organization" text,
	"location" text,
	"start_date" date,
	"end_date" date,
	"current" boolean DEFAULT false NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume_section" (
	"id" text PRIMARY KEY NOT NULL,
	"resume_id" text NOT NULL,
	"type" "section_type" NOT NULL,
	"title" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_key" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"key_hash" text NOT NULL,
	"key_prefix" text NOT NULL,
	"last_used_at" timestamp,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "api_key_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "telegram_link" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"chat_id" bigint NOT NULL,
	"username" text,
	"linked_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "telegram_link_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "telegram_link_chat_id_unique" UNIQUE("chat_id")
);
--> statement-breakpoint
CREATE TABLE "telegram_link_token" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "telegram_link_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "portfolio_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"slug" text NOT NULL,
	"headline" text,
	"bio" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "portfolio_settings_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "portfolio_settings_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cover_letter" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"resume_id" text,
	"title" text NOT NULL,
	"company" text,
	"job_title" text,
	"content" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"url" text NOT NULL,
	"secret" text NOT NULL,
	"events" text[] NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_triggered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "section_comment" (
	"id" text PRIMARY KEY NOT NULL,
	"section_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_application" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"resume_id" text,
	"cover_letter_id" text,
	"company" text NOT NULL,
	"job_title" text NOT NULL,
	"job_url" text,
	"status" "application_status" DEFAULT 'wishlist' NOT NULL,
	"applied_at" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume" ADD CONSTRAINT "resume_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_entry" ADD CONSTRAINT "resume_entry_section_id_resume_section_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."resume_section"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_section" ADD CONSTRAINT "resume_section_resume_id_resume_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resume"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telegram_link" ADD CONSTRAINT "telegram_link_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telegram_link_token" ADD CONSTRAINT "telegram_link_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_settings" ADD CONSTRAINT "portfolio_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cover_letter" ADD CONSTRAINT "cover_letter_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cover_letter" ADD CONSTRAINT "cover_letter_resume_id_resume_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resume"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook" ADD CONSTRAINT "webhook_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_comment" ADD CONSTRAINT "section_comment_section_id_resume_section_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."resume_section"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_comment" ADD CONSTRAINT "section_comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_resume_id_resume_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resume"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_cover_letter_id_cover_letter_id_fk" FOREIGN KEY ("cover_letter_id") REFERENCES "public"."cover_letter"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "resume_userId_idx" ON "resume" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "resume_slug_userId_idx" ON "resume" USING btree ("slug","user_id");--> statement-breakpoint
CREATE INDEX "resumeEntry_sectionId_idx" ON "resume_entry" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "resumeSection_resumeId_idx" ON "resume_section" USING btree ("resume_id");--> statement-breakpoint
CREATE INDEX "apiKey_userId_idx" ON "api_key" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "apiKey_keyHash_idx" ON "api_key" USING btree ("key_hash");--> statement-breakpoint
CREATE INDEX "telegramLink_userId_idx" ON "telegram_link" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "telegramLink_chatId_idx" ON "telegram_link" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "telegramLinkToken_token_idx" ON "telegram_link_token" USING btree ("token");--> statement-breakpoint
CREATE INDEX "portfolioSettings_userId_idx" ON "portfolio_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "portfolioSettings_slug_idx" ON "portfolio_settings" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "coverLetter_userId_idx" ON "cover_letter" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "coverLetter_resumeId_idx" ON "cover_letter" USING btree ("resume_id");--> statement-breakpoint
CREATE INDEX "webhook_userId_idx" ON "webhook" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sectionComment_sectionId_idx" ON "section_comment" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "sectionComment_userId_idx" ON "section_comment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "jobApplication_userId_idx" ON "job_application" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "jobApplication_status_idx" ON "job_application" USING btree ("user_id","status");