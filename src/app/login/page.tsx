"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Menggunakan signIn dari NextAuth, bukan fetch API manual
      const res = await signIn("credentials", {
        redirect: false, // Kita atur false agar bisa menangani error secara manual
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      // Jika berhasil login, arahkan ke halaman Dashboard
      router.push("/dashboard");
      router.refresh(); // Memaksa Next.js memuat ulang agar status session (login) terdeteksi
    } catch (err: any) {
      setError(err.message || "Email atau password salah");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Login ke Vaulta</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-black"
              placeholder="Masukkan email"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-black"
              placeholder="Masukkan password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-bold py-2 px-4 rounded focus:outline-none ${
              isLoading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Memeriksa..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Belum punya akun?{" "}
          <Link href="/register" className="text-blue-500 hover:text-blue-700 font-semibold">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}