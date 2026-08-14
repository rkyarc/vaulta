import { getServerSession } from "next-auth";

export default async function Home() {
  // Mengambil data sesi pengguna yang sedang login dari server
  const session = await getServerSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-950 text-white">
      <h1 className="text-5xl font-bold mb-8">Vaulta</h1>
      
      {session ? (
        <div className="bg-emerald-900 border border-emerald-500 p-8 rounded-xl text-center">
          <h2 className="text-2xl font-semibold mb-2">🎉 Berhasil Login!</h2>
          <p className="text-lg mt-4">
            Selamat datang, <span className="font-bold text-emerald-300">{session.user?.name}</span>
          </p>
          <p className="text-emerald-100/70 mb-6">{session.user?.email}</p>
          
          {/* Ini adalah tombol Logout baru kita */}
          <a 
            href="/api/auth/signout" 
            className="inline-block px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Keluar (Logout)
          </a>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-700 p-8 rounded-xl text-center">
          <p className="text-lg">Kamu belum login.</p>
          <a 
            href="/api/auth/signin" 
            className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Masuk ke Akun
          </a>
        </div>
      )}
    </main>
  );
}