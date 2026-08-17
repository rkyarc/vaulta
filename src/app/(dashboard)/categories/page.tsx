import { Plus, Tags } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/index";
import { categories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export default async function CategoriesPage() {
  // 1. Ambil sesi user
  const session = await getServerSession(authOptions);
  const userId = parseInt((session?.user as any)?.id || "0");

  // 2. Tarik data kategori milik user ini dari database
  const userCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(desc(categories.createdAt)); // Urutkan dari yang terbaru dibuat

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* --- Bagian Header & Tombol Tambah --- */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Tags className="text-blue-600" size={24} />
            Daftar Kategori
          </h2>
          <p className="text-gray-500 text-sm mt-1">Kelola kategori untuk pemasukan dan pengeluaranmu.</p>
        </div>
        <Link 
          href="/categories/create" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Tambah Kategori
        </Link>
      </div>

      {/* --- Bagian Tabel Kategori --- */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
              <th className="p-4 font-semibold">Nama Kategori</th>
              <th className="p-4 font-semibold">Tipe</th>
              <th className="p-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {userCategories.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">
                  Belum ada kategori yang dibuat.
                </td>
              </tr>
            ) : (
              userCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{cat.name}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      cat.type === 'INCOME' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {cat.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-blue-500 hover:text-blue-700 mr-4 font-medium">Edit</button>
                    <button className="text-red-500 hover:text-red-700 font-medium">Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}