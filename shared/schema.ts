import { z } from "zod";

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
