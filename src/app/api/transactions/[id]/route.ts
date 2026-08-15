import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/index";
import { transactions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { successResponse, errorResponse } from "@/lib/api-response";

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