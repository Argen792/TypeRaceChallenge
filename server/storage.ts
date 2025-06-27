import { users, typingTests, type User, type InsertUser, type TypingTest, type InsertTypingTest } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveTypingTest(typingTest: InsertTypingTest): Promise<TypingTest>;
  getUserTests(userId: number): Promise<TypingTest[]>;
  getBestScore(userId: number): Promise<TypingTest | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async saveTypingTest(typingTest: InsertTypingTest): Promise<TypingTest> {
    const [test] = await db
      .insert(typingTests)
      .values(typingTest)
      .returning();
    return test;
  }

  async getUserTests(userId: number): Promise<TypingTest[]> {
    return await db
      .select()
      .from(typingTests)
      .where(eq(typingTests.userId, userId))
      .orderBy(desc(typingTests.createdAt));
  }

  async getBestScore(userId: number): Promise<TypingTest | undefined> {
    const [bestTest] = await db
      .select()
      .from(typingTests)
      .where(eq(typingTests.userId, userId))
      .orderBy(desc(typingTests.wpm))
      .limit(1);
    return bestTest || undefined;
  }
}

export const storage = new DatabaseStorage();
