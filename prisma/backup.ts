/**
 * Database Backup Script using Prisma
 * Usage: npx tsx prisma/backup.ts [backup-name]
 */

import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env") });

const execAsync = promisify(exec);

// Initialize Prisma Client with adapter
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

interface BackupData {
  timestamp: string;
  version: string;
  tables: Record<string, any[]>;
}

async function parseDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL not found in environment variables");
  }

  try {
    const url = new URL(databaseUrl);
    return {
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      host: url.hostname,
      port: url.port || "3306",
      database: url.pathname.slice(1),
    };
  } catch (error) {
    throw new Error(`Invalid DATABASE_URL format: ${error}`);
  }
}

async function backupUsingMysqldump(backupName?: string) {
  try {
    const dbConfig = await parseDatabaseUrl();
    
    // Create backups directory
    const backupsDir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
      console.log("✅ Created backups directory");
    }

    // Generate backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const filename = backupName 
      ? `${backupName}.sql`
      : `backup_${timestamp}.sql`;
    const backupPath = path.join(backupsDir, filename);

    console.log("🔄 Starting database backup...");
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   Backup file: ${filename}`);
    console.log("");

    // Use mysqldump if available
    const mysqldumpCommand = `mysqldump -h ${dbConfig.host} -P ${dbConfig.port} -u ${dbConfig.user} -p${dbConfig.password} --single-transaction --routines --triggers ${dbConfig.database} > "${backupPath}"`;
    
    try {
      await execAsync(mysqldumpCommand);
      const stats = fs.statSync(backupPath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      console.log("✅ Backup completed successfully!");
      console.log(`   File: ${backupPath}`);
      console.log(`   Size: ${fileSizeMB} MB`);
      return backupPath;
    } catch (error: any) {
      // If mysqldump fails, try Prisma-based backup
      console.log("⚠️  mysqldump not available, using Prisma backup method...");
      return await backupUsingPrisma(backupPath);
    }
  } catch (error: any) {
    console.error("❌ Backup failed:", error.message);
    process.exit(1);
  }
}

async function backupUsingPrisma(backupPath: string): Promise<string> {
  console.log("🔄 Using Prisma Client for backup...");
  
  const backupData: BackupData = {
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    tables: {},
  };

  try {
    // Backup all tables
    const tables = [
      "User",
      "Student",
      "Category",
      "Service",
      "Testimonial",
      "FAQ",
      "Portfolio",
      "Order",
      "Expense",
      "PaymentRecord",
      "Transfer",
      "Notification",
      "Settings",
      "PaymentMethod",
      "Blog",
      "Referrer",
      "ReferrerPayment",
    ];

    for (const table of tables) {
      try {
        const data = await (prisma as any)[table.toLowerCase()].findMany();
        backupData.tables[table] = data;
        console.log(`   ✓ Backed up ${table}: ${data.length} records`);
      } catch (error: any) {
        // Table might not exist or have different name
        console.log(`   ⚠️  Skipped ${table}: ${error.message}`);
      }
    }

    // Save as JSON
    const jsonPath = backupPath.replace(".sql", ".json");
    fs.writeFileSync(jsonPath, JSON.stringify(backupData, null, 2), "utf-8");
    
    const stats = fs.statSync(jsonPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log("✅ Prisma backup completed!");
    console.log(`   File: ${jsonPath}`);
    console.log(`   Size: ${fileSizeMB} MB`);
    return jsonPath;
  } catch (error: any) {
    throw new Error(`Prisma backup failed: ${error.message}`);
  }
}

async function main() {
  const backupName = process.argv[2];
  
  try {
    await backupUsingMysqldump(backupName);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
