"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Wallet, Trash2, AlertTriangle, AlertCircle } from "lucide-react";
import { createBudgetSchema } from "@/lib/validations/budget";
import { z } from "zod";

type BudgetFormValues = z.infer<typeof createBudgetSchema>;

export default function BudgetsPage() {
  const queryClient = useQueryClient();

  // 1. Ambil data Budgets
  const { data: budgets = [], isLoading: isLoadingBudgets } = useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const res = await fetch("/api/budgets");
      const json = await res.json();
      return json.success ? json.data : [];
    },
  });

  // 2. Ambil data Kategori (Hanya Expense)
  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "expense"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      const json = await res.json();
      return json.success ? json.data.filter((c: any) => c.type === 'EXPENSE') : [];
    },
  });

  // 3. Setup React Hook Form
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      categoryId: "",
      amount: 0,
      periodStart: "",
      periodEnd: "",
    },
  });

  // 4. Setup Mutation untuk Submit
  const mutation = useMutation({
    mutationFn: async (values: BudgetFormValues) => {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      form.reset();
      alert("Anggaran berhasil disimpan!");
    },
    onError: (error: any) => {
      alert("Gagal menyimpan anggaran: " + error.message);
    }
  });

  // 5. Setup Mutation untuk Delete
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
    onError: (error: any) => {
      alert("Gagal menghapus anggaran: " + error.message);
    }
  });

  const onSubmit = (values: BudgetFormValues) => {
    mutation.mutate(values);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Apakah kamu yakin ingin menghapus anggaran ini?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoadingBudgets) {
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
        <p className="text-gray-500 text-sm mt-1">Atur batas maksimal pengeluaranmu beserta target waktunya.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* FORM KIRI */}
        <div className="md:col-span-1">
          <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
              <Plus size={18} className="text-blue-600"/> Buat Anggaran Baru
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Pengeluaran</label>
              <select 
                {...form.register("categoryId")}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {form.formState.errors.categoryId && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.categoryId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batas Maksimal (Rp)</label>
              <input 
                type="number" 
                {...form.register("amount")}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {form.formState.errors.amount && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.amount.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tgl Mulai</label>
                <input 
                  type="date" 
                  {...form.register("periodStart")}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {form.formState.errors.periodStart && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.periodStart.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tgl Selesai</label>
                <input 
                  type="date" 
                  {...form.register("periodEnd")}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {form.formState.errors.periodEnd && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.periodEnd.message}</p>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={mutation.isPending}
              className="mt-2 w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {mutation.isPending ? "Menyimpan..." : "Simpan Anggaran"}
            </button>
          </form>
        </div>

        {/* LIST KANAN */}
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
              <div className="grid grid-cols-1 gap-4">
                {budgets.map((budget: any) => {
                  const percentage = Math.min((budget.spentAmount / Number(budget.amount)) * 100, 100);
                  const isWarning = percentage >= 80 && percentage < 100;
                  const isExceeded = percentage >= 100;

                  return (
                    <div key={budget.id} className="border border-gray-100 p-5 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">{budget.categoryName}</p>
                          <p className="text-lg font-bold text-gray-800 mt-1">
                            {formatRupiah(budget.spentAmount)} <span className="text-sm text-gray-400 font-normal">/ {formatRupiah(Number(budget.amount))}</span>
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDelete(budget.id)}
                          disabled={deleteMutation.isPending}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Progress Bar Container */}
                      <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            isExceeded ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>

                      {/* Status Message */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">
                          {new Date(budget.periodStart).toLocaleDateString('id-ID')} - {new Date(budget.periodEnd).toLocaleDateString('id-ID')}
                        </span>
                        
                        {isExceeded ? (
                          <span className="text-red-600 font-medium flex items-center gap-1"><AlertCircle size={12}/> Melebihi Batas!</span>
                        ) : isWarning ? (
                          <span className="text-amber-600 font-medium flex items-center gap-1"><AlertTriangle size={12}/> Hampir Habis!</span>
                        ) : (
                          <span className="text-emerald-600 font-medium">Aman terkendali</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}