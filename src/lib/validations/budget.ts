import { z } from "zod";

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, "Pilih kategori anggaran terlebih dahulu."),
  amount: z.coerce.number().min(1000, "Minimal anggaran adalah Rp 1.000."),
  periodStart: z.string().min(1, "Tanggal mulai wajib diisi."),
  periodEnd: z.string().min(1, "Tanggal selesai wajib diisi."),
});
