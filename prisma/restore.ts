/**
 * Database Restore Script using Prisma
 * Usage: npx tsx prisma/restore.ts <backup-file>
 */

import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import * as readline from "readline";
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

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
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

async function restoreFromSql(backupFile: string) {
  try {
    const dbConfig = await parseDatabaseUrl();
    
    console.log("⚠️  WARNING: This will DROP and RECREATE the database!");
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   Backup file: ${backupFile}`);
    console.log("");
    
    const confirm = await askQuestion("Are you sure you want to continue? (yes/no): ");
    if (confirm.toLowerCase() !== "yes") {
      console.log("❌ Restore cancelled");
      process.exit(0);
    }

    console.log("");
    console.log("🔄 Starting database restore...");

    // Create temporary SQL file
    const tempSqlFile = path.join(process.cwd(), "temp_restore.sql");
    const backupContent = fs.readFileSync(backupFile, "utf-8");
    
    const restoreScript = `
-- Drop database if exists
DROP DATABASE IF EXISTS \`${dbConfig.database}\`;

-- Create database
CREATE DATABASE \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use database
USE \`${dbConfig.database}\`;

-- Restore backup
${backupContent}
`;

    fs.writeFileSync(tempSqlFile, restoreScript, "utf-8");

    try {
      // Execute restore using mysql client
      const mysqlCommand = `mysql -h ${dbConfig.host} -P ${dbConfig.port} -u ${dbConfig.user} -p${dbConfig.password} < "${tempSqlFile}"`;
      await execAsync(mysqlCommand);
      
      console.log("✅ Database restored successfully!");
      
      // Run migrations
      console.log("");
      console.log("🔄 Running Prisma migrations...");
      await execAsync("npx prisma migrate deploy");
      console.log("✅ Migrations applied successfully!");
      
    } catch (error: any) {
      // If mysql client fails, try Prisma-based restore using $executeRaw
      console.log("⚠️  mysql client not available, using Prisma SQL restore method...");
      await restoreFromSqlUsingPrisma(backupFile, dbConfig);
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempSqlFile)) {
        fs.unlinkSync(tempSqlFile);
      }
    }
  } catch (error: any) {
    console.error("❌ Restore failed:", error.message);
    process.exit(1);
  }
}

async function restoreFromSqlUsingPrisma(backupFile: string, dbConfig: any) {
  try {
    console.log("🔄 Using Prisma Client for SQL restore...");
    
    const backupContent = fs.readFileSync(backupFile, "utf-8");
    
    // Remove comments and split SQL into individual statements
    const statements = backupContent
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        const trimmed = s.trim();
        return trimmed.length > 0 && 
               !trimmed.startsWith('--') && 
               !trimmed.startsWith('/*') &&
               !trimmed.startsWith('SET') &&
               !trimmed.startsWith('LOCK') &&
               !trimmed.startsWith('UNLOCK');
      });
    
    console.log(`   Found ${statements.length} SQL statements`);
    
    // Execute statements in batches
    let executed = 0;
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await prisma.$executeRawUnsafe(statement);
          executed++;
          if (executed % 50 === 0) {
            console.log(`   ✓ Executed ${executed}/${statements.length} statements`);
          }
        } catch (error: any) {
          // Skip errors for statements that might fail (e.g., DROP/CREATE DATABASE)
          const errorMsg = error.message.toLowerCase();
          if (errorMsg.includes('database') || 
              errorMsg.includes('already exists') || 
              errorMsg.includes('doesn\'t exist')) {
            continue;
          }
          // Log but continue for other errors
          if (executed % 100 === 0) {
            console.log(`   ⚠️  Some statements had errors (continuing...)`);
          }
        }
      }
    }
    
    console.log(`   ✓ Executed ${executed} statements successfully`);
    console.log("");
    console.log("✅ Prisma SQL restore completed!");
    
    // Run migrations
    console.log("");
    console.log("🔄 Running Prisma migrations...");
    try {
      await execAsync("npx prisma migrate deploy");
      console.log("✅ Migrations applied successfully!");
    } catch (error: any) {
      console.log("⚠️  Warning: Migrations may have failed. Please check manually.");
    }
  } catch (error: any) {
    throw new Error(`Prisma SQL restore failed: ${error.message}`);
  }
}

async function restoreFromJson(backupFile: string) {
  try {
    console.log("🔄 Using Prisma Client for JSON restore...");
    
    const backupContent = fs.readFileSync(backupFile, "utf-8");
    const backupData: BackupData = JSON.parse(backupContent);

    console.log(`   Backup timestamp: ${backupData.timestamp}`);
    console.log(`   Backup version: ${backupData.version}`);
    console.log("");

    // Get all tables from backup file
    const tablesInBackup = Object.keys(backupData.tables);
    console.log(`   Found ${tablesInBackup.length} tables in backup: ${tablesInBackup.join(", ")}`);
    console.log("");

    // Restore tables in order (respecting foreign key constraints)
    // Order matters: parent tables first, then child tables
    const restoreOrder = [
      "Settings",
      "Category",
      "Service",
      "PaymentMethod",
      "User",
      "Student",
      "Referrer",
      "Order",
      "Expense",
      "PaymentRecord",
      "Transfer",
      "ReferrerPayment",
      "Notification",
      "Testimonial",
      "FAQ",
      "Portfolio",
      "Blog",
    ];

    // Filter to only include tables that exist in backup
    const tablesToRestore = restoreOrder.filter(table => tablesInBackup.includes(table));
    
    // Add any tables from backup that aren't in restoreOrder
    tablesInBackup.forEach(table => {
      if (!restoreOrder.includes(table)) {
        tablesToRestore.push(table);
        console.log(`   ⚠️  Table ${table} found in backup but not in restore order, will restore at end`);
      }
    });

    // Clear existing data (in reverse order to respect foreign keys)
    console.log("🔄 Clearing existing data...");
    const clearOrder = [...tablesToRestore].reverse();
    for (const table of clearOrder) {
      try {
        const model = (prisma as any)[table.toLowerCase()];
        if (model && model.deleteMany) {
          await model.deleteMany({});
          console.log(`   ✓ Cleared ${table}`);
        } else {
          console.log(`   ⚠️  Model ${table.toLowerCase()} not found, skipping clear`);
        }
      } catch (error: any) {
        console.log(`   ⚠️  Could not clear ${table}: ${error.message}`);
      }
    }

    // Restore data
    console.log("");
    console.log("🔄 Restoring data...");
    let totalRestored = 0;
    
    for (const table of tablesToRestore) {
      if (backupData.tables[table] && Array.isArray(backupData.tables[table])) {
        const data = backupData.tables[table];
        
        if (data.length === 0) {
          console.log(`   ⚪ Skipped ${table}: no data to restore`);
          continue;
        }

        try {
          const model = (prisma as any)[table.toLowerCase()];
          
          if (!model) {
            console.log(`   ⚠️  Model ${table.toLowerCase()} not found, skipping ${table}`);
            continue;
          }

          // Process data: convert JSON strings to objects if needed
          const processedData = data.map((item: any) => {
            const processed: any = { ...item };
            // Convert JSON string fields to objects
            Object.keys(processed).forEach(key => {
              if (processed[key] && typeof processed[key] === 'string') {
                // Try to parse as JSON if it looks like JSON
                if (processed[key].startsWith('[') || processed[key].startsWith('{')) {
                  try {
                    processed[key] = JSON.parse(processed[key]);
                  } catch {
                    // Keep as string if parsing fails
                  }
                }
              }
            });
            return processed;
          });

          // Split into chunks to avoid memory issues
          const chunkSize = 50;
          let restored = 0;
          
          for (let i = 0; i < processedData.length; i += chunkSize) {
            const chunk = processedData.slice(i, i + chunkSize);
            try {
              await model.createMany({
                data: chunk,
                skipDuplicates: true,
              });
              restored += chunk.length;
            } catch (error: any) {
              // If createMany fails, try creating one by one
              if (chunk.length > 1) {
                console.log(`   ⚠️  Batch insert failed for ${table}, trying individual inserts...`);
              }
              for (const item of chunk) {
                try {
                  await model.create({ data: item });
                  restored++;
                } catch (err: any) {
                  // Try with upsert if create fails (might be duplicate)
                  try {
                    let whereClause: any = {};
                    
                    // Determine unique field based on table
                    if (item.id) {
                      whereClause = { id: item.id };
                    } else if (item.email && table === "User") {
                      whereClause = { email: item.email };
                    } else if (item.whatsapp && table === "Student") {
                      whereClause = { whatsapp: item.whatsapp };
                    } else if (item.slug && table === "Blog") {
                      whereClause = { slug: item.slug };
                    } else {
                      throw new Error("No unique field found");
                    }
                    
                    await model.upsert({
                        where: whereClause,
                        update: item,
                        create: item,
                      });
                      restored++;
                  } catch (upsertErr: any) {
                    console.log(`   ⚠️  Failed to restore item in ${table}: ${err.message.substring(0, 80)}`);
                  }
                }
              }
            }
          }
          
          console.log(`   ✓ Restored ${table}: ${restored}/${data.length} records`);
          totalRestored += restored;
        } catch (error: any) {
          console.log(`   ❌ Could not restore ${table}: ${error.message}`);
          console.log(`   Error details: ${error.stack?.substring(0, 200)}`);
        }
      } else {
        console.log(`   ⚪ Skipped ${table}: invalid or empty data`);
      }
    }

    console.log("");
    console.log(`✅ Prisma restore completed! Total records restored: ${totalRestored}`);
  } catch (error: any) {
    console.error("❌ Restore error details:", error);
    throw new Error(`Prisma restore failed: ${error.message}`);
  }
}

async function main() {
  const backupFile = process.argv[2];
  
  if (!backupFile) {
    console.error("❌ Please provide a backup file path");
    console.error("");
    console.error("Usage:");
    console.error("  npm run db:restore -- <backup-file>");
    console.error("  npx tsx prisma/restore.ts <backup-file>");
    console.error("");
    console.error("Examples:");
    console.error("  npm run db:restore -- backups/backup-2024-01-15.sql");
    console.error("  npm run db:restore -- backups/backup-2024-01-15.json");
    process.exit(1);
  }

  if (!fs.existsSync(backupFile)) {
    console.error(`❌ Backup file not found: ${backupFile}`);
    console.error("");
    console.error("Available backups:");
    const backupsDir = path.join(process.cwd(), "backups");
    if (fs.existsSync(backupsDir)) {
      const files = fs.readdirSync(backupsDir).filter(f => f.endsWith('.sql') || f.endsWith('.json'));
      if (files.length > 0) {
        files.forEach(f => console.error(`  - backups/${f}`));
      } else {
        console.error("  No backup files found in backups/ directory");
      }
    } else {
      console.error("  backups/ directory does not exist");
    }
    process.exit(1);
  }

  try {
    const isJson = backupFile.endsWith(".json");
    if (isJson) {
      const confirm = await askQuestion("⚠️  WARNING: This will DROP all data! Continue? (yes/no): ");
      if (confirm.toLowerCase() !== "yes") {
        console.log("❌ Restore cancelled");
        process.exit(0);
      }
      await restoreFromJson(backupFile);
    } else {
      await restoreFromSql(backupFile);
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
