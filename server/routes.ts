import type { Express } from "express";
import { storage } from "./storage";
import { insertTypingTestSchema } from "../shared/schema";

export async function registerRoutes(app: Express) { // Убрали возвращаемый тип
  // Proxy route for quotable.io API to avoid CORS issues
  app.get("/api/quote", async (req, res) => {
    try {
      const response = await fetch("https://api.quotable.io/random?minLength=150&maxLength=300");

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching quote:", error);

      // Fallback quotes if API fails
      const fallbackQuotes = [
        {
          content: "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is commonly used for typing practice. It helps develop muscle memory and accuracy across all keys on the keyboard.",
          author: "Traditional",
          length: 187
        },
        {
          content: "To be or not to be, that is the question. Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles and by opposing end them.",
          author: "William Shakespeare",
          length: 198
        },
        {
          content: "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness. It was the epoch of belief, it was the epoch of incredulity, it was the season of Light.",
          author: "Charles Dickens",
          length: 203
        }
      ];

      const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      res.json(randomQuote);
    }
  });

  // Save typing test result
  app.post("/api/typing-test", async (req, res) => {
    try {
      const validatedData = insertTypingTestSchema.parse(req.body);
      const savedTest = await storage.saveTypingTest(validatedData);
      res.json(savedTest);
    } catch (error) {
      console.error("Error saving typing test:", error);
      res.status(400).json({ error: "Invalid test data" });
    }
  });

  // Get user's typing test history
  app.get("/api/typing-test/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const tests = await storage.getUserTests(userId);
      res.json(tests);
    } catch (error) {
      console.error("Error fetching user tests:", error);
      res.status(500).json({ error: "Failed to fetch tests" });
    }
  });

  // Get user's best score
  app.get("/api/typing-test/best/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const bestScore = await storage.getBestScore(userId);
      res.json(bestScore || null);
    } catch (error) {
      console.error("Error fetching best score:", error);
      res.status(500).json({ error: "Failed to fetch best score" });
    }
  });

  // Create a simple test user for demo purposes
  app.post("/api/user", async (req, res) => {
    try {
      const { username } = req.body;

      if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: "Username is required" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.json(existingUser);
      }

      const newUser = await storage.createUser({ username });
      res.json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });
}