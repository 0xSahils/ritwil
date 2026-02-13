# Comprehensive Project Architecture & Business Logic (Ritwil Dashboard)

This document provides a deep-dive into the architectural decisions, data flow, and specific business logic implemented in the Ritwil Performance Dashboard. It serves as a source of truth for all agents and developers working on the stack.

---

## 1. Core Architectural Strategy

### **Sheet-Backed Logic**
The system is designed to complement existing Excel-based workflows. Data is imported from "Personal" and "Team" Excel sheets.
- **Outcome**: The dashboard reflects the exact calculations used in corporate spreadsheets, including incentives and targets, while providing a modern web interface.

### **The "Dual-Lookup" Strategy (Basic Info vs. Performance)**
A major user requirement was to ensure the "Basic Information" (top section of Employee Details) never goes blank, regardless of the year filter.
- **Logic**: Every dashboard request triggers two separate database lookups for each employee.
  1. **Unfiltered Lookup**: Fetches the *latest* summary from `PersonalPlacement` (ordering by year and date). This populates static fields like `Individual Synopsis`, `VB Code`, and `Slab Qualified`.
  2. **Year-Filtered Lookup**: Fetches data matching the user's selected `year`. This populates dynamic performance fields like `Placements Achieved`, `Revenue`, and `Target Achieved %`.
- **Outcome**: If a user selects "2026" and no data exists yet, the performance stats show 0, but the `Individual Synopsis` still shows the employee's current master status.

---

## 2. Role-Based Data Visibility (RBAC)

### **S1_ADMIN (Highest Level)**
- **Logic**: Sees an overview of all 9 teams. Identifies "L1 Admins" by scanning the management hierarchy of every team member.
- **Outcome**: Provides a "God-view" of the entire organization. Can see which teams are assigned to which L1/L2 admins.

### **TEAM_LEAD (L2 / L3)**
- **Logic**: Uses a recursive hierarchy builder (`buildHierarchy`).
  - **L2 (Senior Lead)**: Sees their entire team, including L3 leads and their reports (L4).
  - **L3 (Junior Lead)**: Sees only their direct subordinates (L4).
- **Outcome**: Precise visibility based on the management chain. If an L3 is part of an L2's team, the L2 sees the L3's data *and* the aggregated data of everyone under that L3.

---

## 3. Database & Schema Logic

### **Level-Based Data Separation**
The `level` column (L1, L2, L3, L4) in `PersonalPlacement` and `TeamPlacement` is used to differentiate data for the same user.
- **Logic**: A user might have different targets or summaries depending on their role (e.g., as a direct recruiter vs. a team manager).
- **Outcome**: Queries are always scoped with `where: { level: userProfile.level }` to ensure the correct role-specific summary is displayed.

### **Manual Schema Synchronization**
Due to Windows file-lock (EPERM) issues during `npx prisma generate`, we use a manual approach for database updates.
- **Logic**: Critical columns like `individualSynopsis` and `level` were added via raw SQL `ALTER TABLE` commands.
- **Outcome**: The database and the Prisma Client (in `src/generated/client`) are in sync even when the automatic generation tool fails.

---

## 4. Key Performance Calculations

### **Recursive Metric Aggregation**
- **Logic**: The total revenue for a manager is calculated as:
  `Own Revenue + SUM(Direct Subordinates' Total Revenue)`
- **Outcome**: Real-time roll-up of performance metrics from L4 up to L1.

### **Target Prioritization**
- **Logic**: 
  1. Check for a target in the specific `year` record.
  2. Fallback to the latest `PersonalPlacement` target.
  3. Fallback to the `EmployeeProfile` base target.
- **Outcome**: Accurate target tracking even when data is partially imported.

---

## 5. Deployment & Testing Procedures

### **Data Cleanup Logic (`cleanup_data.js`)**
- **Action**: Wipes all placement records and resets `yearlyTarget`, `placementsDone`, and `totalRevenue` in `EmployeeProfile` and `Team` models to 0.
- **Outcome**: Allows for a completely clean "dry run" of Excel imports to verify calculations from scratch.

### **Environment Consistency**
- **Backend Location**: `Backend/`
- **Prisma Client Location**: `Backend/src/generated/client`
- **Logs**: Detailed console logging is enabled for `getSuperAdminOverview` and `buildHierarchy` to trace data leakage or visibility bugs.

---

## 6. Sheet Import: Edge Cases & Implementation Notes

This section documents import rules, header validation, value parsing, summary-only rows, and UI behavior added/refined for both **Personal (Recruiter)** and **Team** sheet imports. Use it as the single reference for "what we did" and edge-case handling.

### **6.1 Target Type by Team (Stored in DB)**

- **Rule**: Target type is derived from **team name**, not from sheet or member mix.
  - **Vantage** (team name contains `"vant"`, case-insensitive) → `targetType = REVENUE`.
  - **All other teams** → `targetType = PLACEMENTS`.
- **Where it’s applied**:
  - **Team API** (`teamController`): `getTeams` and `getTeamDetails` return `targetType` from team name.
  - **Personal sheet import** (`placementController`): For every updated `EmployeeProfile`, `targetType` is set from the employee’s team name (vant → REVENUE, else PLACEMENTS).
  - **Dashboard team cards** (`dashboardController`): `isPlacementTeam = !team.name.toLowerCase().includes('vant')` (revenue vs placement aggregation).
- **DB sync**: Run `npm run sync-target-types` in `Backend/` to one-time sync all `EmployeeProfile.targetType` from team names. Script: `scripts/sync-target-types-from-teams.js`.

### **6.2 Header Validation & Normalization**

- **Normalization** (`normalizeHeader`):
  - Trim, lowercase.
  - `"pls id"` → `"plc id"`.
  - Collapse spaces around parentheses: `"Revenue (USD)"` and `"Revenue(USD)"` both become `"revenue(usd)"`.
- **Validation**:
  - **Team sheet**: First row (or detected summary/placement header row) is validated against `REQUIRED_TEAM_SUMMARY_HEADERS` or `REQUIRED_TEAM_PLACEMENT_HEADERS`. Required keys are normalized before comparison (`validateRequiredHeaders` uses `normalizeHeader` on each required key).
  - **Personal sheet**: Same idea; required sets are `REQUIRED_PERSONAL_SUMMARY_HEADERS` and `REQUIRED_PERSONAL_PLACEMENT_HEADERS`. Summary accepts "target achieved %" or "placement ach %"; placement requires recruiter/vb code.
- **Lookup**: Both team and personal import use `getVal(row, key)` with `normalizeHeader(key)` so headers with/without spaces around parentheses match.

### **6.3 Value Parsing & Edge Cases**

- **parseNum**: Treats empty, `NA`, `N/A`, `-`, `#N/A`, `#REF!`, `#VALUE!`, `#DIV/0!`, `#NAME?` as null/default. Strips commas; keeps digits, one minus, one decimal point.
- **parseDateCell**: Same Excel/error strings return null; invalid dates (e.g. 1/0/1990) are rejected.
- **sanitizePercent**: Handles 0–1 as decimal (e.g. 0.85 → 85%); 1–10 as over-100% (e.g. 1.01 → 101%). Capped to ±999.99 for DB.
- **capPlacementDone**: Used for `placementDone` only. Rejects negative; allows 0 up to schema max (no 999.99 cap). Schema: `Decimal(14, 2)` on `PersonalPlacement` and `TeamPlacement` so values like 22050 are stored correctly.
- **capDecimal5_2**: Used for other Decimal(5,2) fields (e.g. percentages); caps to ±999.99.

### **6.4 Summary-Only Rows (No Placements)**

- **Team import**: If a lead has summary data but no placement rows in the sheet, we create one **summary-only** row: `candidateName: "(Summary only)"`, `plcId: "SUMMARY-{leadId}"`, placeholder doj/client, and full summary fields. If a summary-only row already exists for that lead, we **update** it (resolve by `plcId` prefix + leadId). When a later import adds **real** placement rows for that lead, we **delete** that lead’s summary-only row in the same transaction.
- **Personal import**: Same approach for recruiters. Employees with summary data but no placement rows get one row: `plcId: "SUMMARY-{employeeId}"`, `candidateName: "(Summary only)"`, placeholders for doj/client/revenue/incentive, and full summary. Existing summary-only row is resolved and updated; when real placements are imported for that employee, the summary-only row is deleted in the same transaction.
- **API**: `getPersonalPlacementOverview` and team placement overview exclude summary-only rows from the **placements** list; summary is built from the summary-only row (or merged from any row with non-null fields). Dashboard does not list SUMMARY rows in placement tables.

### **6.5 Personal vs Team Yearly Target & Summary Source**

- **L2/personal yearly target**: For personal view, summary (and thus yearly placement target) must come from the **summary-only row** or from a row that belongs to that employee. `getPersonalPlacementOverview` prefers the summary-only row for building `summary`; if a field is null there, it is filled from the first non-null value across all rows (`pick(field)`). So DB-correct values on any row are reflected.
- **Wrong target from another person**: Personal import uses **only** `employeeSummaryData.get(employee.id)` when resolving summary for a placement row (never `currentSummaryRow`). So L2/L3 in an L4 sheet do not get L4’s or team summary’s yearly target.

### **6.6 Placement Done: Schema & UI**

- **Schema**: `placementDone` is `Decimal(14, 2)` on both `PersonalPlacement` and `TeamPlacement` (large values like 22050 supported).
- **Import**: Values go through `capPlacementDone` (no 999.99 cap; only negative rejected).
- **Frontend**: Individual Performance Summary (personal view) shows **Placement Target**, **Placements Done**, and **Placement Ach %** when `personalSummary` exists. Team view already showed these. Personal summary table does **not** show "Revenue Target" (personal sheets are placement-focused: yearly placement target + placement done).

### **6.7 Personal Sheet Required Headers**

- **Summary block**: Team, VB Code, Recruiter Name, Team Lead, Yearly Placement Target, Placement Done, Target Achieved % (or Placement Ach %), Total Revenue Generated (USD), Slab qualified, Total Incentive in INR, Total Incentive in INR (Paid). At least one of: recruiter name, lead name, lead, recruiter.
- **Placement block**: Recruiter Name, Candidate Name, Placement Year, DOJ, DOQ, Client, PLC ID, Placement Type, Billing Status, Collection Status, Total Billed Hours, Revenue (USD), Incentive amount (INR), Incentive Paid (INR).

### **6.8 Team Sheet Required Headers**

- **Summary**: Team, VB Code, Lead Name, Yearly Placement Target, Placement Done, Placement Ach %, Yearly Revenue Target, Revenue Ach, Revenue Target Achieved %, Total Revenue Generated (USD), Slab qualified, Total Incentive in INR, Total Incentive in INR (Paid).
- **Placement**: Lead Name, Candidate Name, Recruiter Name, Lead, Split With, Placement Year, DOJ, DOQ, Client, PLC ID, Placement Type, Billing Status, Collection Status, Total Billed Hours, Revenue -Lead (USD), Incentive amount (INR), Incentive Paid (INR).

### **6.9 Scripts**

- **Sync target type from team name**: `npm run sync-target-types` (runs `scripts/sync-target-types-from-teams.js`). Updates every `EmployeeProfile.targetType` from their team’s name (vant → REVENUE, else PLACEMENTS).

### **6.10 Edge Case Checklist**

| Scenario | Handling |
|----------|----------|
| Recruiter has summary row but no placement rows | Create/update one summary-only row (`SUMMARY-{employeeId}`); delete it when a later import adds real placements. |
| Lead has summary but no placement rows (team sheet) | Same with `SUMMARY-{leadId}`; delete when real team placements added. |
| L2/L3 in L4 sheet with personal data | Use only that employee’s summary (`employeeSummaryData.get(employee.id)`); never `currentSummaryRow`. |
| Sheet has "Placement Done" = 22050 | Stored as-is; schema Decimal(14,2), no 999.99 cap. |
| Header "Revenue (USD)" vs "Revenue(USD)" | Both match via `normalizeHeader` (collapse spaces around parens). |
| Excel errors (#N/A, #REF!) in cells | parseNum/parseDateCell treat as null. |
| First row is placement block (no summary block) | Personal/team validation accepts placement-only header set. |
| Personal view yearly target wrong although DB correct | Summary built from summary-only row + `pick()` fallback from any row; no longer tied to latest-by-DOJ only. |
| Placement done 999.99 from wrong column | Previously capped; now capPlacementDone allows large values; schema supports up to Decimal(14,2) range. |
| Personal sheet shows Revenue Target | Removed from Individual Performance Summary for personal view; only placement target/done and related fields. |
