import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}
