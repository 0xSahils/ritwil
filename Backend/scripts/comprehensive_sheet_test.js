import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../src/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = "http://localhost:4000/api";

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(`${colors[color]}${args.join(' ')}${colors.reset}`);
}

async function login() {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@vbeyond.com", password: "123" }),
  });
  if (!res.ok) {
    throw new Error(`Login failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.accessToken;
}

function normalizeHeader(header) {
  if (!header) return "";
  return String(header)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "");
}

function analyzeSheet(filename) {
  const fullPath = path.resolve(__dirname, "..", "..", filename);
  log('cyan', `\n${'='.repeat(80)}`);
  log('bright', `Analyzing Sheet: ${filename}`);
  log('cyan', '='.repeat(80));

  const workbook = XLSX.readFile(fullPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

  if (!json.length) {
    log('red', `ERROR: Sheet ${filename} is empty`);
    return null;
  }

  // Find header row
  let headerRowIndex = -1;
  let headers = [];
  for (let i = 0; i < json.length; i++) {
    const row = json[i];
    if (!row || !row.length) continue;
    const rowLower = row.map((c) => String(c || "").trim().toLowerCase());
    
    // Check for personal sheet headers
    if (rowLower.includes("candidate name") && rowLower.includes("recruiter name")) {
      headerRowIndex = i;
      headers = row.map(h => String(h || "").trim());
      break;
    }
    // Check for team sheet headers
    if (rowLower.includes("candidate name") && (rowLower.includes("lead name") || rowLower.includes("lead"))) {
      headerRowIndex = i;
      headers = row.map(h => String(h || "").trim());
      break;
    }
  }

  if (headerRowIndex === -1) {
    log('red', `ERROR: Could not find header row in ${filename}`);
    return null;
  }

  log('green', `Found header row at index ${headerRowIndex}`);
  log('yellow', `Headers (${headers.length} columns):`, headers.join(' | '));

  // Determine sheet type
  const headerLower = headers.map(h => normalizeHeader(h));
  const isTeamSheet = headerLower.includes("lead name") || headerLower.includes("lead");
  const sheetType = isTeamSheet ? "TEAM" : "PERSONAL";
  log('magenta', `Sheet Type: ${sheetType}`);

  // Extract all data rows
  const dataRows = [];
  const summaryRows = [];
  let currentPersonBlock = null;
  let inPersonBlock = false;

  for (let i = headerRowIndex + 1; i < json.length; i++) {
    const row = json[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] || "").trim().toLowerCase();
    
    // Check if this is a "Team" header row (new person block)
    if (firstCell === "team") {
      inPersonBlock = true;
      currentPersonBlock = {
        teamRowIndex: i,
        summaryRowIndex: null,
        placementRows: [],
      };
      continue;
    }

    // Check if this is a summary row (has VB Code/Name but no candidate)
    const headerMap = {};
    headers.forEach((h, idx) => {
      headerMap[normalizeHeader(h)] = idx;
    });

    const getVal = (row, key) => {
      const idx = headerMap[normalizeHeader(key)];
      return idx !== undefined ? row[idx] : null;
    };

    const candidateName = getVal(row, "candidate name");
    const vbCode = getVal(row, "vb code");
    const recruiterName = getVal(row, "recruiter name");
    const leadName = getVal(row, "lead name") || getVal(row, "lead");

    const isSummaryRow = (vbCode || recruiterName || leadName) && !candidateName;
    const isHeaderRow = candidateName && normalizeHeader(candidateName) === "candidate name";

    if (isHeaderRow) {
      continue; // Skip duplicate header rows
    }

    if (isSummaryRow) {
      // Extract summary data
      const summaryData = {
        rowIndex: i,
        vbCode: vbCode ? String(vbCode).trim() : null,
        recruiterName: recruiterName ? String(recruiterName).trim() : null,
        leadName: leadName ? String(leadName).trim() : null,
        yearlyPlacementTarget: getVal(row, "yearly placement target"),
        placementDone: getVal(row, "placement done"),
        targetAchievedPercent: getVal(row, "target achieved %"),
        placementAchPercent: getVal(row, "placement ach %"),
        yearlyRevenueTarget: getVal(row, "yearly revenue target"),
        revenueAch: getVal(row, "revenue ach"),
        revenueTargetAchievedPercent: getVal(row, "revenue target achieved %"),
        totalRevenueGenerated: getVal(row, "total revenue generated (usd)"),
        slabQualified: getVal(row, "slab qualified"),
        totalIncentiveInr: getVal(row, "total incentive in inr"),
        totalIncentivePaidInr: getVal(row, "total incentive in inr (paid)"),
      };
      summaryRows.push(summaryData);
      if (currentPersonBlock) {
        currentPersonBlock.summaryRowIndex = i;
      }
      log('cyan', `  Summary row at ${i}:`, JSON.stringify(summaryData, null, 2));
      continue;
    }

    if (candidateName && normalizeHeader(candidateName) !== "candidate name") {
      // This is a placement row
      const placementData = {
        rowIndex: i,
        candidateName: String(candidateName).trim(),
        vbCode: vbCode ? String(vbCode).trim() : null,
        recruiterName: recruiterName ? String(recruiterName).trim() : null,
        leadName: leadName ? String(leadName).trim() : null,
        plcId: getVal(row, "plc id"),
        placementYear: getVal(row, "placement year"),
        doj: getVal(row, "doj"),
        doq: getVal(row, "doq"),
        client: getVal(row, "client"),
        revenueUsd: getVal(row, "revenue (usd)") || getVal(row, "revenue -lead (usd)"),
        incentiveInr: getVal(row, "incentive amount (inr)"),
        // Also extract summary fields from placement row
        yearlyPlacementTarget: getVal(row, "yearly placement target"),
        placementDone: getVal(row, "placement done"),
        targetAchievedPercent: getVal(row, "target achieved %"),
        placementAchPercent: getVal(row, "placement ach %"),
        yearlyRevenueTarget: getVal(row, "yearly revenue target"),
        revenueAch: getVal(row, "revenue ach"),
        revenueTargetAchievedPercent: getVal(row, "revenue target achieved %"),
        totalRevenueGenerated: getVal(row, "total revenue generated (usd)"),
        slabQualified: getVal(row, "slab qualified"),
        totalIncentiveInr: getVal(row, "total incentive in inr"),
        totalIncentivePaidInr: getVal(row, "total incentive in inr (paid)"),
      };
      dataRows.push(placementData);
      if (currentPersonBlock) {
        currentPersonBlock.placementRows.push(i);
      }
    }
  }

  log('green', `\nFound ${dataRows.length} placement rows`);
  log('green', `Found ${summaryRows.length} summary rows`);

  // Show sample data
  if (summaryRows.length > 0) {
    log('yellow', '\nSummary Rows Data:');
    summaryRows.forEach((s, idx) => {
      log('cyan', `  Summary ${idx + 1} (Row ${s.rowIndex}):`);
      log('cyan', `    VB Code: ${s.vbCode || 'N/A'}`);
      log('cyan', `    Recruiter/Lead: ${s.recruiterName || s.leadName || 'N/A'}`);
      log('cyan', `    Yearly Placement Target: ${s.yearlyPlacementTarget || 'N/A'}`);
      log('cyan', `    Yearly Revenue Target: ${s.yearlyRevenueTarget || 'N/A'}`);
      log('cyan', `    Placement Done: ${s.placementDone || 'N/A'}`);
      log('cyan', `    Total Revenue Generated: ${s.totalRevenueGenerated || 'N/A'}`);
      log('cyan', `    Slab Qualified: ${s.slabQualified || 'N/A'}`);
      log('cyan', `    Total Incentive INR: ${s.totalIncentiveInr || 'N/A'}`);
    });
  }

  if (dataRows.length > 0) {
    log('yellow', '\nSample Placement Rows (first 3):');
    dataRows.slice(0, 3).forEach((p, idx) => {
      log('cyan', `  Placement ${idx + 1} (Row ${p.rowIndex}):`);
      log('cyan', `    Candidate: ${p.candidateName}`);
      log('cyan', `    VB Code: ${p.vbCode || 'N/A'}`);
      log('cyan', `    PLC ID: ${p.plcId || 'N/A'}`);
      log('cyan', `    Revenue USD: ${p.revenueUsd || 'N/A'}`);
    });
  }

  return {
    filename,
    sheetType,
    headers,
    headerRowIndex,
    dataRows,
    summaryRows,
    allRows: json,
  };
}

async function uploadSheet(filename, sheetData, token) {
  log('bright', `\n${'='.repeat(80)}`);
  log('bright', `Uploading: ${filename}`);
  log('cyan', '='.repeat(80));

  const endpoint = sheetData.sheetType === "TEAM" 
    ? "/placements/import/team"
    : "/placements/import/personal";

  // Convert to headers and rows format
  const headers = sheetData.headers;
  const rows = sheetData.allRows.slice(sheetData.headerRowIndex + 1);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ headers, rows }),
    });

    const text = await res.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { error: text };
    }

    if (!res.ok) {
      log('red', `Upload FAILED: ${res.status}`);
      log('red', JSON.stringify(result, null, 2));
      return { success: false, error: result };
    }

    log('green', `Upload SUCCESS:`);
    log('green', JSON.stringify(result, null, 2));
    return { success: true, result };
  } catch (err) {
    log('red', `Upload ERROR: ${err.message}`);
    return { success: false, error: err.message };
  }
}

async function verifyUploadedData(sheetData, token) {
  log('bright', `\n${'='.repeat(80)}`);
  log('bright', `Verifying Uploaded Data for: ${sheetData.filename}`);
  log('cyan', '='.repeat(80));

  const issues = [];
  const successes = [];

  // Team names are not people - rows with team name in recruiter/lead column are correctly skipped by importer
  const teams = await prisma.team.findMany({ select: { name: true } });
  const teamNamesLower = new Set(teams.map((t) => String(t.name || "").trim().toLowerCase()));

  const isTeamNameOrUnknown = (key) => {
    if (!key || String(key).trim() === "") return true;
    const k = String(key).trim().toLowerCase();
    if (k === "unknown") return true;
    return teamNamesLower.has(k);
  };

  // Group data rows by person (VB Code or Name)
  const personGroups = new Map();
  
  for (const row of sheetData.dataRows) {
    const key = row.vbCode || row.recruiterName || row.leadName || 'unknown';
    if (!personGroups.has(key)) {
      personGroups.set(key, {
        vbCode: row.vbCode,
        recruiterName: row.recruiterName,
        leadName: row.leadName,
        summaryRow: null,
        placementRows: [],
      });
    }
    personGroups.get(key).placementRows.push(row);
  }

  // Match summary rows to person groups
  for (const summaryRow of sheetData.summaryRows) {
    const key = summaryRow.vbCode || summaryRow.recruiterName || summaryRow.leadName;
    if (key && personGroups.has(key)) {
      personGroups.get(key).summaryRow = summaryRow;
    }
  }

  // Verify each person's data (skip team names and "unknown" - these are not people)
  for (const [key, personData] of personGroups) {
    if (isTeamNameOrUnknown(key)) {
      log('cyan', `\nSkipping verification for "${key}" (team name or unknown – not a person)`);
      continue;
    }

    log('yellow', `\nVerifying person: ${key}`);
    
    // Find employee/lead in database by VBID first, then by recruiter/lead name
    let employee = null;
    if (personData.vbCode) {
      const profile = await prisma.employeeProfile.findFirst({
        where: { vbid: String(personData.vbCode).trim() },
        include: { user: true },
      });
      if (profile) employee = profile.user;
    }
    
    if (!employee && personData.recruiterName) {
      const profile = await prisma.employeeProfile.findFirst({
        where: { user: { name: { equals: personData.recruiterName, mode: "insensitive" } } },
        include: { user: true },
      });
      if (profile) employee = profile.user;
    }
    
    if (!employee && personData.leadName) {
      const profile = await prisma.employeeProfile.findFirst({
        where: { user: { name: { equals: personData.leadName, mode: "insensitive" } } },
        include: { user: true },
      });
      if (profile) employee = profile.user;
    }

    if (!employee) {
      issues.push({
        person: key,
        issue: "Person not found in database (by VBID or name)",
        type: "CRITICAL",
      });
      log('red', `  ❌ Person not found in database`);
      continue;
    }

    log('green', `  ✓ Found employee: ${employee.name} (ID: ${employee.id})`);

    // Check EmployeeProfile targets
    const profile = await prisma.employeeProfile.findUnique({
      where: { id: employee.id },
    });

    if (personData.summaryRow) {
      const summary = personData.summaryRow;
      
      // Check yearlyPlacementTarget
      if (summary.yearlyPlacementTarget) {
        const expected = parseFloat(String(summary.yearlyPlacementTarget).replace(/[^0-9.-]/g, ''));
        const actual = profile?.yearlyPlacementTarget;
        if (actual !== expected && actual !== null) {
          issues.push({
            person: key,
            field: "yearlyPlacementTarget",
            expected,
            actual,
            issue: "Target mismatch",
            type: "TARGET",
          });
          log('red', `  ❌ Yearly Placement Target: Expected ${expected}, Got ${actual}`);
        } else if (actual === expected) {
          successes.push({ person: key, field: "yearlyPlacementTarget", value: actual });
          log('green', `  ✓ Yearly Placement Target: ${actual}`);
        }
      }

      // Check yearlyRevenueTarget (for team sheets)
      if (summary.yearlyRevenueTarget) {
        const expected = parseFloat(String(summary.yearlyRevenueTarget).replace(/[^0-9.-]/g, ''));
        const actual = profile?.yearlyRevenueTarget;
        if (actual !== expected && actual !== null) {
          issues.push({
            person: key,
            field: "yearlyRevenueTarget",
            expected,
            actual,
            issue: "Revenue target mismatch",
            type: "TARGET",
          });
          log('red', `  ❌ Yearly Revenue Target: Expected ${expected}, Got ${actual}`);
        } else if (actual === expected) {
          successes.push({ person: key, field: "yearlyRevenueTarget", value: actual });
          log('green', `  ✓ Yearly Revenue Target: ${actual}`);
        }
      }
    }

    // Check placements in database
    if (sheetData.sheetType === "PERSONAL") {
      const placements = await prisma.personalPlacement.findMany({
        where: { employeeId: employee.id },
        orderBy: { createdAt: "desc" },
        take: personData.placementRows.length + 5, // Get a few extra to check
      });

      log('yellow', `  Found ${placements.length} placements in DB (expected ~${personData.placementRows.length})`);

      // Check summary data in placements
      if (placements.length > 0 && personData.summaryRow) {
        const summary = personData.summaryRow;
        const firstPlacement = placements[0];

        const checks = [
          { field: "yearlyPlacementTarget", expected: summary.yearlyPlacementTarget, actual: firstPlacement.yearlyPlacementTarget },
          { field: "placementDone", expected: summary.placementDone, actual: firstPlacement.placementDone },
          { field: "targetAchievedPercent", expected: summary.targetAchievedPercent, actual: firstPlacement.targetAchievedPercent },
          { field: "totalRevenueGenerated", expected: summary.totalRevenueGenerated, actual: firstPlacement.totalRevenueGenerated },
          { field: "slabQualified", expected: summary.slabQualified, actual: firstPlacement.slabQualified },
          { field: "totalIncentiveInr", expected: summary.totalIncentiveInr, actual: firstPlacement.totalIncentiveInr },
          { field: "totalIncentivePaidInr", expected: summary.totalIncentivePaidInr, actual: firstPlacement.totalIncentivePaidInr },
        ];

        for (const check of checks) {
          if (check.expected !== null && check.expected !== undefined && check.expected !== '') {
            const expectedVal = typeof check.expected === 'string' 
              ? check.expected.trim() 
              : check.expected;
            const actualVal = check.actual;
            
            if (actualVal === null || actualVal === undefined) {
              issues.push({
                person: key,
                field: check.field,
                expected: expectedVal,
                actual: null,
                issue: "Summary field missing in placement",
                type: "SUMMARY",
              });
              log('red', `  ❌ ${check.field}: Expected ${expectedVal}, Got NULL`);
            } else if (String(actualVal) !== String(expectedVal)) {
              issues.push({
                person: key,
                field: check.field,
                expected: expectedVal,
                actual: actualVal,
                issue: "Summary field mismatch",
                type: "SUMMARY",
              });
              log('red', `  ❌ ${check.field}: Expected ${expectedVal}, Got ${actualVal}`);
            } else {
              successes.push({ person: key, field: check.field, value: actualVal });
              log('green', `  ✓ ${check.field}: ${actualVal}`);
            }
          }
        }
      }
    } else {
      // Team placements
      const placements = await prisma.teamPlacement.findMany({
        where: { leadId: employee.id },
        orderBy: { createdAt: "desc" },
        take: personData.placementRows.length + 5,
      });

      log('yellow', `  Found ${placements.length} placements in DB (expected ~${personData.placementRows.length})`);

      if (placements.length > 0 && personData.summaryRow) {
        const summary = personData.summaryRow;
        const firstPlacement = placements[0];

        const checks = [
          { field: "yearlyPlacementTarget", expected: summary.yearlyPlacementTarget, actual: firstPlacement.yearlyPlacementTarget },
          { field: "yearlyRevenueTarget", expected: summary.yearlyRevenueTarget, actual: firstPlacement.yearlyRevenueTarget },
          { field: "placementDone", expected: summary.placementDone, actual: firstPlacement.placementDone },
          { field: "placementAchPercent", expected: summary.placementAchPercent, actual: firstPlacement.placementAchPercent },
          { field: "revenueAch", expected: summary.revenueAch, actual: firstPlacement.revenueAch },
          { field: "revenueTargetAchievedPercent", expected: summary.revenueTargetAchievedPercent, actual: firstPlacement.revenueTargetAchievedPercent },
          { field: "totalRevenueGenerated", expected: summary.totalRevenueGenerated, actual: firstPlacement.totalRevenueGenerated },
          { field: "slabQualified", expected: summary.slabQualified, actual: firstPlacement.slabQualified },
          { field: "totalIncentiveInr", expected: summary.totalIncentiveInr, actual: firstPlacement.totalIncentiveInr },
          { field: "totalIncentivePaidInr", expected: summary.totalIncentivePaidInr, actual: firstPlacement.totalIncentivePaidInr },
        ];

        for (const check of checks) {
          if (check.expected !== null && check.expected !== undefined && check.expected !== '') {
            const expectedVal = typeof check.expected === 'string' 
              ? check.expected.trim() 
              : check.expected;
            const actualVal = check.actual;
            
            if (actualVal === null || actualVal === undefined) {
              issues.push({
                person: key,
                field: check.field,
                expected: expectedVal,
                actual: null,
                issue: "Summary field missing in placement",
                type: "SUMMARY",
              });
              log('red', `  ❌ ${check.field}: Expected ${expectedVal}, Got NULL`);
            } else if (String(actualVal) !== String(expectedVal)) {
              issues.push({
                person: key,
                field: check.field,
                expected: expectedVal,
                actual: actualVal,
                issue: "Summary field mismatch",
                type: "SUMMARY",
              });
              log('red', `  ❌ ${check.field}: Expected ${expectedVal}, Got ${actualVal}`);
            } else {
              successes.push({ person: key, field: check.field, value: actualVal });
              log('green', `  ✓ ${check.field}: ${actualVal}`);
            }
          }
        }
      }
    }
  }

  return { issues, successes };
}

async function main() {
  try {
    log('bright', '\n' + '='.repeat(80));
    log('bright', 'COMPREHENSIVE SHEET TESTING SCRIPT');
    log('bright', '='.repeat(80));

    const token = await login();
    log('green', '✓ Logged in as admin@vbeyond.com\n');

    const sheetFiles = [
      "vantege recruitor.xlsx",
      "vantenge l2 sheet.xlsx",
      "CSK L4.xlsx",
      "akbar l2.xlsx",
      "vinothL L2.xlsx",
    ];

    const allIssues = [];
    const allSuccesses = [];

    for (const filename of sheetFiles) {
      try {
        // Analyze sheet
        const sheetData = analyzeSheet(filename);
        if (!sheetData) continue;

        // Upload sheet
        const uploadResult = await uploadSheet(filename, sheetData, token);
        if (!uploadResult.success) {
          allIssues.push({
            filename,
            type: "UPLOAD_ERROR",
            error: uploadResult.error,
          });
          continue;
        }

        // Wait a bit for DB to update
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify uploaded data
        const verification = await verifyUploadedData(sheetData, token);
        allIssues.push(...verification.issues.map(i => ({ ...i, filename })));
        allSuccesses.push(...verification.successes.map(s => ({ ...s, filename })));

      } catch (err) {
        log('red', `\nERROR processing ${filename}: ${err.message}`);
        allIssues.push({
          filename,
          type: "PROCESSING_ERROR",
          error: err.message,
        });
      }
    }

    // Final Report
    log('bright', `\n${'='.repeat(80)}`);
    log('bright', 'FINAL REPORT');
    log('cyan', '='.repeat(80));

    log('green', `\n✓ Successes: ${allSuccesses.length}`);
    log('red', `❌ Issues: ${allIssues.length}`);

    if (allIssues.length > 0) {
      log('red', '\nISSUES BY TYPE:');
      const byType = {};
      allIssues.forEach(issue => {
        const type = issue.type || 'UNKNOWN';
        if (!byType[type]) byType[type] = [];
        byType[type].push(issue);
      });

      Object.entries(byType).forEach(([type, issues]) => {
        log('yellow', `\n${type} (${issues.length} issues):`);
        issues.forEach(issue => {
          log('red', `  - ${issue.filename || 'Unknown'}: ${issue.person || ''} - ${issue.issue || issue.error}`);
          if (issue.field) {
            log('red', `    Field: ${issue.field}, Expected: ${issue.expected}, Got: ${issue.actual}`);
          }
        });
      });
    }

    log('bright', '\n' + '='.repeat(80));
    log('bright', 'TEST COMPLETE');
    log('cyan', '='.repeat(80));

  } catch (err) {
    log('red', `\nFATAL ERROR: ${err.message}`);
    console.error(err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
