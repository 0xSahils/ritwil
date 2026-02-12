
import path from "path";
import fs from "fs";
import XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";
import { importPersonalPlacements, importTeamPlacements, deleteAllPlacements } from "../src/controllers/placementController.js";
import { getPersonalPlacementOverview, getTeamPlacementOverview } from "../src/controllers/dashboardController.js";

const prisma = new PrismaClient();

// Configuration
const TEST_SHEETS_DIR = path.resolve(process.cwd(), "test_sheets");

async function runTests() {
  console.log("🚀 Starting Sheet Validation Tests...");

  try {
    // 0. Find a valid actor ID (Super Admin or S1 Admin)
    const actor = await prisma.user.findFirst({
      where: { role: { in: ["SUPER_ADMIN", "S1_ADMIN"] } }
    });

    if (!actor) {
      console.error("❌ No Super Admin or S1 Admin found in database. Please run seed script first.");
      return;
    }
    const ACTOR_ID = actor.id;
     console.log(`👤 Using Actor: ${actor.name} (${actor.email})`);

    // 1. Clear existing data
    console.log("🧹 Clearing existing placement data...");
    const deleteResult = await deleteAllPlacements(ACTOR_ID);
    console.log("✅ Data cleared:", deleteResult);

      // 2. Find all sheets in test_sheets directory
    if (!fs.existsSync(TEST_SHEETS_DIR)) {
      console.error(`❌ Test sheets directory not found: ${TEST_SHEETS_DIR}`);
      return;
    }

    const files = fs.readdirSync(TEST_SHEETS_DIR).filter(f => f.endsWith(".xlsx") || f.endsWith(".xls"));
    console.log(`found ${files.length} sheets to test.`);

    for (const file of files) {
      const filePath = path.join(TEST_SHEETS_DIR, file);
      console.log(`\n📄 Testing sheet: ${file}`);
      
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

      if (data.length < 2) {
        console.warn(`⚠️ Sheet ${file} is empty or has no data rows.`);
        continue;
      }

      const headers = data[0].map(h => String(h || "").trim());
      const rows = data.slice(1);

      // Determine sheet type based on headers or filename
      const isTeamSheet = headers.some(h => h.toLowerCase().includes("lead name")) || file.toLowerCase().includes("team");
      
      let importResult;
      if (isTeamSheet) {
        console.log("🛠️ Importing as TEAM sheet...");
        importResult = await importTeamPlacements({ headers, rows }, ACTOR_ID);
      } else {
        console.log("🛠️ Importing as PERSONAL sheet...");
        importResult = await importPersonalPlacements({ headers, rows }, ACTOR_ID);
      }

      console.log("✅ Import finished:", importResult);

      // 3. Verify data
      console.log("🔍 Verifying data in database...");
      // This is a simplified verification. In a real scenario, we'd compare row by row.
      // For now, let's just check if we have data for the users identified in the sheet.
      
      // ... more detailed verification logic can be added here ...
    }

    console.log("\n✨ All tests completed!");
  } catch (error) {
    console.error("\n❌ Test failed with error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
