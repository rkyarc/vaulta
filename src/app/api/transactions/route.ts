import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/index";
import { transactions } from "@/db/schema";
import { createTransactionSchema } from "@/lib/validations/transaction";
import { successResponse, errorResponse, zodErrorResponse } from "@/lib/api-response";
import { eq, desc } from "drizzle-orm"; // Kita tambahkan 'desc' untuk mengurutkan transaksi terbaru di atas

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return errorResponse("Kamu belum login / tidak memiliki akses", 401);
    }

    const body = await request.json();
    
    const validationResult = createTransactionSchema.safeParse(body);

    if (!validationResult.success) {
      return zodErrorResponse(validationResult.error);
    }

    // Kita tetap menerima 'type' dari validasi, tapi tidak memasukkannya ke database
    const { categoryId, type, amount, description, transactionDate } = validationResult.data;

    const newTransaction = await db.insert(transactions).values({
      userId: parseInt((session.user as any).id),
      categoryId: categoryId,
      amount: amount, 
      description: description,
      date: new Date(transactionDate), // PERBAIKAN: Gunakan nama kolom 'date' dan ubah ke objek Date
    }).returning();

    return successResponse(newTransaction[0], "Transaksi berhasil dicatat", 201);

  } catch (error) {
    console.error("Error saat mencatat transaksi:", error);
    return errorResponse("Terjadi kesalahan pada server saat mencatat transaksi", 500);
  }
}

export async function GET(request: Request) {
  try {
    // 1. Cek Autentikasi
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return errorResponse("Kamu belum login / tidak memiliki akses", 401);
    }

    // 2. Ambil transaksi dari database (Hanya milik user yang sedang login)
    // Kita urutkan berdasarkan tanggal terbaru menggunakan desc(transactions.date)
    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, parseInt((session.user as any).id)))
      .orderBy(desc(transactions.date));

    // 3. Kembalikan data
    return successResponse(userTransactions, "Berhasil mengambil riwayat transaksi", 200);

  } catch (error) {
    console.error("Error saat mengambil transaksi:", error);
    return errorResponse("Terjadi kesalahan pada server saat mengambil transaksi", 500);
  }
}