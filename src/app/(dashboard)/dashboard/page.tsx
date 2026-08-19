"use client";

import { useState, useEffect } from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import MonthlyTrendChart from "@/components/MonthlyTrendChart";
import CategoriExpenseChart from "@/components/CategoryExpenseChart"
import BudgetProgress from "@/components/BudgetProgress";

export default function DashboardPage() {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/dashboard/summary");
        const json = await res.json();
        if (json.success) {
          setSummary(json.data);
        }
      } catch (error) {
        console.error("Gagal menarik data summary", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 font-medium">Menghitung data keuangan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. HEADER DASHBOARD */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Keuangan</h2>
        <p className="text-gray-500 text-sm mt-1">Ringkasan kondisi arus kasmu saat ini.</p>
      </div>

      {/* 2. AREA KARTU RINGKASAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-xl">
            <Wallet size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Total Saldo</p>
            <h3 className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
              {formatRupiah(summary.balance)}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
          <div className="p-4 bg-green-100 text-green-600 rounded-xl">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Pemasukan</p>
            <h3 className="text-2xl font-bold text-green-600">
              {formatRupiah(summary.totalIncome)}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
          <div className="p-4 bg-red-100 text-red-600 rounded-xl">
            <TrendingDown size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Pengeluaran</p>
            <h3 className="text-2xl font-bold text-red-600">
              {formatRupiah(summary.totalExpense)}
            </h3>
          </div>
        </div>

      </div> 
      {/* Akhir dari Area Kartu Ringkasan */}

      {/* 3. AREA GRAFIK TREN BULANAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Grafik Utama memakan 2 kolom */}
        <div className="lg:col-span-2">
          <MonthlyTrendChart />
        </div>

        {/* Kotak kosong untuk Pie Chart selanjutnya */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center">
          <CategoriExpenseChart />
        </div>
        
      </div>
      
      {/* {4. AREA STATUS ANGGARAN} */}
      <div className="mt-8">
        <BudgetProgress />
      </div>

    </div>
  );
}