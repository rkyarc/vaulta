"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function CreateCategoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "EXPENSE", // Default tipe
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Menembak API POST /api/categories yang sudah kita buat di Epic 6
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Gagal menyimpan kategori");
      }

      // Jika berhasil, kembali ke tabel kategori
      router.push("/categories");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/categories" className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tambah Kategori Baru</h2>
          <p className="text-gray-500 text-sm">Buat kategori baru untuk mengelompokkan transaksimu.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nama Kategori */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Kategori</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              placeholder="Contoh: Gaji Bulanan, Tagihan Listrik, dll" 
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
            />
          </div>

          {/* Tipe Kategori */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipe Kategori</label>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="type" value="EXPENSE" checked={formData.type === "EXPENSE"} onChange={handleChange} className="peer sr-only" />
                <div className="text-center p-3 rounded-xl border border-gray-200 peer-checked:bg-red-50 peer-checked:border-red-500 peer-checked:text-red-700 font-medium transition-all">
                  Pengeluaran
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="type" value="INCOME" checked={formData.type === "INCOME"} onChange={handleChange} className="peer sr-only" />
                <div className="text-center p-3 rounded-xl border border-gray-200 peer-checked:bg-green-50 peer-checked:border-green-500 peer-checked:text-green-700 font-medium transition-all">
                  Pemasukan
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={isLoading} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold transition-all ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}>
              <Save size={20} />
              {isLoading ? "Menyimpan..." : "Simpan Kategori"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}