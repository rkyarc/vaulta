import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/index";
import { transactions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { successResponse, errorResponse, zodErrorResponse } from "@/lib/api-response";
import { updateTransactionSchema } from "@/lib/validations/transaction";

// Perhatikan ada parameter tambahan { params } di sini
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return errorResponse("Kamu belum login / tidak memiliki akses", 401);
    }

    // Ekstrak ID transaksi dari URL (misal: /api/transactions/5 -> id nya 5)
    const resolvedParams = await params;
    const transactionId = parseInt(resolvedParams.id);
    const userId = parseInt((session.user as any).id);

    // Proses penghapusan data
    const deletedTransaction = await db.delete(transactions)
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, userId)
        )
      )
      .returning();

    // Jika tidak ada data yang terhapus (karena ID salah atau bukan milik user)
    if (deletedTransaction.length === 0) {
      return errorResponse("Transaksi tidak ditemukan atau kamu tidak memiliki akses", 404);
    }

    return successResponse(deletedTransaction[0], "Transaksi berhasil dihapus", 200);

  } catch (error) {
    console.error("Error saat menghapus transaksi:", error);
    return errorResponse("Terjadi kesalahan pada server saat menghapus transaksi", 500);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return errorResponse("Kamu belum login", 401);

    const resolvedParams = await params;
    const transactionId = parseInt(resolvedParams.id);
    const userId = parseInt((session.user as any).id);

    const body = await request.json();
    const validationResult = updateTransactionSchema.safeParse(body);

    if (!validationResult.success) {
      return zodErrorResponse(validationResult.error);
    }

    const { categoryId, amount, description, transactionDate } = validationResult.data;

    // Siapkan wadah untuk menampung data apa saja yang ingin diubah
    const updateData: any = {};
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (amount !== undefined) updateData.amount = amount;
    if (description !== undefined) updateData.description = description;
    if (transactionDate !== undefined) updateData.date = new Date(transactionDate);

    // Jika wadah kosong (pengguna tidak mengirim perubahan apa-apa)
    if (Object.keys(updateData).length === 0) {
      return errorResponse("Tidak ada data yang diubah", 400);
    }

    // Eksekusi update ke database
    const updatedTransaction = await db.update(transactions)
      .set(updateData)
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, userId)
        )
      )
      .returning();

    if (updatedTransaction.length === 0) {
      return errorResponse("Transaksi tidak ditemukan atau tidak memiliki akses", 404);
    }

    return successResponse(updatedTransaction[0], "Transaksi berhasil diperbarui", 200);

  } catch (error) {
    console.error("Error saat mengubah transaksi:", error);
    return errorResponse("Terjadi kesalahan pada server saat mengubah transaksi", 500);
  }
}

export async function GET(request: Request,{ params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return errorResponse("Kamu belum login", 401);

    // Sama seperti PATCH dan DELETE, kita harus 'await' params-nya
    const resolvedParams = await params;
    const transactionId = parseInt(resolvedParams.id);
    const userId = parseInt((session.user as any).id);

    // Cari transaksi spesifik tersebut di database
    const transactionDetail = await db.select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, userId) // Kunci Keamanan!
        )
      );

    // Jika array kosong (data tidak ada atau beda user)
    if (transactionDetail.length === 0) {
      return errorResponse("Transaksi tidak ditemukan atau bukan milikmu", 404);
    }

    // Kembalikan data pada indeks ke-0 (karena db.select mengembalikan bentuk array)
    return successResponse(transactionDetail[0], "Berhasil mengambil detail transaksi", 200);

  } catch (error) {
    console.error("Error saat mengambil detail transaksi:", error);
    return errorResponse("Terjadi kesalahan pada server", 500);
  }
}