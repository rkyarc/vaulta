"use client";

import { useState, useEffect } from "react";

export default function BudgetProgress() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBudgetProgress = async () => {
      try {
        const res = await fetch("/api/dashboard/budget-progress");
        const json = await res.json();
        if (json.success && json.data) {
          setBudgets(json.data);
        }
      } catch (error) {
        console.error("Gagal menarik data progress budget", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBudgetProgress();
  }, []);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-gray-500 font-medium">Memuat status anggaran...</p>
      </div>
    );
  }

  // Jika tidak ada data anggaran, kita tidak perlu menampilkan kotaknya
  if (budgets.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Status Anggaran Bulan Ini</h3>
      
      <div className="space-y-6">
        {budgets.map((budget, index) => {
          // Menentukan warna berdasarkan kecerdasan buatan dari Backend kita!
          let barColor = "bg-green-500"; // SAFE
          if (budget.status === "WARNING") barColor = "bg-yellow-500";
          if (budget.status === "EXCEEDED") barColor = "bg-red-500";

          // Cegah bar melebihi 100% agar UI tidak jebol ke samping
          const barWidth = budget.percentage > 100 ? 100 : budget.percentage;

          return (
            <div key={index}>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="font-medium text-gray-700">{budget.categoryName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRupiah(budget.spent)} terpakai dari {formatRupiah(budget.budgetAmount)}
                  </p>
                </div>
                <p className={`text-sm font-bold ${budget.status === 'EXCEEDED' ? 'text-red-600' : 'text-gray-700'}`}>
                  {budget.percentage}%
                </p>
              </div>
              
              {/* Latar Belakang Bar */}
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                {/* Bar Warna Berjalan */}
                <div 
                  className={`h-2.5 rounded-full ${barColor} transition-all duration-1000 ease-out`} 
                  style={{ width: `${barWidth}%` }}
                ></div>
              </div>
              
              {budget.status === 'EXCEEDED' && (
                <p className="text-xs text-red-500 mt-1 text-right">Telah melebihi batas anggaran!</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}