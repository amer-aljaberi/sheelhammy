import { PrismaClient, Role, OrderStatus } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env") });

const connectionString = process.env.DATABASE_URL || "";

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

let prisma: PrismaClient;

try {
  const url = new URL(connectionString);
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    connectionLimit: 10,
    connectTimeout: 30000,
    acquireTimeout: 30000,
    allowPublicKeyRetrieval: true,
  });

  prisma = new PrismaClient({ adapter });
} catch (error) {
  console.error("❌ Error creating Prisma client:", error);
  console.error("Please check your DATABASE_URL in .env file");
  process.exit(1);
}

async function main() {
  console.log("🌱 Starting seed...");

  // Create Admin User
  const adminPassword = await bcrypt.hash("Amer@@sheelhammy2002", 10);
  const admin = await prisma.user.upsert({
    where: { email: "help.sheelhammy@gmail.com" },
    update: {},
    create: {
      email: "help.sheelhammy@gmail.com",
      password: adminPassword,
      name: "مدير النظام",
      role: Role.ADMIN,
      phone: "7 8185 8647",
      phoneCountryCode: "+962",
      defaultProfitRate: null,
      isActive: true,
    },
  });
  console.log("✅ Admin user created:", admin.email);
  console.log("   Email: admin@sheelhammy.com");
  console.log("   Password: Amer@@sheelhammy2002");
  
  console.log("🎉 Seed completed successfully!");
  
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
