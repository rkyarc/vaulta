import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/index";
import { transactions, categories } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    const userId = parseInt((session.user as any).id);

    // Mencegat parameter waktu jika sewaktu-waktu Frontend ingin memfilter
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // Kondisi dasar: Hanya transaksi milik Budi DAN yang tipenya PENGELUARAN
    const conditions = [
      eq(transactions.userId, userId),
      eq(categories.type, "EXPENSE"),
    ];

    // Opsional: Jika ada filter waktu (sama seperti API sebelumnya)
    if (month && year) {
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      const paddedMonth = month.padStart(2, "0");
      const lastDay = new Date(yearNum, monthNum, 0).getDate();

      const startDateStr = `${year}-${paddedMonth}-01`;
      conditions.push(
        sql`${transactions.date} >= ${new Date(startDateStr)}`,
        sql`${transactions.date} <= ${new Date(`${year}-${paddedMonth}-${lastDay}T23:59:59.999Z`)}`,
      );
    }

    // Eksekusi SQL Aggregation (GROUP BY) menggunakan Drizzle
    const spendingData = await db
      .select({
        categoryName: categories.name,
        // Menyuruh SQL menjumlahkan (SUM) kolom amount, lalu memaksanya menjadi tipe Angka (Number)
        totalAmount: sql<number>`sum(${transactions.amount})`.mapWith(Number),
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions))
      .groupBy(categories.name) // <-- Ini kunci utamanya: Dikelompokkan per nama kategori
      .orderBy(sql`sum(${transactions.amount}) desc`); // Diurutkan dari pengeluaran terbesar

    return NextResponse.json({
      success: true,
      data: spendingData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
