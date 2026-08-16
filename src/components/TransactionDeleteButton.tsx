"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TransactionDeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // Memunculkan popup konfirmasi bawaan browser
    const confirmDelete = window.confirm("Apakah kamu yakin ingin menghapus transaksi ini? Data yang dihapus tidak bisa dikembalikan.");
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      // Menembak API DELETE yang sudah kita buat di Epic 5
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Gagal menghapus transaksi");
      }

      // Jika sukses, paksa Next.js untuk memuat ulang data tabel di latar belakang
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