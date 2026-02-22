import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const globalForDb = globalThis as unknown as { client?: MongoClient; db?: Db };

let client: MongoClient;
let db: Db;

if (!uri) {
  client = null as unknown as MongoClient;
  db = null as unknown as Db;
} else if (process.env.NODE_ENV === "development" && globalForDb.db) {
  client = globalForDb.client!;
  db = globalForDb.db;
} else {
  if (!globalForDb.client) {
    globalForDb.client = new MongoClient(uri);
    globalForDb.db = globalForDb.client.db();
  }
  client = globalForDb.client;
  db = globalForDb.db!;
}

export { client, db };

export const collections = {
  documents: () => {
    if (!db) throw new Error("MONGODB_URI is not set");
    return db.collection<DocumentRecord>("documents");
  },
  revisions: () => {
    if (!db) throw new Error("MONGODB_URI is not set");
    return db.collection<RevisionRecord>("revisions");
  },
  users: () => {
    if (!db) throw new Error("MONGODB_URI is not set");
    return db.collection<UserRecord>("users");
  },
};

export type DocumentRecord = {
  _id?: unknown;
  content: string;
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
};

export type EditRecord = {
  editId: string;
  original: string;
  enhanced: string;
  changeType: "grammar" | "style" | "clarity" | "seo";
  reasoning: string;
  confidence: number;
  impactPrediction?: string;
  sources?: string[];
  userAction?: "accepted" | "rejected" | null;
};

export type RevisionRecord = {
  _id?: unknown;
  documentId: string;
  version: number;
  content: string;
  edits: EditRecord[];
  createdAt: Date;
};

export type UserRecord = {
  _id?: unknown;
  name: string;
  username?: string;
  email: string;
  passwordHash: string;
  // Personal Information
  gender?: "man" | "woman" | "non-binary" | "prefer-not-to-say";
  age?: number;
  location?: string;
  height?: string;
  education?: "high-school" | "some-college" | "bachelors" | "masters" | "doctorate" | "trade-school";
  // Creator Profile
  niche?: "fitness" | "beauty" | "lifestyle" | "tech" | "business" | "finance" | "education" | "entertainment" | "other";
  platforms?: string[];
  experienceLevel?: "Beginner" | "Intermediate" | "Expert";
  contentTypes?: string[];
  contentGoal?: "Build Audience" | "Sell Product" | "Educate" | "Personal Brand" | "Drive Traffic" | "Other";
  postingFrequency?: "1-2" | "3-5" | "daily" | "multiple";
  // Audience & Preferences
  audienceGen?: "Gen Z" | "Millennials" | "Gen X" | "Boomers" | "Mixed";
  audiencePlatforms?: string;
  contentLengthPreference?: "Short" | "Medium" | "Long" | "Platform-specific";
  emojiUsage?: "None" | "Minimal" | "Moderate" | "Heavy";
  hashtagPreference?: "None" | "Few" | "Many";
  createdAt: Date;
  updatedAt: Date;
};
