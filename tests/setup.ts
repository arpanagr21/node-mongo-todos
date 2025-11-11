import { beforeAll, afterAll, afterEach, jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;

// Mock Redis at the top level before any imports
jest.mock("ioredis", () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn<() => Promise<string | null>>().mockResolvedValue(null),
    set: jest.fn<() => Promise<string>>().mockResolvedValue("OK"),
    del: jest.fn<() => Promise<number>>().mockResolvedValue(1),
    on: jest.fn<() => void>(),
    quit: jest.fn<() => Promise<string>>().mockResolvedValue("OK"),
    disconnect: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  }));
});

// Setup before all tests
beforeAll(async () => {
  // Set test environment variables
  process.env.JWT_SECRET = "test-jwt-secret-key-for-testing";
  process.env.REDIS_URL = "redis://localhost:6379"; // Mock will intercept this

  // Setup MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear database between tests
afterEach(async () => {
  // Clear MongoDB collections
  const collections = mongoose.connection?.collections;
  if (collections) {
    for (const key in collections) {
      const collection = collections[key];
      if (collection) {
        await collection.deleteMany({});
      }
    }
  }
});
