import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { apiRequest } from "../api/client"; // Keep for import functionality if not refactored yet
import CalculationService from "../utils/calculationService";
import UserCreationModal from "./UserCreationModal";
import { useTeamDetails } from "../hooks/useTeams";
import { Skeleton } from "./common/Skeleton";
import { useAuth } from "../context/AuthContext";

const AdminTeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const canEditTarget = currentUser?.role === "S1_ADMIN";
  
  const { 
    team, 
    isLoading, 
    error, 
    refetch, 
    updateTeam, 
    removeMember, 
    updateMemberTarget 
  } = useTeamDetails(id);

  const [activeTab, setActiveTab] = useState("leads");
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [addingType, setAddingType] = useState("member"); // 'lead' or 'member'
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Import states
  const [showPersonalImportModal, setShowPersonalImportModal] = useState(false);
  const [showTeamImportModal, setShowTeamImportModal] = useState(false);
  const [personalFile, setPersonalFile] = useState(null);
  const [teamFile, setTeamFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importResult, setImportResult] = useState(null); // { summary, report } after successful team import
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleUpdateTeam = (data) => {
    updateTeam(data, {
      onSuccess: () => {
        setShowSettingsModal(false);
        showNotification("success", "Team updated successfully");
      },
      onError: (err) => {
        alert(err.message);
      }
    });
  };

  const handleRemoveUser = (userId, type) => {
    if (!window.confirm(`Are you sure you want to remove this ${type}?`)) return;
    removeMember({ userId, type }, {
      onError: (err) => {
        alert(err.message);
      }
    });
  };

  const handleUpdateTarget = (userId, newTarget, newTargetType) => {
    updateMemberTarget({ userId, newTarget, newTargetType }, {
      onError: (err) => {
        alert(err.message);
      }
    });
  };

  const handleCreateSuccess = () => {
    refetch();
    showNotification("success", "User created and added to team successfully");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="max-w-7xl mx-auto space-y-8">
           <div className="bg-white rounded-3xl p-8 shadow-sm">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-2xl" />
                    <div>
                       <Skeleton className="h-8 w-48 rounded mb-2" />
                       <Skeleton className="h-4 w-32 rounded" />
                    </div>
                 </div>
                 <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
           </div>
           <div className="bg-white rounded-3xl p-8 shadow-sm h-96">
              <div className="flex gap-4 mb-6">
                 <Skeleton className="h-10 w-24 rounded-full" />
                 <Skeleton className="h-10 w-24 rounded-full" />
              </div>
              <div className="space-y-4">
                 <Skeleton className="h-16 w-full rounded-xl" />
                 <Skeleton className="h-16 w-full rounded-xl" />
                 <Skeleton className="h-16 w-full rounded-xl" />
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (error) {
     return <div className="p-8 text-center text-red-600">Error: {error.message}</div>;
  }


  const handlePersonalImport = async () => {
    if (!personalFile) {
      setImportError("Please choose an Excel file.");
      return;
    }
    try {
      setImporting(true);
      setImportError("");
      const data = await personalFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      if (!jsonData.length) {
        throw new Error("Sheet is empty");
      }

      // Find first header row (summary: Team/VB Code, or placement: Candidate Name/Recruiter Name)
      // Send entire sheet so backend receives both summary and placement rows
      let headerIndex = -1;
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || !row.length) continue;
        const rowLower = row.map((c) => String(c || "").trim().toLowerCase());
        const hasSummaryHeader = rowLower.includes("team") && rowLower.includes("vb code");
        const hasPlacementHeader = rowLower.includes("candidate name") && (rowLower.includes("recruiter name") || rowLower.includes("lead name"));
        if (hasSummaryHeader || hasPlacementHeader) {
          headerIndex = i;
          break;
        }
      }

      if (headerIndex === -1) {
        throw new Error("Could not find header row (expected 'Team' & 'VB Code' or 'Candidate Name' & 'Recruiter Name')");
      }

      const headers = jsonData[headerIndex];
      const allRows = jsonData.slice(headerIndex + 1).filter((row) => row && row.length > 0);

      if (!allRows.length) {
        throw new Error("No data rows found in sheet");
      }

      const response = await apiRequest("/placements/import/personal", {
        method: "POST",
        body: JSON.stringify({ headers, rows: allRows }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Import failed");
      }
      const totalRows = (result.summary?.placementsCreated ?? result.insertedCount ?? 0) + (result.summary?.placementsUpdated ?? 0);
      alert(`Personal placements imported (${totalRows} rows: ${result.summary?.placementsCreated ?? 0} created, ${result.summary?.placementsUpdated ?? 0} updated).`);
      setShowPersonalImportModal(false);
      setPersonalFile(null);
      refetch();
    } catch (e) {
      setImportError(e.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleTeamImport = async () => {
    if (!teamFile) {
      setImportError("Please choose an Excel file.");
      return;
    }
    try {
      setImporting(true);
      setImportError("");
      const data = await teamFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      if (!jsonData.length) {
        throw new Error("Sheet is empty");
      }

      // Find first header row (summary: Team/VB Code, or placement: Candidate Name/Lead)
      // Send entire sheet so backend receives both summary and placement rows
      let headerIndex = -1;
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || !row.length) continue;
        const rowLower = row.map((c) => String(c || "").trim().toLowerCase());
        const hasSummaryHeader = rowLower.includes("team") && rowLower.includes("vb code");
        const hasPlacementHeader = rowLower.includes("candidate name") && (rowLower.includes("lead") || rowLower.includes("lead name"));
        if (hasSummaryHeader || hasPlacementHeader) {
          headerIndex = i;
          break;
        }
      }

      if (headerIndex === -1) {
        throw new Error("Could not find header row (expected 'Team' & 'VB Code' or 'Candidate Name' & 'Lead')");
      }

      const headers = jsonData[headerIndex];
      const allRows = jsonData.slice(headerIndex + 1).filter((row) => row && row.length > 0);

      if (!allRows.length) {
        throw new Error("No data rows found in sheet");
      }

      const response = await apiRequest("/placements/import/team", {
        method: "POST",
        body: JSON.stringify({ headers, rows: allRows, teamId: team?.id }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Import failed");
      }
      setShowTeamImportModal(false);
      setTeamFile(null);
      setImportError("");
      setImportResult(result);
      refetch();
    } catch (e) {
      setImportError(e.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading team details...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error.message}</div>;
  if (!team) return <div className="p-8 text-center">Team not found</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${
          notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        } animate-fadeIn transition-all`}>
          {notification.message}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/admin/teams")}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{team.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${team.color}-100 text-${team.color}-700 capitalize`}>
                {team.color}
              </span>

              <button 
                onClick={() => setShowSettingsModal(true)}
                className="ml-2 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Team Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <div className="flex gap-6 mt-2 text-sm text-slate-600">
              <span>Total Target: <span className="font-semibold text-slate-900">
                {team.targetType === "PLACEMENTS" 
                  ? `${team.yearlyTarget} Placements` 
                  : CalculationService.formatCurrency(team.yearlyTarget)
                }
              </span></span>
              <span>Achieved: <span className="font-semibold text-emerald-600">
                {team.targetType === "PLACEMENTS"
                  ? `${team.totalPlacements || 0} Placements`
                  : CalculationService.formatCurrency(team.totalRevenue)
                }
              </span></span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab("leads")}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === "leads"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              Team Leads ({team.leads.length})
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === "members"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              Team Members ({team.members.length})
            </button>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {activeTab === "leads" ? "Team Leads" : "Team Members"}
                </h3>
              </div>
              <div className="flex gap-3">
                {activeTab === "leads" ? (
                  <button
                    onClick={() => setShowTeamImportModal(true)}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Team Lead Placement Import
                  </button>
                ) : (
                  <button
                    onClick={() => setShowPersonalImportModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Members Placement Import
                  </button>
                )}
                <button
                  onClick={() => {
                    const type = activeTab === "leads" ? "lead" : "member";
                    setAddingType(type);
                    setShowCreateModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create {activeTab === "leads" ? "Lead" : "Member"}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-sm">
                    <th className="pb-3 font-medium pl-4">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Target</th>
                    <th className="pb-3 font-medium">Achievement</th>
                    <th className="pb-3 font-medium">Slab Qualified</th>
                    {activeTab === "members" && <th className="pb-3 font-medium">Manager</th>}
                    <th className="pb-3 font-medium text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(activeTab === "leads" ? team.leads : team.members).map((user) => (
                    <tr key={user.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-4 pl-4">
                        <div 
                          className="font-medium text-slate-800 cursor-pointer hover:text-blue-600 hover:underline"
                          onClick={() => navigate(`/admin/employee/${user.userId}/placements`)}
                        >
                          {user.name}
                        </div>
                      </td>
                      <td className="py-4 text-slate-600">{user.email}</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            defaultValue={user.target}
                            disabled={!canEditTarget}
                            onBlur={(e) => {
                              if (Number(e.target.value) !== user.target) {
                                handleUpdateTarget(user.userId, e.target.value, user.targetType || "REVENUE");
                              }
                            }}
                            className={`w-24 px-2 py-1 border border-transparent rounded bg-transparent transition-all outline-none ${
                              canEditTarget 
                                ? "hover:border-slate-300 focus:border-blue-500" 
                                : "cursor-not-allowed opacity-70"
                            }`}
                            title={!canEditTarget ? "Only Admin can edit targets" : ""}
                          />
                          <select
                            defaultValue={user.targetType || "REVENUE"}
                            disabled={!canEditTarget}
                            onChange={(e) => {
                              const newTargetType = e.target.value;
                              if (newTargetType !== user.targetType) {
                                const promptMessage = newTargetType === "PLACEMENTS" 
                                  ? "Enter target number of placements:" 
                                  : "Enter target revenue amount:";
                                const newValue = window.prompt(promptMessage, "0");
                                
                                if (newValue !== null && !isNaN(Number(newValue))) {
                                  handleUpdateTarget(user.userId, newValue, newTargetType);
                                } else {
                                  // Reset selection if cancelled or invalid
                                  e.target.value = user.targetType || "REVENUE";
                                }
                              }
                            }}
                            className={`w-28 px-2 py-1 border border-transparent rounded bg-transparent transition-all outline-none text-xs ${
                              canEditTarget
                                ? "hover:border-slate-300 focus:border-blue-500"
                                : "cursor-not-allowed opacity-70"
                            }`}
                            title={!canEditTarget ? "Only Admin can edit targets" : ""}
                          >
                            <option value="REVENUE">Revenue</option>
                            <option value="PLACEMENTS">Placements</option>
                          </select>
                        </div>
                      </td>
                      <td className="py-4 text-emerald-600 font-medium">
                        {user.targetType === "PLACEMENTS" 
                          ? `${user.placementsCount || 0} Placements` 
                          : CalculationService.formatCurrency(user.revenue)
                        }
                      </td>
                      <td className="py-4 text-slate-600 font-medium">
                        {user.slabQualified || "-"}
                      </td>
                      {activeTab === "members" && (
                        <td className="py-4 text-slate-600">{user.managerName || "-"}</td>
                      )}
                      <td className="py-4 text-right pr-4">
                        <button
                          onClick={() => handleRemoveUser(user.userId, activeTab === "leads" ? "lead" : "member")}
                          className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(activeTab === "leads" ? team.leads : team.members).length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No {activeTab === "leads" ? "leads" : "members"} found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Team Settings</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleUpdateTeam({
                name: formData.get("name"),
                color: formData.get("color"),
                targetType: formData.get("targetType"),
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Team Name</label>
                  <input
                    name="name"
                    defaultValue={team.name}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Color Theme</label>
                  <select
                    name="color"
                    defaultValue={team.color}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="blue">Blue</option>
                    <option value="emerald">Emerald</option>
                    <option value="violet">Violet</option>
                    <option value="amber">Amber</option>
                    <option value="rose">Rose</option>
                    <option value="cyan">Cyan</option>
                    <option value="red">Red</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target Type</label>
                  <select
                    name="targetType"
                    defaultValue={team.targetType || "REVENUE"}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="REVENUE">Revenue Based</option>
                    <option value="PLACEMENTS">Placement Based</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Changing this will reset member targets if they are incompatible.
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-sm text-slate-600">Total Target: </span>
                  <span className="font-semibold text-slate-900">
                    {team.targetType === "PLACEMENTS" 
                      ? `${team.yearlyTarget || 0} Placements`
                      : CalculationService.formatCurrency(team.yearlyTarget)
                    }
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    Calculated automatically from member targets.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPersonalImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Members Placement Import (Personal)</h2>
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-lg text-sm text-indigo-700">
                <p className="font-medium mb-2">Instructions for Personal Sheet:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Upload an Excel file containing individual recruiter placements.</li>
                  <li>The sheet must have headers like "Candidate Name" and "Recruiter Name".</li>
                  <li>Data will be saved as personal placements (PersonalPlacement).</li>
                </ul>
              </div>
              {importError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                  {importError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Excel File</label>
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  onChange={e => setPersonalFile(e.target.files[0])}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => { setShowPersonalImportModal(false); setImportError(""); }} 
                  disabled={importing}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePersonalImport} 
                  disabled={!personalFile || importing}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm flex items-center gap-2"
                >
                  {importing ? "Importing..." : "Upload & Process"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTeamImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Team Lead Placement Import (Team)</h2>
            <div className="space-y-4">
              <div className="bg-violet-50 p-4 rounded-lg text-sm text-violet-700">
                <p className="font-medium mb-2">Instructions for Team Sheet:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Upload an Excel file with summary and placement headers for this team only.</li>
                  <li>Only rows for team &quot;{team?.name}&quot; will be imported; other teams in the sheet are skipped.</li>
                  <li>Summary headers: Team, VB Code, Lead Name, Yearly Placement Target, … Placement headers: Lead Name, Candidate Name, PLC ID, …</li>
                </ul>
              </div>
              {importError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                  {importError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Excel File</label>
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  onChange={e => setTeamFile(e.target.files[0])}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => { setShowTeamImportModal(false); setImportError(""); setTeamFile(null); }} 
                  disabled={importing}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleTeamImport} 
                  disabled={!teamFile || importing}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium shadow-sm flex items-center gap-2"
                >
                  {importing ? "Importing..." : "Upload & Process"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {importResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setImportResult(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fadeIn" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Import Result</h2>
            <div className="space-y-3 text-sm">
              <p className="text-slate-600 font-medium">Validation</p>
              <ul className="list-none space-y-1 pl-0">
                <li className="flex justify-between"><span>Summary headers</span><span className="text-emerald-600 font-medium">OK</span></li>
                <li className="flex justify-between"><span>Placement headers</span><span className={importResult.report?.placementHeaderValid ? "text-emerald-600 font-medium" : "text-amber-600"}>{importResult.report?.placementHeaderValid ? "OK" : "N/A"}</span></li>
              </ul>
              <p className="text-slate-600 font-medium pt-2">Summary rows</p>
              <ul className="list-none space-y-1 pl-0">
                <li className="flex justify-between"><span>Checked</span><span>{importResult.report?.summaryRowsChecked ?? 0}</span></li>
                <li className="flex justify-between"><span>Accepted</span><span className="text-emerald-600">{importResult.report?.summaryRowsAccepted ?? 0}</span></li>
                <li className="flex justify-between"><span>Rejected (wrong team)</span><span className="text-amber-600">{importResult.report?.summaryRowsRejectedWrongTeam ?? 0}</span></li>
              </ul>
              <p className="text-slate-600 font-medium pt-2">Placement rows</p>
              <ul className="list-none space-y-1 pl-0">
                <li className="flex justify-between"><span>Checked</span><span>{importResult.report?.placementRowsChecked ?? 0}</span></li>
                <li className="flex justify-between"><span>Uploaded (created)</span><span className="text-emerald-600">{importResult.report?.placementsCreated ?? importResult.summary?.placementsCreated ?? 0}</span></li>
                <li className="flex justify-between"><span>Updated</span><span className="text-emerald-600">{importResult.report?.placementsUpdated ?? importResult.summary?.placementsUpdated ?? 0}</span></li>
                <li className="flex justify-between"><span>Rejected (wrong team)</span><span className="text-amber-600">{importResult.report?.placementsRejectedWrongTeam ?? 0}</span></li>
                <li className="flex justify-between"><span>Rejected (lead not found)</span><span className="text-red-600">{importResult.report?.placementsRejectedLeadNotFound ?? 0}</span></li>
              </ul>
            </div>
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setImportResult(null)} 
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <UserCreationModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        teams={team ? [team] : []}
        defaultRole={addingType === 'lead' ? 'TEAM_LEAD' : 'EMPLOYEE'}
      />
    </div>
  );
};

export default AdminTeamDetails;
