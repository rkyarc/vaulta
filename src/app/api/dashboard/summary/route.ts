import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/index";
import { transactions, categories } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm"; 

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt((session.user as any).id);

    const allTransactions = await db
      .select({
        amount: transactions.amount,
        type: categories.type,
        date: transactions.date
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.userId, userId));

    let totalIncome = 0;
    let totalExpense = 0;

    let thisMonthIncome = 0;
    let thisMonthExpense = 0;

    let lastMonthIncome = 0;
    let lastMonthExpense = 0;

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const yearOfLastMonth = thisMonth === 0 ? thisYear - 1 : thisYear;

    allTransactions.forEach((trx) => {
      const amount = Math.abs(Number(trx.amount)); 
      const trxDate = new Date(trx.date);
      const trxMonth = trxDate.getMonth();
      const trxYear = trxDate.getFullYear();

      if (trx.type === 'INCOME') totalIncome += amount;
      else totalExpense += amount;

      if (trxMonth === thisMonth && trxYear === thisYear) {
        if (trx.type === 'INCOME') thisMonthIncome += amount;
        else thisMonthExpense += amount;
      }

      if (trxMonth === lastMonth && trxYear === yearOfLastMonth) {
        if (trx.type === 'INCOME') lastMonthIncome += amount;
        else lastMonthExpense += amount;
      }
    });

    const balance = totalIncome - totalExpense;

    const calculatePercentage = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const incomeChange = calculatePercentage(thisMonthIncome, lastMonthIncome);
    const expenseChange = calculatePercentage(thisMonthExpense, lastMonthExpense);

    return NextResponse.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance,
        changes: {
          income: incomeChange,
          expense: expenseChange
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}