"use client";

import { useState, useEffect } from "react";
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, AlertCircle } from "lucide-react";
import MonthlyTrendChart from "@/components/MonthlyTrendChart";
import CategoriExpenseChart from "@/components/CategoryExpenseChart";
import BudgetProgress from "@/components/BudgetProgress";
import RecentTransactions from "@/components/RecentTransactions";

export default function DashboardPage() {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    changes: {
      income: 0,
      expense: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/dashboard/summary");
        if (!res.ok) throw new Error("Gagal mengambil data dari server");
        const json = await res.json();
        if (json.success) {
          setSummary(json.data);
        } else {
          throw new Error(json.message);
        }
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan sistem");
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

  const renderBadge = (percentage: number, invert: boolean = false) => {
    if (percentage === 0) return <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Tetap</span>;
    
    const isPositive = percentage > 0;
    const isGood = invert ? !isPositive : isPositive;
    
    const colorClass = isGood ? "text-emerald-600 bg-emerald-100" : "text-rose-600 bg-rose-100";
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

    return (
      <span className={`text-xs inline-flex items-center font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
        <Icon size={12} className="mr-1" />
        {Math.abs(percentage)}% dari bln lalu
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 font-medium animate-pulse">Menghitung data keuangan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-red-50 rounded-2xl border border-red-100 p-6 text-center">
        <AlertCircle size={40} className="text-red-400 mb-3" />
        <h3 className="text-lg font-bold text-red-800">Gagal Memuat Dashboard</h3>
        <p className="text-red-600 mt-1">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors">
          Coba Lagi
        </button>
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
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Wallet size={24} />
            </div>
            <p className="text-sm font-semibold text-gray-500">Total Saldo</p>
          </div>
          <div>
            <h3 className={`text-3xl font-bold ${summary.balance >= 0 ? 'text-gray-800' : 'text-rose-600'}`}>
              {formatRupiah(summary.balance)}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                <TrendingUp size={24} />
              </div>
              <p className="text-sm font-semibold text-gray-500">Pemasukan</p>
            </div>
            {renderBadge(summary.changes?.income || 0, false)}
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-800">
              {formatRupiah(summary.totalIncome)}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                <TrendingDown size={24} />
              </div>
              <p className="text-sm font-semibold text-gray-500">Pengeluaran</p>
            </div>
            {renderBadge(summary.changes?.expense || 0, true)}
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-800">
              {formatRupiah(summary.totalExpense)}
            </h3>
          </div>
        </div>

      </div> 

      {/* 3. AREA GRAFIK TREN BULANAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyTrendChart />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center">
          <CategoriExpenseChart />
        </div>
      </div>
      
      {/* 4. AREA STATUS ANGGARAN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div>
          <BudgetProgress />
        </div>
        <div>
          <RecentTransactions />
        </div>
      </div>

    </div>
  );
}