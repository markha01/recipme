import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  timestamp,
  primaryKey,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 30 }).notNull().unique(),
  displayName: varchar('display_name', { length: 50 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const boards = pgTable(
  'boards',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    uniqueUserBoard: unique().on(t.userId, t.name),
  })
);

export const recipes = pgTable(
  'recipes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 200 }).notNull(),
    imageUrl: text('image_url'),
    servings: integer('servings'),
    prepTimeMin: integer('prep_time_min'),
    cookTimeMin: integer('cook_time_min'),
    instructions: text('instructions'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    userCreatedAtIdx: index('recipes_user_created_at_idx').on(
      t.userId,
      t.createdAt
    ),
  })
);

export const recipeBoards = pgTable(
  'recipe_boards',
  {
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    boardId: uuid('board_id')
      .notNull()
      .references(() => boards.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.recipeId, t.boardId] }),
    boardIdx: index('recipe_boards_board_idx').on(t.boardId),
  })
);

export const ingredients = pgTable(
  'ingredients',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    sortOrder: integer('sort_order').notNull(),
    text: text('text').notNull(),
  },
  (t) => ({
    recipeOrderIdx: index('ingredients_recipe_order_idx').on(
      t.recipeId,
      t.sortOrder
    ),
  })
);

export const tags = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 50 }).notNull(),
}, (t) => ({
  uniqueUserTag: unique().on(t.userId, t.name),
}));

export const recipeTags = pgTable(
  'recipe_tags',
  {
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.recipeId, t.tagId] }),
    tagIdx: index('recipe_tags_tag_idx').on(t.tagId),
  })
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  boards: many(boards),
  recipes: many(recipes),
  tags: many(tags),
}));

export const boardsRelations = relations(boards, ({ one, many }) => ({
  user: one(users, { fields: [boards.userId], references: [users.id] }),
  recipeBoards: many(recipeBoards),
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  user: one(users, { fields: [recipes.userId], references: [users.id] }),
  recipeBoards: many(recipeBoards),
  ingredients: many(ingredients),
  recipeTags: many(recipeTags),
}));

export const recipeBoardsRelations = relations(recipeBoards, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeBoards.recipeId],
    references: [recipes.id],
  }),
  board: one(boards, {
    fields: [recipeBoards.boardId],
    references: [boards.id],
  }),
}));

export const ingredientsRelations = relations(ingredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [ingredients.recipeId],
    references: [recipes.id],
  }),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, { fields: [tags.userId], references: [users.id] }),
  recipeTags: many(recipeTags),
}));

export const recipeTagsRelations = relations(recipeTags, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeTags.recipeId],
    references: [recipes.id],
  }),
  tag: one(tags, { fields: [recipeTags.tagId], references: [tags.id] }),
}));
