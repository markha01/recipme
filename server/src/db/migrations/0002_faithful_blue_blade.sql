CREATE TABLE IF NOT EXISTS "recipe_boards" (
	"recipe_id" uuid NOT NULL,
	"board_id" uuid NOT NULL,
	CONSTRAINT "recipe_boards_recipe_id_board_id_pk" PRIMARY KEY("recipe_id","board_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipes" DROP CONSTRAINT "recipes_board_id_boards_id_fk";
EXCEPTION
 WHEN undefined_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_boards" ADD CONSTRAINT "recipe_boards_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_boards" ADD CONSTRAINT "recipe_boards_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_boards_board_idx" ON "recipe_boards" USING btree ("board_id");--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN IF EXISTS "board_id";