import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pengecekan sesi kita pindahkan ke Layout agar SEMUA halaman di dalam grup ini otomatis terproteksi!
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar akan selalu diam di sini */}
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header juga akan selalu diam di sini */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center h-[73px] shrink-0">
          <h1 className="text-xl font-bold text-gray-800">Vaulta Workspace</h1>
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

        {/* 'children' adalah tempat di mana isi halaman akan berganti-ganti */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}