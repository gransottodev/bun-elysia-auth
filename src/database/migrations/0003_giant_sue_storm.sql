CREATE TABLE "user_services" (
	"id" text NOT NULL,
	"user_id" text NOT NULL,
	"service_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "user_services_user_id_service_id_pk" PRIMARY KEY("user_id","service_id")
);
--> statement-breakpoint
ALTER TABLE "user_services" ADD CONSTRAINT "user_services_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_services" ADD CONSTRAINT "user_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;