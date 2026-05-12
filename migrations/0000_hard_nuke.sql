CREATE TYPE "public"."business_stage" AS ENUM('예비창업', '초기', '성장', '도약');--> statement-breakpoint
CREATE TYPE "public"."industry_sector" AS ENUM('IT_SW', '바이오_의료', '제조_하드웨어', '에너지_환경', '콘텐츠_미디어', '유통_물류', '교육', '금융_핀테크', '농업_식품', '기타');--> statement-breakpoint
CREATE TYPE "public"."program_status" AS ENUM('모집중', '모집예정', '모집마감');--> statement-breakpoint
CREATE TYPE "public"."support_type" AS ENUM('예비창업패키지', '초기창업패키지', '도약패키지', '창업도약패키지', '기술개발', '사업화지원', '멘토링_컨설팅', '시설_공간', '해외진출', '정책자금', '기타지원');--> statement-breakpoint
CREATE TYPE "public"."investor_type" AS ENUM('VC', 'AC', 'CVC', '엔젤', '정책금융');--> statement-breakpoint
CREATE TABLE "ai_recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"recommendations" jsonb NOT NULL,
	"profile_snapshot" jsonb NOT NULL,
	"model_used" varchar(100),
	"prompt_tokens" integer,
	"completion_tokens" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"program_type" varchar(20) NOT NULL,
	"program_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bookmarks_user_program_unique" UNIQUE("user_id","program_type","program_id")
);
--> statement-breakpoint
CREATE TABLE "business_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"company_name" varchar(200) NOT NULL,
	"business_stage" "business_stage" NOT NULL,
	"industry_sector" "industry_sector" NOT NULL,
	"region" varchar(100) NOT NULL,
	"employee_count" integer,
	"annual_revenue" varchar(100),
	"tech_field" varchar(300),
	"desired_funding" varchar(100),
	"business_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "business_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "crawl_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" varchar(50) NOT NULL,
	"status" varchar(20) NOT NULL,
	"programs_found" integer DEFAULT 0 NOT NULL,
	"programs_created" integer DEFAULT 0 NOT NULL,
	"programs_updated" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"duration_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "government_programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"organization" varchar(300),
	"support_type" "support_type" DEFAULT '기타지원' NOT NULL,
	"status" "program_status" DEFAULT '모집중' NOT NULL,
	"description" text,
	"target_audience" text,
	"support_amount" varchar(200),
	"application_method" text,
	"application_url" text,
	"region" varchar(100),
	"start_date" date,
	"end_date" date,
	"announcement_date" date,
	"required_documents" text,
	"selection_process" text,
	"support_details" text,
	"contact_info" text,
	"excluded_targets" text,
	"attachment_urls" text,
	"source_url" text,
	"source_id" varchar(200),
	"source" varchar(50) DEFAULT 'manual' NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investment_programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"organization" varchar(300),
	"investor_type" "investor_type" NOT NULL,
	"description" text,
	"investment_scale" varchar(200),
	"target_stage" varchar(200),
	"target_industry" varchar(300),
	"contact_info" text,
	"website_url" text,
	"application_url" text,
	"start_date" date,
	"end_date" date,
	"status" varchar(50) DEFAULT '모집중' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(300) NOT NULL,
	"name" varchar(200),
	"password_hash" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;