"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah halaman reload saat tombol ditekan
    setError("");
    setIsLoading(true);

    try {
      // Menembak API Backend yang sudah kita buat sebelumnya
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Terjadi kesalahan saat mendaftar");
      }

      // Jika sukses, arahkan ke halaman login
      alert("Registrasi berhasil! Silakan login.");
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Daftar Akun Vaulta</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Nama Lengkap
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-black"
              placeholder="Masukkan nama"
              required
            />
          </div>

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
              placeholder="Minimal 6 karakter"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-bold py-2 px-4 rounded focus:outline-none ${
              isLoading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-blue-500 hover:text-blue-700 font-semibold">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}