"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id; // Menangkap ID dari URL

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true); // Loading awal untuk menarik data
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  // State form
  const [formData, setFormData] = useState({
    type: "EXPENSE",
    amount: "",
    categoryId: "",
    description: "",
    transactionDate: "",
  });

  // Saat halaman dibuka, tarik data transaksi lama dan data kategori
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. Tarik kategori untuk dropdown
        const catRes = await fetch("/api/categories");
        const catJson = await catRes.json();
        if (catJson.success) setCategories(catJson.data);

        // 2. Tarik detail transaksi berdasarkan ID
        const trxRes = await fetch(`/api/transactions/${transactionId}`);
        const trxJson = await trxRes.json();
        
        if (!trxRes.ok) throw new Error(trxJson.message || "Gagal mengambil data transaksi");
        
        const trx = trxJson.data;
        
        // 3. Isi formulir dengan data lama
        setFormData({
          type: trx.amount >= 0 ? "INCOME" : "EXPENSE",
          amount: Math.abs(trx.amount).toString(), // Hilangkan tanda minus untuk ditampilkan di input
          categoryId: trx.categoryId.toString(),
          description: trx.description,
          transactionDate: new Date(trx.date).toISOString().split("T")[0],
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsFetching(false);
      }
    };
    
    if (transactionId) fetchInitialData();
  }, [transactionId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId),
        description: formData.description,
        transactionDate: formData.transactionDate,
      };

      // Tembak API PATCH untuk Update
      const res = await fetch(`/api/transactions/${transactionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Gagal menyimpan perubahan");
      }

      router.push("/transactions");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Tampilkan layar loading kosong jika data lama sedang ditarik
  if (isFetching) {
    return <div className="p-10 text-center text-gray-500 font-medium">Menarik data transaksi...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/transactions" className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Edit Transaksi</h2>
          <p className="text-gray-500 text-sm">Perbarui informasi pengeluaran atau pemasukanmu.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipe Transaksi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipe Transaksi</label>
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

          {/* Nominal */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nominal (Rp)</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} required min="1" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>

          {/* Kategori & Tanggal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white">
                <option value="" disabled>Pilih Kategori...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal</label>
              <input type="date" name="transactionDate" value={formData.transactionDate} onChange={handleChange} required className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Singkat</label>
            <input type="text" name="description" value={formData.description} onChange={handleChange} required className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>

          <div className="pt-4">
            <button type="submit" disabled={isLoading} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold transition-all ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}>
              <Save size={20} />
              {isLoading ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}