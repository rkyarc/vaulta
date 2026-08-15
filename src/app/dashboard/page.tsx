import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  // 1. Proteksi Halaman: Cek apakah ada sesi login di server
  const session = await getServerSession(authOptions);

  // 2. Jika tidak ada sesi (belum login), tendang paksa ke halaman login
  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* --- Bagian Navigasi (Header) --- */}
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center border-b border-gray-200">
        <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">Vaulta.</h1>
        <div className="flex items-center gap-6">
          <span className="text-gray-700 font-medium">
            Halo, <span className="font-bold text-gray-900">{session.user.name}</span> 👋
          </span>
          {/* Tombol Logout menggunakan rute bawaan NextAuth */}
          <Link
            href="/api/auth/signout?callbackUrl=/login"
            className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-red-200"
          >
            Logout
          </Link>
        </div>
      </nav>

      {/* --- Konten Utama Dashboard --- */}
      <main className="max-w-7xl mx-auto p-8 mt-6">
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Selamat datang di Markas Utama! 🚀
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Ini adalah area terlarang. Halaman ini diproteksi dari sisi server, sehingga tidak ada satupun orang yang bisa mengintip ke sini tanpa melakukan otentikasi. Di sinilah kita akan merakit tabel riwayat transaksi dan grafik keuanganmu nanti.
          </p>
        </div>
      </main>
    </div>
  );
}