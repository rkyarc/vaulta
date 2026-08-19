"use client";

import { useState, useEffect } from "react";
import { ArrowDownRight, ArrowUpRight, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RecentTransactions() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch("/api/dashboard/recent-transactions");
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Gagal menarik data transaksi terbaru", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecent();
  }, []);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-gray-500 font-medium">Memuat riwayat transaksi...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Transaksi Terbaru</h3>
        <Link href="/transactions" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors">
          Lihat Semua <ArrowRight size={16} />
        </Link>
      </div>
      
      <div className="p-6 flex-1">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-gray-400 text-sm">
            <p>Belum ada transaksi.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.map((trx) => (
              <div key={trx.id} className="flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${trx.type === 'INCOME' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {trx.type === 'INCOME' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {trx.categoryName || "Tanpa Kategori"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(trx.date)} {trx.description ? `• ${trx.description}` : ''}
                    </p>
                  </div>
                </div>
                <div className={`font-bold ${trx.type === 'INCOME' ? 'text-green-600' : 'text-gray-800'}`}>
                  {trx.type === 'INCOME' ? '+' : '-'}{formatRupiah(Number(trx.amount))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}