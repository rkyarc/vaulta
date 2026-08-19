import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string({
    error: () => ({ message: "Nama kategori wajib diisi." })
  }).min(1, { message: "Nama kategori tidak boleh kosong." }),
  
  type: z.enum(["INCOME", "EXPENSE"], {
    error: () => ({ message: "Tipe kategori tidak valid." })
  }),
});
