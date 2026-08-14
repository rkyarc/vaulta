import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Mengambil URL dari file .env.local
const connectionString = process.env.DATABASE_URL!;

// Membuat koneksi ke Neon DB
// { prepare: false } sangat penting untuk koneksi serverless seperti Neon
const client = postgres(connectionString, { prepare: false });

// Meng-export koneksi agar bisa dipakai di seluruh aplikasi
export const db = drizzle(client, { schema });