import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";

// 1. Table User
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255}).notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Table Categories
export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    userId: integer("user_id").references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Table Transactions
export const transactions = pgTable("transactions", {
    id: serial("id").primaryKey(),
    amount: integer("amount").notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    date: timestamp("date").notNull(),
    userId: integer("user_id").references(() => users.id).notNull(),
    categoryId: integer("category_id").references(() => categories.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Table Budgets
export const budgets = pgTable("budgets", {
    id: serial("id").primaryKey(),
    amount: integer("amount").notNull(),
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),
    // Foreign Key relasi ke tabel users dengan menggunakan references
    userId: integer("user_id").references(() => users.id).notNull(),
    categoryId: integer("category_id").references(() => categories.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})