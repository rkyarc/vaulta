import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, { message: "Nama kategori wajib diisi." }),
  type: z.enum(["INCOME", "EXPENSE"], {
    required_error: "Tipe kategori wajib diisi.",
    invalid_type_error: "Tipe kategori harus INCOME atau EXPENSE.",
  }),
});