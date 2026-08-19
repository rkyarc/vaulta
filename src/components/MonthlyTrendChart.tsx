"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Calendar, Inbox } from "lucide-react";

export default function MonthlyTrendChart() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const years = [currentYear, currentYear - 1, currentYear - 2];

  useEffect(() => {
    const fetchTrendData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/dashboard/monthly-trend?year=${selectedYear}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Gagal menarik data tren bulanan", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrendData();
  }, [selectedYear]); 

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const isEmptyData = data.every((d: any) => d.income === 0 && d.expense === 0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      
      {/* HEADER GRAFIK & FILTER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-bold text-gray-800">Tren Arus Kas</h3>
        
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
          >
            {years.map(y => (
              <option key={y} value={y}>Tahun {y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KONTEN GRAFIK */}
      <div className="h-72 w-full relative">
        {isLoading ? (
          <div className="absolute inset-0 flex justify-center items-center bg-white/60 z-10">
            <p className="text-gray-500 font-medium animate-pulse">Memuat grafik...</p>
          </div>
        ) : isEmptyData ? (
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
            <div className="p-4 bg-gray-50 rounded-full mb-3">
              <Inbox size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Belum ada transaksi di tahun {selectedYear}</p>
            <p className="text-gray-400 text-sm mt-1">Mulai catat transaksi pertamamu!</p>
          </div>
        ) : null}

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(val) => `Rp${val / 1000}k`} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip 
              formatter={(value: any) => formatRupiah(Number(value))}
              cursor={{ fill: '#f9fafb' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
            <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}