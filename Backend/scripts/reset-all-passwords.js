/**
 * Reset all users' passwords to 123456.
 * Run from Backend folder: node scripts/reset-all-passwords.js
 * Ensure .env has DATABASE_URL set.
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import bcrypt from "bcryptjs";
import prisma from "../src/prisma.js";

const NEW_PASSWORD = "123456";

async function resetAllPasswords() {
  try {
    const passwordHash = await bcrypt.hash(NEW_PASSWORD, 10);

    const users = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
    if (users.length === 0) {
      console.log("No users found.");
      await prisma.$disconnect();
      process.exit(0);
      return;
    }

    await prisma.user.updateMany({
      data: { passwordHash },
    });

    console.log(`Password set to "${NEW_PASSWORD}" for ${users.length} user(s):`);
    users.forEach((u) => console.log(`  - ${u.email} (${u.name})`));
    console.log("Done.");

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

resetAllPasswords();
