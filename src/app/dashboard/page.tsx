import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar"; // Memanggil komponen Sidebar

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 1. Sidebar Navigasi Kiri */}
      <Sidebar />

      {/* 2. Area Konten Utama Kanan */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Topbar / Header Kanan */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center h-[73px] shrink-0">
          <h1 className="text-xl font-bold text-gray-800">Ringkasan Keuangan</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm font-medium">
              Halo, <span className="text-gray-900 font-bold">{session.user.name}</span>
            </span>
            <Link
              href="/api/auth/signout?callbackUrl=/login"
              className="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Logout
            </Link>
          </div>
        </header>

        {/* Area Tempat Data Ditampilkan */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Area Analytics & Dashboard
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Di sinilah kita akan meletakkan grafik Pie Chart (Kategori Pengeluaran) dan grafik tren bulanan nanti. Untuk saat ini, mari fokus membangun fitur pencatatan transaksinya terlebih dahulu di menu sebelah kiri.
            </p>
          </div>
        </main>
        
      </div>
    </div>
  );
}