import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Membaca file .env.local
dotenv.config({ path: ".env.local" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts", // Tempat kita menulis tabel nanti
  out: "./drizzle", // Tempat Drizzle menyimpan riwayat perubahan database
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});