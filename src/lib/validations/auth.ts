import { z } from "zod";

// 1. Aturan validasi untuk Form Pendaftaran (Register)
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Nama minimal harus 2 karakter." })
    .max(50, { message: "Nama maksimal 50 karakter." }),
  email: z
    .string()
    .email({ message: "Format email tidak valid." }),
  password: z
    .string()
    .min(6, { message: "Password minimal harus 6 karakter." }),
});

// 2. Aturan validasi untuk Form Masuk (Login)
export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Format email tidak valid." }),
  password: z
    .string()
    .min(1, { message: "Password wajib diisi." }),
});