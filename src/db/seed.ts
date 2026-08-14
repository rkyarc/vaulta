import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./index";
import { users, categories, transactions, budgets } from "./schema";

async function main() {
  console.log("🌱 Memulai proses seeding database...");

  try {
    // 1. Buat 1 User Dummy
    const [user] = await db.insert(users).values({
      name: "Ricky",
      email: "ricky@vaulta.com",
    }).returning();
    console.log("✅ User berhasil dibuat:", user.name);

    // 2. Buat 5 Kategori Dummy
    const insertedCategories = await db.insert(categories).values([
      { name: "Gaji", type: "income", userId: user.id },
      { name: "Makanan", type: "expense", userId: user.id },
      { name: "Transportasi", type: "expense", userId: user.id },
      { name: "Hiburan", type: "expense", userId: user.id },
      { name: "Tagihan", type: "expense", userId: user.id },
    ]).returning();
    console.log("✅ 5 Kategori berhasil dibuat");

    const foodCategory = insertedCategories.find(c => c.name === "Makanan")!;
    const transportCategory = insertedCategories.find(c => c.name === "Transportasi")!;

    // 3. Buat 3 Budget Dummy
    await db.insert(budgets).values([
      { amount: 1500000, periodStart: new Date("2026-08-01"), periodEnd: new Date("2026-08-31"), userId: user.id, categoryId: foodCategory.id },
      { amount: 500000, periodStart: new Date("2026-08-01"), periodEnd: new Date("2026-08-31"), userId: user.id, categoryId: transportCategory.id },
      { amount: 2000000, periodStart: new Date("2026-09-01"), periodEnd: new Date("2026-09-30"), userId: user.id, categoryId: foodCategory.id },
    ]);
    console.log("✅ 3 Budget berhasil dibuat");

    // 4. Buat 30 Transaksi Dummy (Menggunakan Loop)
    const dummyTransactions = [];
    for (let i = 1; i <= 30; i++) {
      dummyTransactions.push({
        amount: Math.floor(Math.random() * 50000) + 10000, // Random 10rb - 60rb
        description: `Makan siang hari ke-${i}`,
        date: new Date(`2026-08-${String(i).padStart(2, '0')}`),
        userId: user.id,
        categoryId: foodCategory.id,
      });
    }
    
    await db.insert(transactions).values(dummyTransactions);
    console.log("✅ 30 Transaksi berhasil dibuat");

    console.log("🎉 Seeding selesai 100%!");
  } catch (error) {
    console.error("❌ Terjadi kesalahan saat seeding:", error);
  } finally {
    process.exit(0);
  }
}

main();