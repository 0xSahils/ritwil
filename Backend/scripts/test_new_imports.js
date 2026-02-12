import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = "http://localhost:4000/api";

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

function sheetToHeadersAndRows(filename) {
  const fullPath = path.resolve(__dirname, "..", "..", filename);
  console.log(`Reading: ${fullPath}`);
  const workbook = XLSX.readFile(fullPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  if (!json.length) throw new Error(`Sheet ${filename} is empty`);

  // Find all header rows that contain the placement headers (Recruiter Name + Candidate Name...)
  const headerIndices = [];
  for (let i = 0; i < json.length; i++) {
    const row = json[i];
    if (!row || !row.length) continue;
    const rowLower = row.map((c) => String(c || "").trim().toLowerCase());
    if (rowLower.includes("candidate name") && rowLower.includes("recruiter name")) {
      headerIndices.push(i);
    }
  }

  if (headerIndices.length === 0) {
    throw new Error(
      `Could not find any placement header row (with 'Recruiter Name' and 'Candidate Name') in ${filename}`
    );
  }

  const headers = json[headerIndices[0]];
  const allRows = [];

  for (let h = 0; h < headerIndices.length; h++) {
    const start = headerIndices[h] + 1;
    const end = h + 1 < headerIndices.length ? headerIndices[h + 1] : json.length;
    for (let i = start; i < end; i++) {
      const row = json[i];
      if (!row || !row.length) continue;
      // Stop if we hit a summary header block starting with "Team"
      const firstCell = String(row[0] || "").trim().toLowerCase();
      if (firstCell === "team") break;
      allRows.push(row);
    }
  }

  console.log(`${filename}: ${allRows.length} data rows`);
  return { headers, rows: allRows };
}

async function postImport(pathSuffix, token, payload) {
  const res = await fetch(`${API_BASE}${pathSuffix}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  if (!res.ok) {
    throw new Error(`Import ${pathSuffix} failed: ${res.status} ${text}`);
  }
  console.log(`Import ${pathSuffix} succeeded:`, json);
}

async function main() {
  try {
    const token = await login();
    console.log("Logged in as admin@vbeyond.com");

    // Personal placements from CSK L4.xlsx
    const personal = sheetToHeadersAndRows("CSK L4.xlsx");
    await postImport("/placements/import/personal", token, personal);

    // Team placements from akbar l2.xlsx and vinothL L2.xlsx
    const teamFiles = ["akbar l2.xlsx", "vinothL L2.xlsx"];
    for (const file of teamFiles) {
      const teamPayload = sheetToHeadersAndRows(file);
      await postImport("/placements/import/team", token, teamPayload);
    }

    console.log("All imports completed successfully.");
  } catch (err) {
    console.error("Test imports failed:", err.message);
    process.exitCode = 1;
  }
}

main();

