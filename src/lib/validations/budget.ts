import { z } from "zod";

export const createBudgetSchema = z.object({
  categoryId: z.string({
    error: () => ({ message: "Pilih kategori anggaran terlebih dahulu." }),
  }).min(1, { message: "Kategori tidak boleh kosong." }),
  
  amount: z.coerce.number({
    error: () => ({ message: "Nominal harus berupa angka." }),
  }).min(1000, { message: "Minimal anggaran adalah Rp 1.000." }),

  periodStart: z.string({
    error: () => ({ message: "Tanggal mulai wajib diisi." }),
  }).min(1, { message: "Tanggal mulai tidak boleh kosong." }),
  
  periodEnd: z.string({
    error: () => ({ message: "Tanggal selesai wajib diisi." }),
  }).min(1, { message: "Tanggal selesai tidak boleh kosong." }),
});
