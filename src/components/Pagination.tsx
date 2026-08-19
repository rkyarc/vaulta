"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  totalPages: number;
}

export default function Pagination({ totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Membaca halaman saat ini dari URL (default: halaman 1)
  const currentPage = Number(searchParams.get("page")) || 1;

  const handlePageChange = (newPage: number) => {
    // Abaikan jika halaman ditekan melebihi batas
    if (newPage < 1 || newPage > totalPages) return;

    const params = new URLSearchParams(searchParams);
    
    // Atur parameter ?page=
    if (newPage === 1) {
      params.delete("page"); // Kalau balik ke halaman 1, URL lebih rapi jika dibersihkan
    } else {
      params.set("page", newPage.toString());
    }

    // PUSH: Ubah URL browser (Server Component otomatis akan me-render ulang)
    router.push(`${pathname}?${params.toString()}`);
  };

  // Jangan tampilkan pagination sama sekali jika hanya ada 1 halaman atau kosong
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/50">
      <span className="text-sm text-gray-500 font-medium">
        Halaman {currentPage} dari {totalPages}
      </span>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
