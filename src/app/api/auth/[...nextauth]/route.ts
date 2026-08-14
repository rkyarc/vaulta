import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "../../../../db/index";
import { users } from "../../../../db/schema";
import { eq } from "drizzle-orm";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Akun Vaulta",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "ricky@vaulta.com" },
        password: { label: "Password", type: "password", placeholder: "Ketik apa saja untuk sekarang" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        // Cari user di database Neon kita berdasarkan email yang diketik
        const user = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1);

        // Jika email-nya ketemu di database, izinkan masuk!
        if (user.length > 0) {
          return { 
            id: user[0].id.toString(), 
            name: user[0].name, 
            email: user[0].email 
          };
        }
        
        // Jika email tidak ada di database, tolak aksesnya
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
});

// Wajib diekspor sebagai GET dan POST agar Next.js bisa memproses request-nya
export { handler as GET, handler as POST };