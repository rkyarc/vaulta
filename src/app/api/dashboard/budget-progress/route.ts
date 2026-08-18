import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/index";
import { transactions, categories, budgets } from "@/db/schema";
import { eq, and, sql, gte, lte } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt((session.user as any).id);

    // 1. Tentukan Periode (Bulan & Tahun Saat Ini)
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");
    
    const now = new Date();
    const currentMonth = monthParam ? parseInt(monthParam) : now.getMonth() + 1;
    const currentYear = yearParam ? parseInt(yearParam) : now.getFullYear();

    const paddedMonth = currentMonth.toString().padStart(2, "0");
    const lastDay = new Date(currentYear, currentMonth, 0).getDate(); 
    
    const startDate = new Date(`${currentYear}-${paddedMonth}-01T00:00:00.000Z`);
    const endDate = new Date(`${currentYear}-${paddedMonth}-${lastDay}T23:59:59.999Z`);

    // 2. Eksekusi SQL: Ambil Budget, Gabungkan Kategori, Gabungkan Transaksi (LEFT JOIN)
    const progressData = await db
      .select({
        budgetId: budgets.id,
        categoryName: categories.name,
        budgetAmount: budgets.amount,
        // SQL COALESCE: Jika tidak ada transaksi sama sekali, jadikan 0 (bukan null)
        spent: sql<number>`COALESCE(sum(${transactions.amount}), 0)`.mapWith(Number)
      })
      .from(budgets)
      .innerJoin(categories, eq(budgets.categoryId, categories.id))
      .leftJoin(
        transactions,
        and(
          eq(transactions.categoryId, budgets.categoryId),
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .where(eq(budgets.userId, userId))
      .groupBy(budgets.id, categories.name, budgets.amount);

    // 3. Mesin Kalkulasi Logika Bisnis (Sisa, Persentase, Status)
    const formattedData = progressData.map((item) => {
      const budgetAmount = Number(item.budgetAmount);
      const spent = item.spent;
      
      // Hitung sisa dan persentase
      const remaining = budgetAmount - spent;
      const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;
      
      // Tentukan status kesehatan budget
      let status = "SAFE";
      if (percentage >= 100) {
        status = "EXCEEDED"; // Bahaya: Melebihi anggaran!
      } else if (percentage >= 80) {
        status = "WARNING"; // Peringatan: Sudah terpakai 80% lebih
      }

      return {
        categoryName: item.categoryName,
        budgetAmount,
        spent,
        remaining,
        percentage,
        status
      };
    });

    return NextResponse.json({
      success: true,
      month: currentMonth,
      year: currentYear,
      data: formattedData
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}