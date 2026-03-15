CREATE TABLE IF NOT EXISTS "candles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"intention" text NOT NULL,
	"for" varchar(255),
	"color" varchar(20) DEFAULT 'white',
	"lit" boolean DEFAULT true,
	"lit_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"prayer_count" integer DEFAULT 0,
	"last_prayed_at" timestamp,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "devotional_reads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"devotional_id" uuid NOT NULL,
	"read_at" timestamp DEFAULT now(),
	"notes" text,
	"bookmarked" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "devotionals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp NOT NULL,
	"scripture" text NOT NULL,
	"scripture_reference" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"reflection" text,
	"prayer" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"mood_focus" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255),
	"content" text NOT NULL,
	"ai_prompt" text,
	"mood" integer,
	"category" varchar(50) DEFAULT 'reflection',
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_encrypted" boolean DEFAULT true,
	"spiritual_milestone" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meditation_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"meditation_id" uuid NOT NULL,
	"duration" integer,
	"completed" boolean DEFAULT false,
	"notes" text,
	"mood_after" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meditations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(50) NOT NULL,
	"duration" integer NOT NULL,
	"audio_url" varchar(500),
	"script" text,
	"scripture" text,
	"thumbnail_url" varchar(500),
	"is_premium" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prayer_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(50) DEFAULT 'general',
	"priority" varchar(20) DEFAULT 'medium',
	"status" varchar(20) DEFAULT 'active',
	"answer_notes" text,
	"reminder_frequency" varchar(20),
	"last_prayed_at" timestamp,
	"answered_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "soundscape_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"soundscape_id" uuid NOT NULL,
	"duration" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "soundscapes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(50) NOT NULL,
	"audio_url" varchar(500) NOT NULL,
	"thumbnail_url" varchar(500),
	"duration" integer,
	"is_premium" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coaching_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"encrypted_milestone_data" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"therapeutic_method" varchar(50),
	"status" varchar(20) DEFAULT 'pending',
	"progress" integer DEFAULT 0,
	"target_date" timestamp,
	"completed_at" timestamp,
	"related_scriptures" jsonb DEFAULT '[]'::jsonb,
	"related_curriculum_items" jsonb DEFAULT '[]'::jsonb,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coaching_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"encrypted_plan_data" text NOT NULL,
	"plan_version" integer DEFAULT 1,
	"plan_status" varchar(20) DEFAULT 'active',
	"primary_focus" jsonb DEFAULT '[]'::jsonb,
	"secondary_focus" jsonb DEFAULT '[]'::jsonb,
	"therapeutic_methods" jsonb DEFAULT '[]'::jsonb,
	"overall_progress" integer DEFAULT 0,
	"goals_achieved" integer DEFAULT 0,
	"goals_total" integer DEFAULT 0,
	"last_review_at" timestamp,
	"next_review_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "coaching_plans_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversation_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"chat_session_id" uuid,
	"encrypted_insights" text NOT NULL,
	"emotional_themes" jsonb DEFAULT '[]'::jsonb,
	"spiritual_themes" jsonb DEFAULT '[]'::jsonb,
	"behavioral_themes" jsonb DEFAULT '[]'::jsonb,
	"overall_sentiment" real,
	"emotional_intensity" integer,
	"depression_indicators" boolean DEFAULT false,
	"anxiety_indicators" boolean DEFAULT false,
	"trauma_indicators" boolean DEFAULT false,
	"crisis_indicators" boolean DEFAULT false,
	"substance_indicators" boolean DEFAULT false,
	"progress_notes" text,
	"breakthrough_moments" jsonb DEFAULT '[]'::jsonb,
	"analyzed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "curriculum_modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(50) NOT NULL,
	"therapeutic_method" varchar(50),
	"spiritual_integration" varchar(50),
	"content" text NOT NULL,
	"exercises" jsonb DEFAULT '[]'::jsonb,
	"worksheets" jsonb DEFAULT '[]'::jsonb,
	"key_scriptures" jsonb DEFAULT '[]'::jsonb,
	"difficulty" varchar(20) DEFAULT 'beginner',
	"estimated_duration" integer,
	"order" integer DEFAULT 0,
	"is_premium" boolean DEFAULT false,
	"requires_plan" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_behavioral_patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"encrypted_patterns_data" text NOT NULL,
	"identified_triggers" jsonb DEFAULT '[]'::jsonb,
	"coping_strategies_used" jsonb DEFAULT '[]'::jsonb,
	"mood_patterns" jsonb DEFAULT '{}'::jsonb,
	"sleep_patterns" jsonb DEFAULT '{}'::jsonb,
	"social_patterns" jsonb DEFAULT '{}'::jsonb,
	"isolation_risk" integer,
	"relapse_risk" integer,
	"crisis_risk" integer,
	"last_pattern_analysis" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_behavioral_patterns_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_curriculum_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"module_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'locked',
	"completion_percentage" integer DEFAULT 0,
	"encrypted_exercise_responses" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"time_spent_minutes" integer DEFAULT 0,
	"user_reflections" text,
	"ai_feedback" text,
	"insights_gained" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_interaction_memory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"encrypted_memory_data" text NOT NULL,
	"preferred_communication_style" varchar(50),
	"response_to_scripture" varchar(20),
	"response_to_homework" varchar(20),
	"effective_interventions" jsonb DEFAULT '[]'::jsonb,
	"ineffective_approaches" jsonb DEFAULT '[]'::jsonb,
	"best_response_time" varchar(20),
	"crisis_response_pattern" varchar(20),
	"sensitive_topics" jsonb DEFAULT '[]'::jsonb,
	"last_updated" timestamp DEFAULT now(),
	CONSTRAINT "user_interaction_memory_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_psychological_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"encrypted_profile_data" text NOT NULL,
	"profile_version" integer DEFAULT 1,
	"last_analysis_at" timestamp,
	"profile_completeness" integer DEFAULT 0,
	"trust_level" integer DEFAULT 0,
	"conversations_analyzed" integer DEFAULT 0,
	"anxiety_level" integer,
	"depression_level" integer,
	"trauma_indicators" boolean DEFAULT false,
	"addiction_risk" integer,
	"dsm5_screeners" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_psychological_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"encrypted_relationship_data" text NOT NULL,
	"relationship_type" varchar(50) NOT NULL,
	"relationship_quality" integer,
	"is_supportive" boolean DEFAULT true,
	"is_toxic" boolean DEFAULT false,
	"contact_frequency" varchar(20),
	"last_contact_at" timestamp,
	"conflict_level" integer,
	"boundary_issues" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_spiritual_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"encrypted_profile_data" text NOT NULL,
	"denomination" varchar(100),
	"faith_journey_stage" varchar(50),
	"bible_reading_streak" integer DEFAULT 0,
	"prayer_streak" integer DEFAULT 0,
	"last_devotional_at" timestamp,
	"last_prayer_at" timestamp,
	"scripture_engagement_score" integer DEFAULT 0,
	"comfort_scriptures" jsonb DEFAULT '[]'::jsonb,
	"struggle_areas" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_spiritual_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_substance_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"encrypted_profile_data" text NOT NULL,
	"has_substance_history" boolean DEFAULT false,
	"in_recovery" boolean DEFAULT false,
	"recovery_days" integer,
	"twelve_step_participation" boolean DEFAULT false,
	"step_work_progress" integer DEFAULT 0,
	"has_sponsor" boolean DEFAULT false,
	"relapse_risk_level" varchar(20),
	"last_relapse_at" timestamp,
	"support_group_attendance" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_substance_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "candles" ADD CONSTRAINT "candles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "devotional_reads" ADD CONSTRAINT "devotional_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "devotional_reads" ADD CONSTRAINT "devotional_reads_devotional_id_devotionals_id_fk" FOREIGN KEY ("devotional_id") REFERENCES "devotionals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meditation_sessions" ADD CONSTRAINT "meditation_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meditation_sessions" ADD CONSTRAINT "meditation_sessions_meditation_id_meditations_id_fk" FOREIGN KEY ("meditation_id") REFERENCES "meditations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prayer_requests" ADD CONSTRAINT "prayer_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "soundscape_sessions" ADD CONSTRAINT "soundscape_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "soundscape_sessions" ADD CONSTRAINT "soundscape_sessions_soundscape_id_soundscapes_id_fk" FOREIGN KEY ("soundscape_id") REFERENCES "soundscapes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coaching_milestones" ADD CONSTRAINT "coaching_milestones_plan_id_coaching_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "coaching_plans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coaching_plans" ADD CONSTRAINT "coaching_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversation_insights" ADD CONSTRAINT "conversation_insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_behavioral_patterns" ADD CONSTRAINT "user_behavioral_patterns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_curriculum_progress" ADD CONSTRAINT "user_curriculum_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_curriculum_progress" ADD CONSTRAINT "user_curriculum_progress_module_id_curriculum_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "curriculum_modules"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_interaction_memory" ADD CONSTRAINT "user_interaction_memory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_psychological_profile" ADD CONSTRAINT "user_psychological_profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_relationships" ADD CONSTRAINT "user_relationships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_spiritual_profile" ADD CONSTRAINT "user_spiritual_profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_substance_profile" ADD CONSTRAINT "user_substance_profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
