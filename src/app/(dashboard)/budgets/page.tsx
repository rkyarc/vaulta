"use client";

import { useState, useEffect } from "react";
import { Plus, Wallet, Trash2 } from "lucide-react";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [budgetsRes, categoriesRes] = await Promise.all([
          fetch("/api/budgets"),
          fetch("/api/categories")
        ]);
        
        const budgetsJson = await budgetsRes.json();
        const categoriesJson = await categoriesRes.json();

        if (budgetsJson.success) setBudgets(budgetsJson.data);
        if (categoriesJson.success) {
          const expenseCategories = categoriesJson.data.filter((c: any) => c.type === 'EXPENSE');
          setCategories(expenseCategories);
        }
      } catch (error) {
        console.error("Gagal menarik data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !amount) return alert("Pilih kategori dan masukkan nominal!");
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, amount: Number(amount) }),
      });
      
      const json = await res.json();
      if (json.success) {
        window.location.reload();
      } else {
        alert("Gagal menyimpan anggaran: " + json.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (budgetId: number) => {
    const confirmDelete = window.confirm("Apakah kamu yakin ingin menghapus anggaran ini?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/budgets/${budgetId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      
      if (json.success) {
        setBudgets(budgets.filter((b) => b.id !== budgetId));
      } else {
        alert("Gagal menghapus: " + json.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat menghapus.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Memuat data anggaran...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Anggaran</h2>
        <p className="text-gray-500 text-sm mt-1">Atur batas maksimal pengeluaranmu per kategori.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="md:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
              <Plus size={18} className="text-blue-600"/> Buat Anggaran Baru
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Pengeluaran</label>
              <select 
                value={categoryId} 
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batas Maksimal (Rp)</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 2000000"
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="mt-2 w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Anggaran"}
            </button>
          </form>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[300px]">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Wallet size={18} className="text-blue-600"/> Anggaran Aktif Saat Ini
            </h3>

            {budgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <p>Belum ada anggaran yang dibuat.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {budgets.map((budget) => (
                  <div key={budget.id} className="border border-gray-100 p-4 rounded-xl shadow-sm flex justify-between items-center hover:border-blue-200 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{budget.categoryName}</p>
                      <p className="text-lg font-bold text-gray-800 mt-1">{formatRupiah(Number(budget.amount))}</p>
                    </div>
                    {/* Tombol hapus sekarang sudah dihubungkan ke fungsi handleDelete */}
                    <button 
                      onClick={() => handleDelete(budget.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}