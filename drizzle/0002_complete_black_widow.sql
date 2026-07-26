CREATE TABLE "specification_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"field_id" uuid NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "specification_values_field_id_value_unique" UNIQUE NULLS NOT DISTINCT("field_id","value")
);
--> statement-breakpoint
DROP INDEX "device_specs_field_value_idx";--> statement-breakpoint
ALTER TABLE "device_specifications" ADD COLUMN "value_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "specification_values" ADD CONSTRAINT "specification_values_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specification_values" ADD CONSTRAINT "specification_values_field_id_specification_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."specification_fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_specifications" ADD CONSTRAINT "device_specifications_value_id_specification_values_id_fk" FOREIGN KEY ("value_id") REFERENCES "public"."specification_values"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_specifications" DROP COLUMN "value";