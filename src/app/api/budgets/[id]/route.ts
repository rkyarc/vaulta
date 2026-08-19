import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/index";
import { budgets } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Perhatikan kita menangkap context secara penuh di parameter kedua
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> } // <-- Tipe data Promise wajib untuk Next.js baru
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt((session.user as any).id);

    // --- SOLUSI: Kita "tunggu" (await) params-nya terbuka sebelum mengambil id ---
    const resolvedParams = await context.params;
    const budgetId = parseInt(resolvedParams.id);

    if (isNaN(budgetId)) {
      return NextResponse.json({ success: false, message: "ID Anggaran tidak valid" }, { status: 400 });
    }

    // Eksekusi penghapusan di database
    await db
      .delete(budgets)
      .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)));

    return NextResponse.json({ success: true, message: "Anggaran berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}