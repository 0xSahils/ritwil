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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const { 
    team, 
    isLoading, 
    error, 
    refetch, 
    updateTeam, 
    removeMember, 
    updateMemberTarget 
  } = useTeamDetails(id, selectedYear);

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
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
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


  const handleTeamImport = async () => {
    if (!importFile) {
      showNotification("error", "Please select a file first.");
      return;
    }

    if (!team) return;

    try {
      setImporting(true);
      console.log("Starting import process...");
      console.log("File:", importFile.name, "Size:", importFile.size);

      const data = await importFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      console.log("Sheet Name:", firstSheetName);
      const worksheet = workbook.Sheets[firstSheetName];
      
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log("Total Rows:", rows.length);
      
      let currentRecruiterName = null;
      const placementsToUpload = [];

      // Parsing State
      let mode = 'SCANNING'; 
      let cols = {};
      let recruiterNameIndex = 1;
      let l2Targets = null;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const firstCell = String(row[0] || "").trim();
        const secondCell = String(row[1] || "").trim();

        // Debug log for header detection
        if (firstCell === "Team" || secondCell === "Recruiter Name") {
             console.log(`Row ${i} [Header Candidate]: "${firstCell}", "${secondCell}"`);
        }

        if (firstCell === "Team") {
           let foundRecruiterIndex = -1;
           let foundL2Index = -1;
           
           row.forEach((cell, idx) => {
               const cellStr = String(cell).trim();
               if (cellStr === "Recruiter Name") foundRecruiterIndex = idx;
               if (cellStr === "L2 Name") foundL2Index = idx;
           });
           
           if (foundL2Index !== -1) {
              console.log(`Row ${i}: Found L2 Team Block.`);
              recruiterNameIndex = foundL2Index;
              mode = 'EXPECT_L2_INFO';
              
              // Map L2 Target Columns from THIS header row
              cols.l2RevenueTarget = -1;
              cols.l2PlacementTarget = -1;
              
              row.forEach((cell, idx) => {
                 const val = String(cell).trim().toLowerCase();
                 if (val.includes("yearly revenue target")) cols.l2RevenueTarget = idx;
                 else if (val.includes("yearly placement target")) cols.l2PlacementTarget = idx;
                 else if (val.includes("yearly target")) cols.l2RevenueTarget = idx; // Fallback for Vantage/General
              });
              continue;
           }
           
           if (foundRecruiterIndex !== -1) {
              console.log(`Row ${i}: Found Team Block. Recruiter Name at index ${foundRecruiterIndex}`);
              recruiterNameIndex = foundRecruiterIndex;
              mode = 'EXPECT_RECRUITER_INFO';
              l2Targets = null; // Reset L2 targets for standard sheets
              continue;
           }
        }

        if (mode === 'EXPECT_L2_INFO') {
           const rName = row[recruiterNameIndex];
           if (rName) {
             currentRecruiterName = rName;
             console.log(`Row ${i}: Found L2 Info: "${currentRecruiterName}"`);
             
             // Capture Targets
             l2Targets = {};
             if (cols.l2RevenueTarget !== -1) l2Targets.yearlyRevenueTarget = row[cols.l2RevenueTarget];
             if (cols.l2PlacementTarget !== -1) l2Targets.yearlyPlacementTarget = row[cols.l2PlacementTarget];
             
             console.log("Captured L2 Targets:", l2Targets);
             mode = 'EXPECT_PLACEMENT_HEADER'; 
           }
           continue;
        }

        if (mode === 'EXPECT_RECRUITER_INFO') {
          const rName = row[recruiterNameIndex];
          if (rName) {
            currentRecruiterName = rName;
            console.log(`Row ${i}: Found Recruiter Info: "${currentRecruiterName}"`);
            mode = 'EXPECT_PLACEMENT_HEADER';
          }
          continue;
        }

        if (mode === 'EXPECT_PLACEMENT_HEADER' || (firstCell === "Recruiter Name" && secondCell === "Candidate Name")) {
           if (firstCell === "Recruiter Name" && secondCell === "Candidate Name") {
             console.log(`Row ${i}: Found Placement Header -> Switching to READING_PLACEMENTS`);
             mode = 'READING_PLACEMENTS';
             cols = {
               recruiterName: 0,
               candidateName: 1,
               doj: 2,
               client: 3,
               revenue: 4,
               billingStatus: 5,
             };
             
             row.forEach((cell, idx) => {
               const val = String(cell).trim().toLowerCase();
               if (val.includes("recruiter name")) cols.recruiterName = idx;
               else if (val.includes("candidate name")) cols.candidateName = idx;
               else if (val.includes("candidate id")) cols.candidateId = idx;
               else if (val.includes("candidate")) cols.candidateName = cols.candidateName ?? idx; // Fallback
               
               else if (val.includes("client") && (val.includes("name") || val === "client")) cols.clientName = idx;
              else if (val.includes("client")) cols.clientName = cols.clientName ?? idx; // Fallback for just "Client"
              
              else if (val.includes("doj")) cols.doj = idx;
              else if (val.includes("doi")) cols.doi = idx;
               
               // Check Total Revenue FIRST to avoid it being caught by generic "revenue"
              else if (val.includes("total revenue")) cols.totalRevenue = idx;
              
              else if (val.includes("revenue") && !val.includes("target") && !val.includes("qualifier")) {
                  if (val.includes("lead")) {
                      cols.revenueAsLead = idx;
                      // Also map standard revenue to revenueAsLead for calculations
                      cols.revenue = idx;
                  }
                  else cols.revenue = idx;
              }
              else if (val.includes("target")) cols.yearlyTarget = idx;
              else if (val.includes("slab") || val.includes("qualifier")) cols.slabQualified = idx;
              else if (val.includes("billed hours") || val.includes("hours")) cols.billedHours = idx;
              else if (val.includes("billing")) cols.billingStatus = idx;
              else if (val.includes("incentive") && (val.includes("amount") || val.includes("inr"))) cols.incentiveAmountInr = idx; 
              else if (val.includes("paid") || (val.includes("incentive") && val.includes("paid"))) cols.incentivePaidInr = idx;
              else if (val.includes("target") && val.includes("type")) cols.targetType = idx;
              else if (val.includes("type")) cols.placementType = idx;
              
              else if (val.includes("sourcer")) cols.sourcer = idx;
              else if (val.includes("account") || val.includes("manager")) cols.accountManager = idx;
              else if (val.includes("tl") || val.includes("team lead")) cols.teamLead = idx;
              else if (val.includes("sharing") || val.includes("split")) cols.placementSharing = idx;
              else if (val.includes("credit")) cols.placementCredit = idx;
            });
            console.log("Columns Mapped:", cols);
            continue;
          }
       }

        if (mode === 'READING_PLACEMENTS') {
          if (firstCell === "Team") {
             // Find Recruiter Name column
             let foundIndex = -1;
             row.forEach((cell, idx) => {
                 if (String(cell).trim() === "Recruiter Name") {
                     foundIndex = idx;
                 }
             });
 
             if (foundIndex !== -1) {
                 console.log(`Row ${i}: Found New Team Block. Recruiter Name at index ${foundIndex} -> Switching to EXPECT_RECRUITER_INFO`);
                 recruiterNameIndex = foundIndex;
                 mode = 'EXPECT_RECRUITER_INFO';
                 // i--; // Re-process this row? No, we found the header, next row has data? 
                 // Actually if this row is "Team | Recruiter Name", the NEXT row has the team name? No wait.
                 // "Team" is usually a header row. 
                 // If structure is:
                 // Row X: Team | Recruiter Name
                 // Row X+1: NULL | Some Recruiter
                 // Then we switch to EXPECT_RECRUITER_INFO and continue loop so next iteration picks up Row X+1?
                 // But wait, "Team" is firstCell. 
                 continue;
             }
          }

          const candidateName = row[cols.candidateName];
          if (!candidateName) continue;

          let rawRecruiterVal = row[cols.recruiterName !== undefined ? cols.recruiterName : recruiterNameIndex];
          let recruiterName = currentRecruiterName;
          let vbid = null;

          if (rawRecruiterVal) {
              const valStr = String(rawRecruiterVal).trim();
              // Check if it's a number (VBID)
              if (/^\d+$/.test(valStr)) {
                  vbid = valStr;
              } else {
                  // It's a name? Or maybe "Recruiter Name" header repeated?
                  const upper = valStr.toUpperCase();
                  if (upper !== "VB CODE" && upper !== "RECRUITER NAME" && upper !== "TEAM") {
                      recruiterName = valStr;
                  }
              }
          }

          if (!recruiterName) {
            // console.warn(`Row ${i}: No recruiter name found (Candidate: ${candidateName})`);
            continue;
          }

          // SKIP HEADER ROWS disguised as data
          const rNameUpper = String(recruiterName).trim().toUpperCase();
          if (rNameUpper === "VB CODE" || rNameUpper === "RECRUITER NAME" || rNameUpper === "TEAM") {
             console.log(`Row ${i}: Skipping repeated header row.`);
             continue;
          }

          // Handle Date of Quit
          let doq = cols.doq !== undefined ? row[cols.doq] : "NA";
          if (String(doq).trim().toUpperCase() === "NA" || !doq) {
             doq = null;
          } else {
             doq = CalculationService.parseExcelDate(doq);
          }

          let doj = CalculationService.parseExcelDate(row[cols.doj]);
          
          placementsToUpload.push({
            employeeId: null, 
            recruiterName: String(recruiterName).trim(),
            vbid: vbid,
            candidateName: candidateName,
            candidateId: cols.candidateId !== undefined ? String(row[cols.candidateId] || "") : null,
            clientName: String(row[cols.clientName] || row[cols.client] || ""), // Use clientName col, fallback to generic client
            doj: doj,
            doq: doq,
            doi: cols.doi !== undefined ? CalculationService.parseExcelDate(row[cols.doi]) : CalculationService.parseExcelDate(row[cols.doj]), 
            revenue: row[cols.revenue],
            revenueAsLead: cols.revenueAsLead !== undefined ? row[cols.revenueAsLead] : null,
            billedHours: cols.billedHours !== undefined ? row[cols.billedHours] : null,
            billingStatus: row[cols.billingStatus],
            incentiveAmountInr: row[cols.incentiveAmountInr],
            incentivePaidInr: row[cols.incentivePaidInr],
            placementType: cols.placementType !== undefined ? String(row[cols.placementType] || "PERMANENT").toUpperCase() : "PERMANENT",
            yearlyTarget: cols.yearlyTarget !== undefined ? row[cols.yearlyTarget] : null,
            targetType: cols.targetType !== undefined ? String(row[cols.targetType]).toUpperCase() : null,
            slabQualified: cols.slabQualified !== undefined ? row[cols.slabQualified] : null,
            // Attach L2 targets if present and name matches (or just attach to all if we assume this block belongs to this L2)
            // Since we are inside the block for this recruiter, we can attach them.
            yearlyRevenueTarget: l2Targets ? l2Targets.yearlyRevenueTarget : null,
            yearlyPlacementTarget: l2Targets ? l2Targets.yearlyPlacementTarget : null,

            sourcer: cols.sourcer !== undefined ? row[cols.sourcer] : null,
            accountManager: cols.accountManager !== undefined ? row[cols.accountManager] : null,
            teamLead: cols.teamLead !== undefined ? row[cols.teamLead] : null,
            placementSharing: cols.placementSharing !== undefined ? row[cols.placementSharing] : null,
            placementCredit: cols.placementCredit !== undefined ? row[cols.placementCredit] : null,
            totalRevenue: cols.totalRevenue !== undefined ? row[cols.totalRevenue] : null,
          });
        }
      }

      console.log(`Extraction Complete. Found ${placementsToUpload.length} placements.`);

      if (placementsToUpload.length === 0) {
        alert("No valid placements found.");
        setImporting(false);
        return;
      }

      console.log("Sending to backend:", placementsToUpload.length, "placements");

      // Reuse the global bulk endpoint as it accepts { placements: [] } with employeeIds
      const response = await apiRequest("/placements/bulk-global", {
        method: "POST",
        body: JSON.stringify({ placements: placementsToUpload }),
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.error || "Failed to upload placements");
      }
      
      const result = await response.json();
      console.log("Backend Result:", result);
      
      if (result.errors && result.errors.length > 0) {
        console.error("Backend Errors:", result.errors);
        const errorMsg = `Uploaded ${result.created.length} placements.\nFailed to upload ${result.errors.length} placements.\n\nCheck console for details.`;
        alert(errorMsg);
      } else {
        alert(`Successfully uploaded ${result.created.length} placements!`);
      }
      
      setShowImportModal(false);
      setImportFile(null);
      refetch(); // Refresh to show updated revenue
      
    } catch (err) {
      console.error(err);
      alert("Error importing file: " + err.message);
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
              
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-auto py-1.5 px-3 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors ml-4"
              >
                <option value="All">All Years</option>
                {(team.availableYears && team.availableYears.length > 0 
                    ? team.availableYears 
                    : [new Date().getFullYear()]
                ).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

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
              <h3 className="text-lg font-bold text-slate-800">
                {activeTab === "leads" ? "Team Leads" : "Team Members"}
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Import Placements
                </button>
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

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Import Placements for {team.name}</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
                <p className="font-medium mb-2">Instructions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Upload an Excel file (.xlsx, .xls) containing placement data.</li>
                  <li>Recruiters in the file must be members of <strong>{team.name}</strong>.</li>
                  <li>Data for recruiters not in this team will be skipped.</li>
                </ul>
                <p className="text-xs text-slate-500 mt-1">Headers: candidateName, clientName, doi, doj, revenue, revenueAsLead, placementType, billedHours, billingStatus, incentivePayoutEta, incentiveAmountInr, incentivePaid, plcId, placementYear, collectionStatus</p>
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
                  onClick={handleTeamImport} 
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
