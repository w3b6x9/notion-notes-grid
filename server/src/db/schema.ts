
import { serial, text, pgTable, timestamp, integer } from 'drizzle-orm/pg-core';

export const notesTable = pgTable('notes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  position_x: integer('position_x').notNull().default(0),
  position_y: integer('position_y').notNull().default(0),
  width: integer('width').notNull().default(300),
  height: integer('height').notNull().default(200),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type Note = typeof notesTable.$inferSelect;
export type NewNote = typeof notesTable.$inferInsert;

// Export all tables for proper query building
export const tables = { notes: notesTable };
