import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "../../../../db/index";
import { users } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    // 1. Tangkap data yang dikirim oleh pengguna
    const body = await request.json();
    const { name, email, password } = body;

    // 2. Validasi dasar: Pastikan semua kolom diisi
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Nama, email, dan password wajib diisi!" }, { status: 400 });
    }

    // 3. Cek apakah email sudah pernah terdaftar di database
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length > 0) {
      return NextResponse.json({ message: "Email ini sudah terdaftar. Silakan gunakan email lain." }, { status: 409 });
    }

    // 4. Hashing Password (Keamanan Siber Utama)
    // Angka 10 (salt) adalah standar industri yang menyeimbangkan keamanan dan kecepatan
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Simpan pengguna baru ke database dengan password yang sudah diacak
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json({ message: "Registrasi berhasil!" }, { status: 201 });

  } catch (error) {
    console.error("Error saat registrasi:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}