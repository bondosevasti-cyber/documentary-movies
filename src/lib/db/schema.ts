import { pgTable, uuid, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';

export const categoryEnum = pgEnum('category', ['Articles', 'Films', 'Videos']);

export const articles = pgTable('articles', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  thumbnailUrl: text('thumbnail_url'),
  excerpt: text('excerpt'),
  content: text('content').notNull(), // Supports Markdown or HTML
  category: text('category').default('Articles'), // Using text for simplicity with current requirement
  isPublished: boolean('is_published').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
