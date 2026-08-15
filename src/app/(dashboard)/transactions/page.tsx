import { Plus } from "lucide-react";

export default function TransactionsPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* --- Bagian Header & Tombol Tambah --- */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Riwayat Transaksi</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola semua pemasukan dan pengeluaranmu di sini.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
          <Plus size={18} />
          Catat Transaksi
        </button>
      </div>

      {/* --- Bagian Tabel Transaksi --- */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
              <th className="p-4 font-semibold">Tanggal</th>
              <th className="p-4 font-semibold">Deskripsi</th>
              <th className="p-4 font-semibold">Kategori</th>
              <th className="p-4 font-semibold text-right">Nominal</th>
              <th className="p-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {/* 
              Ini adalah data statis sementara (Dummy). 
              Nanti kita akan menggantinya dengan data asli dari database. 
            */}
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="p-4 text-gray-600">15 Agu 2026</td>
              <td className="p-4 font-medium text-gray-800">Beli Nasi Goreng Spesial</td>
              <td className="p-4">
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
                  Makanan
                </span>
              </td>
              <td className="p-4 text-right font-bold text-red-600">- Rp 250.000</td>
              <td className="p-4 text-center">
                <button className="text-blue-500 hover:text-blue-700 mr-4 font-medium">Edit</button>
                <button className="text-red-500 hover:text-red-700 font-medium">Hapus</button>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="p-4 text-gray-600">14 Agu 2026</td>
              <td className="p-4 font-medium text-gray-800">Gaji Bulanan</td>
              <td className="p-4">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                  Gaji
                </span>
              </td>
              <td className="p-4 text-right font-bold text-green-600">+ Rp 5.000.000</td>
              <td className="p-4 text-center">
                <button className="text-blue-500 hover:text-blue-700 mr-4 font-medium">Edit</button>
                <button className="text-red-500 hover:text-red-700 font-medium">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}