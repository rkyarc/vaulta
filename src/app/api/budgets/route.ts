import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/index";
import { budgets, categories, transactions } from "@/db/schema";
import { eq, desc, and, sum, between } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt((session.user as any).id);

    const userBudgetsRaw = await db
      .select({
        id: budgets.id,
        amount: budgets.amount,
        categoryId: budgets.categoryId,
        categoryName: categories.name,
        periodStart: budgets.periodStart,
        periodEnd: budgets.periodEnd,
      })
      .from(budgets)
      .innerJoin(categories, eq(budgets.categoryId, categories.id))
      .where(eq(budgets.userId, userId))
      .orderBy(desc(budgets.createdAt));

    const userBudgets = await Promise.all(
      userBudgetsRaw.map(async (budget) => {
        const trx = await db
          .select({ totalSpent: sum(transactions.amount) })
          .from(transactions)
          .where(
            and(
              eq(transactions.userId, userId),
              eq(transactions.categoryId, budget.categoryId),
              between(transactions.date, budget.periodStart, budget.periodEnd)
            )
          );
        
        return {
          ...budget,
          spentAmount: Number(trx[0]?.totalSpent || 0)
        };
      })
    );

    return NextResponse.json({ success: true, data: userBudgets });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt((session.user as any).id);

    const body = await request.json();
    const { categoryId, amount, periodStart, periodEnd } = body;

    if (!categoryId || !amount || !periodStart || !periodEnd) {
      return NextResponse.json(
        { success: false, message: "Kategori, nominal, dan tanggal periode wajib diisi" },
        { status: 400 }
      );
    }

    const existingBudget = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.categoryId, parseInt(categoryId))
        )
      );

    if (existingBudget.length > 0) {
      return NextResponse.json(
        { success: false, message: "Anggaran untuk kategori ini sudah ada. Silakan hapus yang lama terlebih dahulu." },
        { status: 400 }
      );
    }

    const newBudget = await db.insert(budgets).values({
      userId: userId,
      categoryId: parseInt(categoryId),
      amount: amount.toString(), 
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd)
    } as any).returning();

    return NextResponse.json({ success: true, data: newBudget[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}