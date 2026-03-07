/**
 * Database Reset Script using Prisma
 * Usage: npx tsx prisma/reset.ts [--skip-seed]
 */

import { exec } from "child_process";
import { promisify } from "util";
import * as readline from "readline";

const execAsync = promisify(exec);

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

async function main() {
  const skipSeed = process.argv.includes("--skip-seed");
  
  console.log("⚠️  WARNING: This will DROP the entire database and recreate it!");
  console.log("   All data will be lost!");
  console.log("");
  
  const confirm = await askQuestion("Are you sure you want to continue? (yes/no): ");
  
  if (confirm.toLowerCase() !== "yes") {
    console.log("❌ Reset cancelled");
    process.exit(0);
  }

  console.log("");
  console.log("🔄 Resetting database...");

  try {
    if (skipSeed) {
      console.log("   Skipping seed...");
      await execAsync("npx prisma migrate reset --skip-seed");
    } else {
      console.log("   Running seed after reset...");
      await execAsync("npx prisma migrate reset");
    }

    console.log("");
    console.log("✅ Database reset completed successfully!");
  } catch (error: any) {
    console.error("❌ Database reset failed:", error.message);
    process.exit(1);
  }
}

main();
