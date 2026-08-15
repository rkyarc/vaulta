import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, { message: "Nama kategori wajib diisi." }),
  type: z.enum(["INCOME", "EXPENSE"]),
});