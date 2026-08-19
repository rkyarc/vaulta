import Link from "next/link";
import { Plus } from "lucide-react";
import TransactionDeleteButton from "@/components/TransactionDeleteButton";
import TransactionFilters from "@/components/TransactionFilters";
import Pagination from "@/components/Pagination";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/index";
import { transactions, categories } from "@/db/schema";
import { eq, desc, and, count } from "drizzle-orm"; 

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams;

  const session = await getServerSession(authOptions);
  const userId = parseInt((session?.user as any)?.id || "0");

  const page = Number(params.page) || 1;
  const typeFilter = params.type; 

  const LIMIT_PER_PAGE = 10; // Tampilkan 10 data per halaman
  const offset = (page - 1) * LIMIT_PER_PAGE;

  const filters = [eq(transactions.userId, userId)];
  
  if (typeFilter === "INCOME" || typeFilter === "EXPENSE") {
    filters.push(eq(categories.type, typeFilter));
  }

  const totalCountResult = await db
    .select({ value: count() })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...filters)); 
    
  const totalItems = totalCountResult[0].value;
  const totalPages = Math.ceil(totalItems / LIMIT_PER_PAGE);

  const rawTransactions = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      description: transactions.description,
      date: transactions.date,
      categoryName: categories.name,
      categoryType: categories.type,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...filters))
    .orderBy(desc(transactions.date))
    .limit(LIMIT_PER_PAGE)
    .offset(offset);

  const userTransactions = rawTransactions.map((trx) => ({
    ...trx,
    type: trx.categoryType || 'EXPENSE'
  }));

  // --- Fungsi Bantuan ---
  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric", month: "short", year: "numeric",
    }).format(new Date(date));
  };

  const formatRupiah = (amount: number | string | null) => {
    if (!amount) return "Rp 0";
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(numAmount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
      
      {/* Header & Filter */}
      <div className="p-6 border-b border-gray-100 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Riwayat Transaksi</h2>
            <p className="text-gray-500 text-sm mt-1">Kelola semua pemasukan dan pengeluaranmu di sini.</p>
          </div>
          <Link href="/transactions/create" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap">
            <Plus size={18} />
            Catat Transaksi
          </Link>
        </div>

        {/* 🚀 Pasang Komponen Filter di Sini */}
        <TransactionFilters />
      </div>

      {/* Tabel Transaksi */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[700px]">
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
            {userTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-500">
                  {typeFilter 
                    ? "Tidak ada transaksi yang cocok dengan filter ini." 
                    : "Belum ada transaksi yang dicatat. Mulai catat transaksi pertamamu!"}
                </td>
              </tr>
            ) : (
              userTransactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-600">{formatDate(trx.date)}</td>
                  <td className="p-4 font-medium text-gray-800">{trx.description}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      trx.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {trx.categoryName || "Tanpa Kategori"}
                    </span>
                  </td>
                  <td className={`p-4 text-right font-bold ${
                    trx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trx.type === 'INCOME' ? '+' : ''} {formatRupiah(trx.amount)}
                  </td>
                  <td className="p-4 text-center">
                    <Link href={`/transactions/${trx.id}/edit`} className="text-blue-500 hover:text-blue-700 mr-4 font-medium">Edit</Link>
                    <TransactionDeleteButton id={trx.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🚀 Pasang Komponen Pagination di Paling Bawah */}
      <Pagination totalPages={totalPages} />
    </div>
  );
}
