import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 space-y-6">
      <h1 className="text-4xl font-bold text-blue-600">
        Selamat Datang di Vaulta
      </h1>
      
      {/* Ini adalah tombol dari shadcn/ui */}
      <Button>
        Mulai Catat Keuangan
      </Button>
    </main>
  );
}