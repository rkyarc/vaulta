import { withAuth } from "next-auth/middleware";

// Middleware ini akan otomatis mengecek token JWT (sesi login)
export default withAuth({
  pages: {
    signIn: "/api/auth/signin", // Arahkan ke sini jika belum login
  },
});

export const config = {
  // Tentukan rute mana saja yang WAJIB login. 
  // Di sini kita melindungi halaman utama (/) dan semua halaman di bawahnya,
  // KECUALI halaman /register, API auth, dan aset statis.
  matcher: [
    "/((?!register|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};