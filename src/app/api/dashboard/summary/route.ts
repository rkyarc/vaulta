import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/index";
import { transactions, categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    // 1. Validasi Sesi User
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt((session.user as any).id);

    // 2. Tarik semua transaksi milik user beserta tipe kategorinya (JOIN)
    const allTransactions = await db
      .select({
        amount: transactions.amount,
        type: categories.type,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.userId, userId));

    // 3. Mesin Penghitung
    let totalIncome = 0;
    let totalExpense = 0;

    allTransactions.forEach((trx) => {
      // Pastikan amount diubah menjadi angka yang aman
      const amount = Math.abs(Number(trx.amount)); 
      
      if (trx.type === 'INCOME') {
        totalIncome += amount;
      } else {
        totalExpense += amount; // Jika tipe kosong, default dianggap pengeluaran
      }
    });

    // 4. Hitung Saldo Akhir (Balance)
    const balance = totalIncome - totalExpense;

    // 5. Kirim data ke Frontend
    return NextResponse.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}