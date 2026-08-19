"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategorySchema } from "@/lib/validations/category";
import { z } from "zod";

type CategoryFormValues = z.infer<typeof createCategorySchema>;

export default function CreateCategoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 1. Inisialisasi React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      type: "EXPENSE", // Default Tipe
    },
  });

  // 2. Inisialisasi TanStack Query Mutation
  const mutation = useMutation({
    mutationFn: async (payload: CategoryFormValues) => {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan kategori");
      return json;
    },
    onSuccess: () => {
      // Refresh cache tabel kategori dan pindah halaman
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.push("/categories");
    },
  });

  const onSubmit = (data: CategoryFormValues) => {
    mutation.mutate(data);
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
        
        {/* Tampilkan pesan Error dari API */}
        {mutation.isError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100">
            {mutation.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Kolom Nama */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Kategori</label>
            <input 
              type="text" 
              placeholder="Contoh: Gaji Bulanan, Tagihan Listrik, dll" 
              {...register("name")}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Kolom Tipe */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipe Kategori</label>
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
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={mutation.isPending} 
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold transition-all ${mutation.isPending ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
            >
              <Save size={20} />
              {mutation.isPending ? "Menyimpan..." : "Simpan Kategori"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
