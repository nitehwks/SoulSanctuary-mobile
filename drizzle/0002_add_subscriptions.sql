-- Add missing subscription tables

CREATE TABLE IF NOT EXISTS "user_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL UNIQUE,
	"tier" varchar(50) DEFAULT 'free' NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"trial_ends_at" timestamp,
	"is_trial" boolean DEFAULT false,
	"cancel_at_period_end" boolean DEFAULT false,
	"canceled_at" timestamp,
	"provider" varchar(50),
	"provider_subscription_id" varchar(255),
	"provider_customer_id" varchar(255),
	"features" jsonb DEFAULT '{"aiChat":true,"moodTracking":true,"basicCoaching":true,"advancedCoaching":false,"curriculum":false,"comprehensivePlan":false,"memoryInsights":false,"unlimitedAI":false,"prioritySupport":false,"familySharing":false}',
	"monthly_ai_usage" integer DEFAULT 0,
	"monthly_ai_limit" integer DEFAULT 50,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "subscription_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"previous_tier" varchar(50),
	"new_tier" varchar(50),
	"previous_status" varchar(50),
	"new_status" varchar(50),
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);

DO $$ BEGIN
 ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
