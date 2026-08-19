import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/index";
import { budgets, categories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt((session.user as any).id);

    const userBudgets = await db
      .select({
        id: budgets.id,
        amount: budgets.amount,
        categoryId: budgets.categoryId,
        categoryName: categories.name,
      })
      .from(budgets)
      .innerJoin(categories, eq(budgets.categoryId, categories.id))
      .where(eq(budgets.userId, userId))
      .orderBy(desc(budgets.createdAt));

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
    const { categoryId, amount } = body;

    // Validasi input
    if (!categoryId || !amount) {
      return NextResponse.json(
        { success: false, message: "Kategori dan nominal anggaran wajib diisi" },
        { status: 400 }
      );
    }

    // Insert ke database
    const newBudget = await db.insert(budgets).values({
      userId,
      categoryId: parseInt(categoryId),
      amount: amount.toString(), // Drizzle numeric butuh string untuk presisi
    } as any).returning();

    return NextResponse.json({ success: true, data: newBudget[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}