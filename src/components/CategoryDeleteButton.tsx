"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CategoryDeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Apakah kamu yakin ingin menghapus kategori ini? Pastikan tidak ada transaksi yang masih menggunakan kategori ini.");
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      // Menembak API DELETE untuk kategori
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Gagal menghapus kategori");
      }

      // Memuat ulang tabel setelah berhasil dihapus
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`font-medium transition-colors ${
        isDeleting 
          ? "text-gray-400 cursor-not-allowed" 
          : "text-red-500 hover:text-red-700"
      }`}
    >
      {isDeleting ? "Menghapus..." : "Hapus"}
    </button>
  );
}