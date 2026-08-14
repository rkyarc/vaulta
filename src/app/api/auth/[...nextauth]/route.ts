import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"; // Tambahkan import bcrypt
import { db } from "../../../../db/index";
import { users } from "../../../../db/schema";
import { eq } from "drizzle-orm";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Akun Vaulta",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "name@vaulta.com" },
        password: { label: "Password", type: "password", placeholder: "Masukkan password kamu" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // 1. Cari user berdasarkan email
        const user = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1);

        // Jika email tidak ditemukan
        if (user.length === 0) return null;

        const foundUser = user[0];

        // 2. Jika user tidak punya password (misal nanti login via Google)
        if (!foundUser.password) return null;

        // 3. Cocokkan password yang diketik dengan password acak di database
        const isPasswordMatch = await bcrypt.compare(credentials.password, foundUser.password);

        // Jika password cocok, izinkan masuk!
        if (isPasswordMatch) {
          return { 
            id: foundUser.id.toString(), 
            name: foundUser.name, 
            email: foundUser.email 
          };
        }
        
        // Jika password salah
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
});

export { handler as GET, handler as POST };