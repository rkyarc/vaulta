import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/index";
import { categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Fungsi bantuan untuk mengekstrak ID dari URL secara aman
const getIdFromUrl = (url: string) => {
  const idString = url.split("/").pop();
  return parseInt(idString || "0");
};

// 1. Fungsi DELETE Kategori
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);
    const categoryId = getIdFromUrl(request.url); // <-- Trik aman membaca ID

    if (isNaN(categoryId) || categoryId === 0) {
      return NextResponse.json({ success: false, message: "ID Kategori tidak valid" }, { status: 400 });
    }

    await db
      .delete(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));

    return NextResponse.json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (error: any) {
    if (error.message?.includes("foreign key constraint")) {
      return NextResponse.json({ 
        success: false, 
        message: "Kategori ini sedang digunakan pada transaksi Anda. Hapus transaksi terkait terlebih dahulu." 
      }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 2. Fungsi GET Spesifik (Untuk Edit)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false }, { status: 401 });

    const userId = parseInt((session.user as any).id);
    const categoryId = getIdFromUrl(request.url);

    const data = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));

    if (data.length === 0) throw new Error("Kategori tidak ditemukan");

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 3. Fungsi PATCH (Untuk Edit)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false }, { status: 401 });

    const userId = parseInt((session.user as any).id);
    const categoryId = getIdFromUrl(request.url);
    const body = await request.json();

    await db
      .update(categories)
      .set({ name: body.name, type: body.type })
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));

    return NextResponse.json({ success: true, message: "Kategori diperbarui" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}