import { z } from "zod";

export const createTransactionSchema = z.object({
  categoryId: z.number(),
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().min(1, { message: "Nominal transaksi minimal 1." }),
  description: z.string().min(1, { message: "Deskripsi wajib diisi." }),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Format tanggal harus YYYY-MM-DD." }),
});