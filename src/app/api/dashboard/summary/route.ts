import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/index";
import { transactions, categories } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm"; 

export async function GET(request: Request) {
  try {
    // 1. Validasi Sesi User
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt((session.user as any).id);

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // Siapkan array kondisi, bawaannya selalu mencari berdasarkan userId
    const conditions = [eq(transactions.userId, userId)];

    if (month && year) {
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      
      const paddedMonth = month.padStart(2, "0");
      const lastDay = new Date(yearNum, monthNum, 0).getDate(); 
      
      const startDateStr = `${year}-${paddedMonth}-01`;
      
      // Ubah ke objek Date agar TypeScript dan Drizzle bahagia
      const startDate = new Date(startDateStr);
      const endDate = new Date(`${year}-${paddedMonth}-${lastDay}T23:59:59.999Z`);

      conditions.push(
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      );
    }
    // -------------------------------------------------------------

    // 2. Tarik semua transaksi dengan kondisi dinamis (JOIN)
    const allTransactions = await db
      .select({
        amount: transactions.amount,
        type: categories.type,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions)); // <-- Menggunakan and() untuk menggabungkan kondisi

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