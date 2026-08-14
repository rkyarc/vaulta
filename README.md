# Vaulta 💰

Vaulta adalah aplikasi pencatat keuangan modern yang dirancang untuk membantu pengguna mengelola keuangan dengan lebih mudah.

> **Status Proyek:** 🚧 Work in Progress (WIP) - Sedang dalam tahap pengembangan aktif.

## 🛠️ Tech Stack

Proyek ini dibangun menggunakan teknologi modern:
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Database:** PostgreSQL (via [Neon DB](https://neon.tech/))
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [Auth.js / NextAuth](https://next-auth.js.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)

## 🚀 Cara Menjalankan Proyek (Local Development)

Ikuti langkah-langkah di bawah ini untuk menjalankan Vaulta di komputer lokalmu:

1. **Install dependensi**
   Pastikan kamu sudah berada di dalam folder proyek, lalu jalankan:
   ```bash
   npm install
   ```

2. **Konfigurasi Environment Variables**
   Buat file bernama `.env.local` di root direktori proyek, lalu isi dengan variabel berikut:
   ```env
   DATABASE_URL="postgresql://<username>:<password>@<host>/<database>?sslmode=require"
   AUTH_SECRET="kunci_rahasia_bebas_untuk_development"
   ```

3. **Jalankan Development Server**
   ```bash
   npm run dev
   ```

4. **Buka Aplikasi**
   Buka browser dan kunjungi [http://localhost:3000](http://localhost:3000/) untuk melihat hasilnya.

## 📁 Struktur Database (Sejauh ini)

- `users`: Menyimpan data pengguna.
- `categories`: Kategori pemasukan/pengeluaran (Makanan, Gaji, dll).
- `transactions`: Riwayat transaksi.
- `budgets`: Rencana anggaran per kategori.