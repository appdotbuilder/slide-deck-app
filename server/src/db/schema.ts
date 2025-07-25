
import { serial, text, pgTable, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const slideDecksTable = pgTable('slide_decks', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const slidesTable = pgTable('slides', {
  id: serial('id').primaryKey(),
  deck_id: integer('deck_id').notNull().references(() => slideDecksTable.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  body_text: text('body_text'), // Nullable by default
  image_url: text('image_url'), // Nullable by default
  slide_order: integer('slide_order').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Relations for proper query building
export const slideDecksRelations = relations(slideDecksTable, ({ many }) => ({
  slides: many(slidesTable),
}));

export const slidesRelations = relations(slidesTable, ({ one }) => ({
  deck: one(slideDecksTable, {
    fields: [slidesTable.deck_id],
    references: [slideDecksTable.id],
  }),
}));

// TypeScript types for the table schemas
export type SlideDeck = typeof slideDecksTable.$inferSelect;
export type NewSlideDeck = typeof slideDecksTable.$inferInsert;
export type Slide = typeof slidesTable.$inferSelect;
export type NewSlide = typeof slidesTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = { 
  slideDecks: slideDecksTable, 
  slides: slidesTable 
};
