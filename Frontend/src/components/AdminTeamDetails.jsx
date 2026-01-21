import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { apiRequest } from "../api/client";
import CalculationService from "../utils/calculationService";
import UserCreationModal from "./UserCreationModal";

const UserSearchDropdown = ({ users, selectedUserId, onSelect, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Debounce search term for filtering
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const selectedUser = users.find(u => u.id === selectedUserId);

  const filteredUsers = users.filter(user => {
    if (!debouncedSearchTerm) return true;
    const search = debouncedSearchTerm.toLowerCase();
    return (
      (user.name?.toLowerCase() || "").includes(search) || 
      (user.email?.toLowerCase() || "").includes(search)
    );
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredUsers.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredUsers.length) {
          onSelect(filteredUsers[highlightedIndex].id);
          setIsOpen(false);
          setSearchTerm("");
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        break;
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label id="user-search-label" className="block text-sm font-medium text-slate-700 mb-1">Select User</label>
      
      {!isOpen ? (
        <div 
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded="false"
          aria-labelledby="user-search-label"
          onClick={() => setIsOpen(true)}
          className={`w-full px-3 py-2 border rounded-lg flex justify-between items-center cursor-pointer bg-white transition-all ${
            selectedUserId ? 'border-slate-300' : 'border-slate-300 text-slate-500'
          } hover:border-blue-400 focus:ring-2 focus:ring-blue-500`}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <span className={selectedUser ? "text-slate-900" : "text-slate-400 truncate"}>
            {selectedUser ? `${selectedUser.name} (${selectedUser.email})` : placeholder}
          </span>
          <svg className="w-4 h-4 text-slate-400 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              role="searchbox"
              aria-autocomplete="list"
              aria-controls="user-search-results"
              aria-activedescendant={highlightedIndex >= 0 ? `user-option-${highlightedIndex}` : undefined}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 border border-blue-500 rounded-lg shadow-sm outline-none pl-9"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {isSearching ? (
               <div className="absolute right-3 top-2.5">
                 <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
               </div>
            ) : searchTerm && (
              <button 
                onClick={() => {
                  setSearchTerm("");
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <ul 
            id="user-search-results"
            role="listbox"
            className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-auto animate-fadeIn"
          >
            {filteredUsers.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-500 text-center" role="option" aria-disabled="true">No users found</li>
            ) : (
              filteredUsers.map((user, index) => (
                <li
                  key={user.id}
                  id={`user-option-${index}`}
                  role="option"
                  aria-selected={highlightedIndex === index}
                  onClick={() => {
                    onSelect(user.id);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors border-b border-slate-50 last:border-0 ${
                    highlightedIndex === index ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email} - {user.role}</div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const AdminTeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("leads");
  
  // Modal states
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [addingType, setAddingType] = useState("member"); // 'lead' or 'member'
  const [newMemberTarget, setNewMemberTarget] = useState("");
  const [newMemberManager, setNewMemberManager] = useState("");
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/teams/${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch team details (${response.status})`);
      }
      const data = await response.json();
      setTeam(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async (type) => {
    try {
      const response = await apiRequest("/users?pageSize=1000"); // Fetch all users (optimize later)
      if (response.ok) {
        const data = await response.json();
        
        // Filter out users already in this team
        const existingMemberIds = new Set([
          ...(team?.leads || []).map(u => u.userId),
          ...(team?.members || []).map(u => u.userId)
        ]);

        const filteredUsers = (data.data || []).filter(u => {
          // Filter by already in team
          if (existingMemberIds.has(u.id)) return false;
          
          // Filter by role based on addingType
          if (type === 'lead') {
            return u.role === 'TEAM_LEAD';
          } else {
            // For members, usually EMPLOYEE, but maybe we want to allow leads to be members too?
            // Sticking to requirements: "Display only members" implies EMPLOYEE role.
            return u.role === 'EMPLOYEE';
          }
        });

        setAvailableUsers(filteredUsers);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchTeamDetails();
  }, [id]);

  const handleAddUser = async () => {
    if (!selectedUser) return;
    try {
      const endpoint = addingType === 'lead' 
        ? `/teams/${id}/assign-lead`
        : `/teams/${id}/assign-members`;
      
      const body = addingType === 'lead'
        ? { userId: selectedUser }
        : { 
            userIds: [selectedUser],
            managerId: newMemberManager || undefined,
            yearlyTarget: newMemberTarget ? Number(newMemberTarget) : undefined
          };

      const response = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to add user");

      setShowAddMemberModal(false);
      setSelectedUser("");
      setNewMemberTarget("");
      setNewMemberManager("");
      showNotification("success", "User added successfully");
      fetchTeamDetails();
    } catch (err) {
      showNotification("error", err.message);
    }
  };

  const handleRemoveUser = async (userId, type) => {
    if (!window.confirm(`Are you sure you want to remove this ${type}?`)) return;
    try {
      const response = await apiRequest(`/teams/${id}/members/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove user");
      fetchTeamDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateTarget = async (userId, newTarget) => {
    try {
      const response = await apiRequest(`/teams/${id}/members/${userId}/target`, {
        method: "PATCH",
        body: JSON.stringify({ target: Number(newTarget) }),
      });
      if (!response.ok) throw new Error("Failed to update target");
      fetchTeamDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateSuccess = () => {
    fetchTeamDetails();
    showNotification("success", "User created and added to team successfully");
  };

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
      const notFoundRecruiters = new Set();
      const nonTeamRecruiters = new Set();

      // Build map of TEAM members only
      const teamUserMap = new Map();
      
      // Add leads
      if (team.leads) {
        team.leads.forEach(lead => {
          if (lead.name && lead.userId) {
            const cleanName = lead.name.toLowerCase().trim();
            teamUserMap.set(cleanName, lead.userId);
            console.log("Mapped Lead:", cleanName, "->", lead.userId);
          }
        });
      }
      
      // Add members
      if (team.members) {
        team.members.forEach(member => {
          if (member.name && member.userId) {
            const cleanName = member.name.toLowerCase().trim();
            teamUserMap.set(cleanName, member.userId);
            console.log("Mapped Member:", cleanName, "->", member.userId);
          }
        });
      }

      console.log("Team User Map Size:", teamUserMap.size);

      // Parsing State
      let mode = 'SCANNING'; 
      let cols = {};

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const firstCell = String(row[0] || "").trim();
        const secondCell = String(row[1] || "").trim();

        // Debug log for header detection
        if (firstCell === "Team" || secondCell === "Recruiter Name") {
             console.log(`Row ${i} [Header Candidate]: "${firstCell}", "${secondCell}"`);
        }

        if (firstCell === "Team" && secondCell === "Recruiter Name") {
          console.log(`Row ${i}: Found Block Header -> Switching to EXPECT_RECRUITER_INFO`);
          mode = 'EXPECT_RECRUITER_INFO';
          continue;
        }

        if (mode === 'EXPECT_RECRUITER_INFO') {
          if (secondCell) {
            currentRecruiterName = secondCell;
            console.log(`Row ${i}: Found Recruiter Info: "${currentRecruiterName}" -> Switching to EXPECT_PLACEMENT_HEADER`);
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
               if (val.includes("candidate")) cols.candidateName = idx;
               else if (val.includes("doj")) cols.doj = idx;
               else if (val.includes("client")) cols.client = idx;
               else if (val.includes("revenue") && !val.includes("target") && !val.includes("qualifier")) cols.revenue = idx;
               else if (val.includes("billing")) cols.billingStatus = idx;
               else if (val.includes("days")) cols.daysCompleted = idx;
               else if (val.includes("incentive amount") || val.includes("inr")) cols.incentiveAmountInr = idx;
               else if (val.includes("paid")) cols.incentivePaid = idx;
             });
             console.log("Columns Mapped:", cols);
             continue;
           }
        }

        if (mode === 'READING_PLACEMENTS') {
          if (firstCell === "Team") {
            console.log(`Row ${i}: Found New Team Block -> Switching to EXPECT_RECRUITER_INFO`);
            mode = 'EXPECT_RECRUITER_INFO';
            i--;
            continue;
          }

          const candidateName = row[cols.candidateName];
          if (!candidateName) continue;

          let recruiterName = row[0];
          if (!recruiterName) recruiterName = currentRecruiterName;

          if (!recruiterName) {
            console.warn(`Row ${i}: No recruiter name found (Candidate: ${candidateName})`);
            continue;
          }

          const recruiterNameClean = String(recruiterName).trim().toLowerCase();
          const employeeId = teamUserMap.get(recruiterNameClean);
          
          if (!employeeId) {
             console.warn(`Row ${i}: Recruiter "${recruiterName}" not found in team map.`);
             nonTeamRecruiters.add(recruiterName);
             continue;
          }

          placementsToUpload.push({
            employeeId,
            candidateName: candidateName,
            clientName: row[cols.client],
            doj: CalculationService.parseExcelDate(row[cols.doj]),
            doi: CalculationService.parseExcelDate(row[cols.doj]), // Fallback to DOJ if DOI not present
            revenue: row[cols.revenue],
            billingStatus: row[cols.billingStatus],
            incentiveAmountInr: row[cols.incentiveAmountInr],
            incentivePaid: String(row[cols.incentivePaid]).toLowerCase() === 'yes',
            placementType: "PERMANENT", 
          });
        }
      }

      console.log(`Extraction Complete. Found ${placementsToUpload.length} placements.`);
      console.log("Non-team recruiters:", Array.from(nonTeamRecruiters));

      if (nonTeamRecruiters.size > 0) {
        alert(`Warning: The following recruiters found in the file are NOT members of this team:\n${Array.from(nonTeamRecruiters).join(", ")}\n\nPlacements for these recruiters will be SKIPPED.`);
        if (!window.confirm("Do you want to continue uploading placements only for valid team members?")) {
           setImporting(false);
           return;
        }
      }

      if (placementsToUpload.length === 0) {
        alert("No valid placements found for this team.");
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
        alert(`Successfully uploaded ${result.created.length} placements for this team!`);
      }
      
      setShowImportModal(false);
      setImportFile(null);
      fetchTeamDetails(); // Refresh to show updated revenue
      
    } catch (err) {
      console.error(err);
      alert("Error importing file: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading team details...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
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
            </div>
            <div className="flex gap-6 mt-2 text-sm text-slate-600">
              <span>Total Target: <span className="font-semibold text-slate-900">{CalculationService.formatCurrency(team.yearlyTarget)}</span></span>
              <span>Total Revenue: <span className="font-semibold text-emerald-600">{CalculationService.formatCurrency(team.totalRevenue)}</span></span>
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
                    fetchAvailableUsers(type);
                    setShowAddMemberModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add {activeTab === "leads" ? "Lead" : "Member"}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-sm">
                    <th className="pb-3 font-medium pl-4">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Target ($)</th>
                    <th className="pb-3 font-medium">Revenue ($)</th>
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
                        <input
                          type="number"
                          defaultValue={user.target}
                          onBlur={(e) => {
                            if (Number(e.target.value) !== user.target) {
                              handleUpdateTarget(user.userId, e.target.value);
                            }
                          }}
                          className="w-32 px-2 py-1 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent transition-all outline-none"
                        />
                      </td>
                      <td className="py-4 text-emerald-600 font-medium">{CalculationService.formatCurrency(user.revenue)}</td>
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

      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                Add New {addingType === 'lead' ? 'Lead' : 'Member'}
              </h3>
              <button 
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <UserSearchDropdown 
                users={availableUsers}
                selectedUserId={selectedUser}
                onSelect={setSelectedUser}
                placeholder="Select a user..."
              />

              {addingType === 'member' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign Manager (Optional)</label>
                    <select
                      value={newMemberManager}
                      onChange={(e) => setNewMemberManager(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select a manager...</option>
                      {team?.leads?.map((lead) => (
                        <option key={lead.userId} value={lead.userId}>
                          {lead.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Yearly Target ($)</label>
                    <input
                      type="number"
                      value={newMemberTarget}
                      onChange={(e) => setNewMemberTarget(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={!selectedUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add User
                </button>
              </div>
              
              <div className="text-center mt-4 pt-4 border-t border-slate-100">
                <span className="text-sm text-slate-500">Can't find the user? </span>
                <button
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setShowCreateModal(true);
                  }}
                  className="text-sm text-blue-600 font-medium hover:underline"
                >
                  Create New User
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
      />
    </div>
  );
};

export default AdminTeamDetails;
