import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/index";
import { transactions, categories } from "@/db/schema";
import { eq, and, sql, gte, lte } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt((session.user as any).id);

    // 1. Tentukan Periode (Tahun)
    // Jika Frontend tidak mengirim tahun, kita gunakan tahun ini sebagai default
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const currentYear = yearParam ? parseInt(yearParam) : new Date().getFullYear();

    // Buat batasan 1 Januari hingga 31 Desember untuk tahun tersebut
    const startDate = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${currentYear}-12-31T23:59:59.999Z`);

    // 2. Eksekusi SQL Aggregation (GROUP BY Bulan dan Tipe)
    // Kita meminta PostgreSQL untuk mengekstrak bulan dari tanggal, lalu menjumlahkannya
    const rawData = await db
      .select({
        // Ekstrak bulan dalam format angka (1-12) dari kolom date
        month: sql<number>`EXTRACT(MONTH FROM ${transactions.date})`.mapWith(Number),
        type: categories.type,
        totalAmount: sql<number>`sum(${transactions.amount})`.mapWith(Number),
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .groupBy(
        sql`EXTRACT(MONTH FROM ${transactions.date})`,
        categories.type
      )
      .orderBy(sql`EXTRACT(MONTH FROM ${transactions.date})`);

    // 3. Format Data untuk Chart Frontend (Bulan 1 - 12)
    // Chart biasanya butuh data lengkap 12 bulan meskipun ada bulan yang 0 rupiah
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    
    // Siapkan wadah kosong untuk 12 bulan
    const formattedData = monthNames.map((month) => ({
      month,
      income: 0,
      expense: 0,
    }));

    // Masukkan hasil dari database ke wadah yang sesuai
    rawData.forEach((item) => {
      const monthIndex = item.month - 1; // Karena array dimulai dari 0
      if (item.type === "INCOME") {
        formattedData[monthIndex].income = item.totalAmount;
      } else {
        formattedData[monthIndex].expense = item.totalAmount;
      }
    });

    // 4. Kirim balasan
    return NextResponse.json({
      success: true,
      year: currentYear,
      data: formattedData,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}