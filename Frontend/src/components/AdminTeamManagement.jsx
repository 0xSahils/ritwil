import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { apiRequest } from "../api/client";

const AdminTeamManagement = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Create Team Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    color: "blue",
    yearlyTarget: "",
  });

  // Global Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("/teams");
      if (!response.ok) throw new Error("Failed to fetch teams");
      const data = await response.json();
      setTeams(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiRequest("/teams", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create team");
      }

      setShowModal(false);
      setFormData({ name: "", color: "blue", yearlyTarget: "" });
      fetchTeams();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm("Are you sure? This will fail if the team has active members.")) return;
    try {
      const response = await apiRequest(`/teams/${teamId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete team");
      }

      fetchTeams();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGlobalImport = async () => {
    if (!importFile) {
      alert("Please select a file first.");
      return;
    }

    try {
      setImporting(true);
      const data = await importFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Parse as array of arrays to handle complex layout
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      let currentRecruiterName = null;
      const placementsToUpload = [];
      const notFoundRecruiters = new Set();

      // Build a map of "Recruiter Name" -> "User ID" from loaded teams
      const recruiterMap = new Map();
      teams.forEach(team => {
        // Map members
        if (team.members) {
          team.members.forEach(member => {
            if (member.name && member.userId) {
              recruiterMap.set(member.name.toLowerCase().trim(), member.userId);
            }
          });
        }
        // Map leads
        if (team.leads) {
          team.leads.forEach(lead => {
            if (lead.name && lead.userId) {
              recruiterMap.set(lead.name.toLowerCase().trim(), lead.userId);
            }
          });
        }
      });

      // Parsing State
      let mode = 'SCANNING'; // SCANNING, EXPECT_RECRUITER_INFO, READING_PLACEMENTS
      
      // Column Indices (default, will be updated by header row)
      let cols = {
        candidateName: -1,
        doj: -1,
        client: -1,
        revenue: -1,
        billingStatus: -1,
        placementType: -1, // Optional, defaults to PERMANENT
        billedHours: -1,
        marginPercent: -1,
        incentivePayoutEta: -1,
        incentiveAmountInr: -1,
        incentivePaid: -1,
        recruiterName: -1, // Sometimes in the placement row itself
      };

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const firstCell = String(row[0] || "").trim();
        const secondCell = String(row[1] || "").trim();

        // 1. Detect Block Header (Blue Header in screenshot)
        // "Team" | "Recruiter Name" | "Team Lead" ...
        if (firstCell === "Team" && secondCell === "Recruiter Name") {
          mode = 'EXPECT_RECRUITER_INFO';
          continue;
        }

        // 2. Read Recruiter Info
        if (mode === 'EXPECT_RECRUITER_INFO') {
          // The Recruiter Name is in Column B (index 1)
          if (secondCell) {
            currentRecruiterName = secondCell;
            mode = 'EXPECT_PLACEMENT_HEADER';
          }
          continue;
        }

        // 3. Detect Placement Header (Orange Header)
        // "Recruiter Name" | "Candidate Name" | "DOJ" ...
        if (mode === 'EXPECT_PLACEMENT_HEADER' || (firstCell === "Recruiter Name" && secondCell === "Candidate Name")) {
           if (firstCell === "Recruiter Name" && secondCell === "Candidate Name") {
             mode = 'READING_PLACEMENTS';
             
             // Map columns dynamically
             cols = {
               recruiterName: 0,
               candidateName: 1,
               doj: 2,
               client: 3, // Assuming "Client" is Col D (index 3)
               revenue: 4, // "Total Revenue"
               billingStatus: 5, // "Billing status"
               // Check other columns by iterating row
             };
             
             row.forEach((cell, idx) => {
               const val = String(cell).trim().toLowerCase();
               if (val.includes("candidate")) cols.candidateName = idx;
               else if (val.includes("doj")) cols.doj = idx;
               else if (val.includes("client")) cols.client = idx;
               else if (val.includes("revenue") && !val.includes("target")) cols.revenue = idx;
               else if (val.includes("billing")) cols.billingStatus = idx;
               else if (val.includes("days")) cols.daysCompleted = idx; // Optional, auto-calced
               else if (val.includes("incentive amount") || val.includes("inr")) cols.incentiveAmountInr = idx;
               else if (val.includes("paid")) cols.incentivePaid = idx;
               // Add others as needed
             });
             continue;
           }
        }

        // 4. Read Placement Data
        if (mode === 'READING_PLACEMENTS') {
          // If we hit a new "Team" header, reset
          if (firstCell === "Team") {
            mode = 'EXPECT_RECRUITER_INFO';
            i--; // Re-process this row
            continue;
          }

          // Check if this is a valid placement row
          // Must have candidate name
          const candidateName = row[cols.candidateName];
          if (!candidateName) continue; // Skip empty rows

          // Determine Recruiter: Use column A if present, else fall back to block header
          let recruiterName = row[0];
          if (!recruiterName) recruiterName = currentRecruiterName;

          if (!recruiterName) {
            console.warn("Skipping row, no recruiter name found:", row);
            continue;
          }

          // Find User ID
          const employeeId = recruiterMap.get(String(recruiterName).trim().toLowerCase());
          if (!employeeId) {
            notFoundRecruiters.add(recruiterName);
            continue;
          }

          // Construct Placement Object
          // Parse Dates (Excel dates are numbers or strings)
          const parseExcelDate = (val) => {
             if (!val) return null;
             if (typeof val === 'number') {
                // Excel date serial number
                return new Date(Math.round((val - 25569)*86400*1000)).toISOString();
             }
             return val; // Assume string YYYY-MM-DD or similar
          };

          placementsToUpload.push({
            employeeId,
            candidateName: candidateName,
            clientName: row[cols.client],
            doj: parseExcelDate(row[cols.doj]),
            doi: parseExcelDate(row[cols.doj]), // Default DOI to DOJ if missing
            revenue: row[cols.revenue],
            billingStatus: row[cols.billingStatus],
            incentiveAmountInr: row[cols.incentiveAmountInr],
            incentivePaid: String(row[cols.incentivePaid]).toLowerCase() === 'yes',
            // Default others
            placementType: "PERMANENT", 
          });
        }
      }

      if (notFoundRecruiters.size > 0) {
        alert(`Warning: The following recruiters were not found in the system:\n${Array.from(notFoundRecruiters).join(", ")}\n\nPlease ensure their names match exactly with registered users.`);
        if (!window.confirm("Do you want to continue uploading the matched placements?")) {
           setImporting(false);
           return;
        }
      }

      if (placementsToUpload.length === 0) {
        alert("No valid placements found to upload.");
        setImporting(false);
        return;
      }

      // Send to Backend
      const response = await apiRequest("/placements/bulk-global", {
        method: "POST",
        body: JSON.stringify({ placements: placementsToUpload }),
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.error || "Failed to upload placements");
      }
      
      const result = await response.json();
      alert(`Successfully uploaded ${result.created.length} placements!`);
      setShowImportModal(false);
      setImportFile(null);
      
    } catch (err) {
      console.error(err);
      alert("Error importing file: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  if (loading && teams.length === 0) {
    return <div className="p-8 text-center">Loading teams...</div>;
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/team")}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Team Management</h2>
              <p className="text-slate-600">Create and manage teams</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import Global Placements
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Team
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`h-2 w-full bg-${team.color}-500`}></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-800">{team.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${team.color}-100 text-${team.color}-700`}>
                    {team.color}
                  </span>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Target</span>
                    <span className="font-medium text-slate-700">₹{Number(team.yearlyTarget).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Achieved</span>
                    <span className="font-medium text-emerald-600">₹{Number(team.totalRevenue || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Leads</span>
                    <span className="font-medium text-slate-700">{team.leads?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Members</span>
                    <span className="font-medium text-slate-700">{team.members?.length || 0}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <button
                    onClick={() => navigate(`/admin/teams/${team.id}`)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                  >
                    Manage Team
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(team.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Import Global Placements</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
                <p className="font-medium mb-2">Instructions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Upload an Excel file (.xlsx, .xls) containing multiple recruiter blocks.</li>
                  <li>The system will automatically detect recruiters and assign placements to them.</li>
                  <li>Recruiter names in the Excel file must match exactly with registered users in the system.</li>
                </ul>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Excel File</label>
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  onChange={e => setImportFile(e.target.files[0])}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowImportModal(false)} 
                  disabled={importing}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleGlobalImport} 
                  disabled={!importFile || importing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm flex items-center gap-2"
                >
                  {importing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importing...
                    </>
                  ) : (
                    'Upload & Process'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Create New Team</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Team Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Titans"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Theme Color</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="purple">Purple</option>
                    <option value="orange">Orange</option>
                    <option value="red">Red</option>
                    <option value="teal">Teal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Yearly Target (₹)</label>
                  <input
                    type="number"
                    value={formData.yearlyTarget}
                    onChange={(e) => setFormData({ ...formData, yearlyTarget: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. 1000000"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm"
                  >
                    Create Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTeamManagement;
