CREATE TABLE "typing_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"wpm" numeric(5, 2) NOT NULL,
	"accuracy" numeric(5, 2) NOT NULL,
	"time_elapsed" integer NOT NULL,
	"total_characters" integer NOT NULL,
	"correct_characters" integer NOT NULL,
	"errors" integer NOT NULL,
	"text_source" text NOT NULL,
	"text_content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "typing_tests" ADD CONSTRAINT "typing_tests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;