CREATE TYPE "public"."topup_method" AS ENUM('paddle', 'usdc');--> statement-breakpoint
CREATE TYPE "public"."topup_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."usage_status" AS ENUM('completed', 'failed', 'partial');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"id_token" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"label" text DEFAULT 'Default' NOT NULL,
	"key_prefix" text NOT NULL,
	"key_hash" text NOT NULL,
	"rate_limit_rpm" integer DEFAULT 60 NOT NULL,
	"spend_limit_daily" numeric(10, 4),
	"spend_limit_monthly" numeric(10, 4),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "deposit_addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"chain" integer DEFAULT 8453 NOT NULL,
	"address" text NOT NULL,
	"derivation_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model_prices" (
	"model" text PRIMARY KEY NOT NULL,
	"display_name" text,
	"provider" text DEFAULT 'provider' NOT NULL,
	"ref_input" numeric(10, 6) NOT NULL,
	"ref_output" numeric(10, 6) NOT NULL,
	"provider_input" numeric(10, 6) NOT NULL,
	"provider_output" numeric(10, 6) NOT NULL,
	"user_input" numeric(10, 6) NOT NULL,
	"user_output" numeric(10, 6) NOT NULL,
	"discount_pct" numeric(5, 2) NOT NULL,
	"user_discount_pct" numeric(5, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"key_label" text NOT NULL,
	"key_prefix" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_health_check" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "topups" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"method" "topup_method" NOT NULL,
	"paddle_transaction_id" text,
	"usdc_tx_hash" text,
	"status" "topup_status" DEFAULT 'pending' NOT NULL,
	"fee" numeric(10, 4) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "usage_hourly" (
	"user_id" text NOT NULL,
	"hour_bucket" timestamp NOT NULL,
	"model" text NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"total_cost" numeric(12, 6) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_records" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"api_key_id" text NOT NULL,
	"model" text NOT NULL,
	"prompt_tokens" integer NOT NULL,
	"completion_tokens" integer NOT NULL,
	"reasoning_tokens" integer DEFAULT 0,
	"cost" numeric(12, 8) NOT NULL,
	"upstream_cost" numeric(12, 8) DEFAULT '0' NOT NULL,
	"request_id" text,
	"status" "usage_status" DEFAULT 'completed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"name" text,
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
CREATE TABLE "wallets" (
	"user_id" text PRIMARY KEY NOT NULL,
	"balance" numeric(12, 6) DEFAULT '0' NOT NULL,
	"held" numeric(12, 6) DEFAULT '0' NOT NULL,
	"total_loaded" numeric(12, 6) DEFAULT '0' NOT NULL,
	"total_spent" numeric(12, 6) DEFAULT '0' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposit_addresses" ADD CONSTRAINT "deposit_addresses_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topups" ADD CONSTRAINT "topups_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_hourly" ADD CONSTRAINT "usage_hourly_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_api_keys_hash" ON "api_keys" USING btree ("key_hash");--> statement-breakpoint
CREATE INDEX "idx_api_keys_user" ON "api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_deposit_address" ON "deposit_addresses" USING btree ("user_id","address");--> statement-breakpoint
CREATE INDEX "idx_deposit_addr" ON "deposit_addresses" USING btree ("address");--> statement-breakpoint
CREATE INDEX "idx_model_prices_provider" ON "model_prices" USING btree ("provider","is_active");--> statement-breakpoint
CREATE INDEX "idx_topups_user_created" ON "topups" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_topups_paddle" ON "topups" USING btree ("paddle_transaction_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_topups_usdc" ON "topups" USING btree ("usdc_tx_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_usage_hourly_pk" ON "usage_hourly" USING btree ("user_id","hour_bucket","model");--> statement-breakpoint
CREATE INDEX "idx_usage_user_created" ON "usage_records" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_usage_api_key" ON "usage_records" USING btree ("api_key_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_usage_model" ON "usage_records" USING btree ("model","created_at");