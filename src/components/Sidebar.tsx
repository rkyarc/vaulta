"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Tags, Wallet } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname(); // Untuk mendeteksi halaman mana yang sedang aktif

  // Daftar menu navigasi
  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Transaksi", href: "/transactions", icon: Receipt },
    { name: "Kategori", href: "/categories", icon: Tags },
    { name: "Anggaran", href: "/budgets", icon: Wallet },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
      <div className="p-6 border-b border-gray-100 flex items-center h-[73px]">
        <h2 className="text-2xl font-extrabold text-blue-600 tracking-tight">Vaulta.</h2>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={20} className={isActive ? "text-blue-600" : "text-gray-400"} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}