"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

export default function TransactionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") || "ALL";

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    
    const params = new URLSearchParams(searchParams);
    
    if (newType === "ALL") {
      params.delete("type");
    } else {
      params.set("type", newType);
    }
    
    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 w-full sm:w-auto">
      <Filter size={18} className="text-gray-500" />
      <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Tampilkan:</span>
      <select 
        value={currentType}
        onChange={handleTypeChange}
        className="text-sm p-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex-1"
      >
        <option value="ALL">Semua Transaksi</option>
        <option value="INCOME">Pemasukan Saja</option>
        <option value="EXPENSE">Pengeluaran Saja</option>
      </select>
    </div>
  );
}
