import { z } from "zod";
import { pgTable, serial, text, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Game state and statistics types
export const gameStateSchema = z.object({
  isPlaying: z.boolean(),
  startTime: z.number().nullable(),
  currentText: z.string(),
  userInput: z.string(),
  currentIndex: z.number(),
  errors: z.number(),
  timeElapsed: z.number(),
});

export const gameStatsSchema = z.object({
  wpm: z.number(),
  accuracy: z.number(),
  timeElapsed: z.number(),
  totalCharacters: z.number(),
  correctCharacters: z.number(),
  errors: z.number(),
});

export const quoteResponseSchema = z.object({
  content: z.string(),
  author: z.string(),
  length: z.number(),
});

export type GameState = z.infer<typeof gameStateSchema>;
export type GameStats = z.infer<typeof gameStatsSchema>;
export type QuoteResponse = z.infer<typeof quoteResponseSchema>;

// Database tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const typingTests = pgTable("typing_tests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  wpm: decimal("wpm", { precision: 5, scale: 2 }).notNull(),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }).notNull(),
  timeElapsed: integer("time_elapsed").notNull(), // in milliseconds
  totalCharacters: integer("total_characters").notNull(),
  correctCharacters: integer("correct_characters").notNull(),
  errors: integer("errors").notNull(),
  textSource: text("text_source").notNull(), // "random" or "custom"
  textContent: text("text_content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertTypingTestSchema = createInsertSchema(typingTests).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type TypingTest = typeof typingTests.$inferSelect;
export type InsertTypingTest = z.infer<typeof insertTypingTestSchema>;
