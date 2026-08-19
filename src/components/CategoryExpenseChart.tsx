"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { AlertCircle } from "lucide-react";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function CategoryExpenseChart() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(""); 

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const res = await fetch("/api/dashboard/spending-by-category");
        if (!res.ok) throw new Error("Gagal mengambil data dari server");
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        } else {
          throw new Error(json.message);
        }
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan sistem");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategoryData();
  }, []);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="w-full h-full flex flex-col min-h-[300px]">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Porsi Pengeluaran</h3>
      
      <div className="flex-1 relative flex items-center justify-center">
        {isLoading ? (
          <p className="text-gray-500 font-medium animate-pulse">Memuat grafik...</p>
        ) : error ? (
          <div className="flex flex-col items-center text-center px-4">
            <AlertCircle size={24} className="text-red-400 mb-2" />
            <p className="text-sm font-medium text-red-600 mb-1">Gagal memuat grafik</p>
            <p className="text-xs text-red-400">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <p className="text-gray-400 text-sm">Belum ada data pengeluaran.</p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="75%"
                  paddingAngle={5}
                  dataKey="totalAmount"
                  nameKey="categoryName"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatRupiah(Number(value))}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend 
                  iconType="circle" 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '13px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}