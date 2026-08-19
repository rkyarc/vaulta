"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createTransactionSchema } from "@/lib/validations/transaction";
import { z } from "zod";

type TransactionFormValues = z.infer<typeof createTransactionSchema>;

export default function CreateTransactionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: 0,
      description: "",
      transactionDate: new Date().toISOString().split("T")[0], 
    },
  });

  const selectedType = watch("type");
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (!json.success) throw new Error("Gagal mengambil kategori");
      return json.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: TransactionFormValues) => {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan transaksi");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      
      router.push("/transactions");
    },
  });
  const onSubmit = (data: TransactionFormValues) => {
    data.amount = Math.abs(data.amount);
    mutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/transactions" className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Catat Transaksi Baru</h2>
          <p className="text-gray-500 text-sm">Masukkan detail pemasukan atau pengeluaranmu.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        
        {/* Menampilkan pesan Error dari API / Server jika ada */}
        {mutation.isError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100">
            {mutation.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipe Transaksi</label>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                <input type="radio" value="EXPENSE" {...register("type")} className="peer sr-only" />
                <div className="text-center p-3 rounded-xl border border-gray-200 peer-checked:bg-red-50 peer-checked:border-red-500 peer-checked:text-red-700 font-medium transition-all">
                  Pengeluaran
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input type="radio" value="INCOME" {...register("type")} className="peer sr-only" />
                <div className="text-center p-3 rounded-xl border border-gray-200 peer-checked:bg-green-50 peer-checked:border-green-500 peer-checked:text-green-700 font-medium transition-all">
                  Pemasukan
                </div>
              </label>
            </div>
            {/* Tampilkan pesan error validasi Zod khusus kolom ini */}
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nominal (Rp)</label>
            {/* valueAsNumber PENTING karena HTML input secara default mengembalikan string, sedangkan Zod mengharapkan Number */}
            <input
              type="number"
              placeholder="Contoh: 50000"
              {...register("amount", { valueAsNumber: true })}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
              <select 
                {...register("categoryId", { valueAsNumber: true })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                disabled={isLoadingCategories}
              >
                <option value={0} disabled>
                  {isLoadingCategories ? "Memuat Kategori..." : "Pilih Kategori..."}
                </option>
                
                {categories
                  .filter((cat: any) => cat.type === selectedType)
                  .map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal</label>
              <input
                type="date"
                {...register("transactionDate")}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              {errors.transactionDate && <p className="text-red-500 text-xs mt-1">{errors.transactionDate.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Singkat</label>
            <input
              type="text"
              placeholder="Contoh: Makan siang di kantin"
              {...register("description")}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={mutation.isPending}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold transition-all ${mutation.isPending ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"}`}
            >
              <Save size={20} />
              {mutation.isPending ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
