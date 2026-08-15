import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { db } from "@/db/index";
import { categories } from "@/db/schema";
import { createCategorySchema } from "@/lib/validations/category";
import { successResponse, errorResponse, zodErrorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {

    const session = await getServerSession(authOptions);
    // 1. Cek apakah pengguna sudah login
    if (!session || !session.user) {
      return errorResponse("Kamu belum login / tidak memiliki akses", 401);
    }

    // 2. Tangkap dan validasi data yang dikirim
    const body = await request.json();
    const validationResult = createCategorySchema.safeParse(body);

    if (!validationResult.success) {
      // Gunakan helper standar error kita!
      return zodErrorResponse(validationResult.error);
    }

    const { name, type } = validationResult.data;

    console.log("Isi Sesi Saat Ini:", session.user);

    // 3. Simpan ke database (menggunakan ID user yang sedang login)
    // Catatan: session.user.id mungkin perlu disesuaikan tipe datanya tergantung schema-mu
    const newCategory = await db.insert(categories).values({
      userId: parseInt((session.user as any).id),
      name,
      type,
    }).returning(); // .returning() agar database mengembalikan data yang baru dibuat

    // 4. Kembalikan respons sukses menggunakan helper standar kita!
    return successResponse(newCategory[0], "Kategori berhasil dibuat", 201);

  } catch (error) {
    console.error("Error saat membuat kategori:", error);
    return errorResponse("Terjadi kesalahan pada server saat membuat kategori", 500);
  }
}

export async function GET(request: Request) {
  try {
    // 1. Cek sesi login (seperti biasa)
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return errorResponse("Kamu belum login / tidak memiliki akses", 401);
    }

    // 2. Ambil data dari database HANYA yang milik user ini
    const userCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, parseInt((session.user as any).id))); 

    // 3. Kembalikan datanya!
    return successResponse(userCategories, "Berhasil mengambil data kategori", 200);

  } catch (error) {
    console.error("Error saat mengambil kategori:", error);
    return errorResponse("Terjadi kesalahan pada server saat mengambil kategori", 500);
  }
}