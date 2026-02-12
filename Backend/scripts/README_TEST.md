# Comprehensive Sheet Testing Script

This script tests all Excel sheets in the root folder, uploads them, and verifies that all data (especially targets and summary fields) is correctly extracted and stored.

## Usage

1. **Make sure the backend server is running:**
   ```bash
   cd Backend
   npm run dev
   ```

2. **Run the test script:**
   ```bash
   npm run test:sheets
   ```

   Or directly:
   ```bash
   node scripts/comprehensive_sheet_test.js
   ```

## What It Does

1. **Analyzes each sheet:**
   - Identifies sheet type (PERSONAL or TEAM)
   - Extracts all headers
   - Finds all placement rows
   - Finds all summary rows (rows with targets/totals but no candidate)
   - Shows what data is present in the sheet

2. **Uploads each sheet:**
   - Calls the appropriate import endpoint
   - Shows upload results

3. **Verifies uploaded data:**
   - Checks if targets are stored in EmployeeProfile
   - Checks if summary fields are stored in placement records
   - Compares sheet data vs database data
   - Reports all discrepancies

## Sheets Tested

- `vantege recruitor.xlsx` (Personal placements)
- `vantenge l2 sheet.xlsx` (Team placements)
- `CSK L4.xlsx` (Personal placements)
- `akbar l2.xlsx` (Team placements)
- `vinothL L2.xlsx` (Team placements)

## Output

The script provides:
- ✅ **Green checkmarks** for successfully uploaded/verified fields
- ❌ **Red X marks** for missing or incorrect fields
- **Detailed reports** showing:
  - What's in each sheet
  - What was uploaded
  - What's missing or incorrect
  - Issues grouped by type (TARGET, SUMMARY, etc.)

## Fixing Issues

If the script finds issues:
1. Check the issue type (TARGET, SUMMARY, etc.)
2. Review the placementController.js logic for that field
3. Fix the extraction/storage logic
4. Re-run the test script to verify
