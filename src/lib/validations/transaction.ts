import { z } from "zod";

export const createTransactionSchema = z.object({
  categoryId: z.number({ 
    error: () => ({ message: "Kategori wajib dipilih." }) 
  }).min(1, { message: "Kategori wajib dipilih." }),
  
  type: z.enum(["INCOME", "EXPENSE"], { 
    error: () => ({ message: "Tipe transaksi tidak valid." }) 
  }),
  
  amount: z.number({ 
    error: () => ({ message: "Nominal wajib diisi (tidak boleh kosong)." }) 
  }).min(1, { message: "Nominal transaksi minimal Rp 1." }),
  
  description: z.string({ 
    error: () => ({ message: "Deskripsi wajib diisi." }) 
  }).min(1, { message: "Deskripsi tidak boleh kosong." }),
  
  transactionDate: z.string({ 
    error: () => ({ message: "Tanggal wajib diisi." }) 
  }).regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Format tanggal harus YYYY-MM-DD." }),
});

export const updateTransactionSchema = createTransactionSchema.partial();
