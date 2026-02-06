import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import CalculationService, { QUALIFIER_DAYS } from "../utils/calculationService";

const AdminEmployeePlacements = () => {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // If null, it's adding mode
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Result Modal State
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultData, setResultData] = useState(null);

  const initialFormState = {
    candidateName: "",
    candidateId: "",
    clientId: "",
    jpcId: "",
    clientName: "",
    doi: "",
    doq: "",
    doj: "",
    daysCompleted: 0,
    placementType: "PERMANENT",
    billedHours: "",
    marginPercent: "",
    revenue: "",
    sourcer: "",
    accountManager: "",
    teamLead: "",
    placementSharing: "",
    totalRevenue: "",
    revenueAsLead: "",
    placementCredit: "",
    billingStatus: "PENDING",
    incentivePayoutEta: "",
    incentiveAmountInr: "",
    incentivePaid: "",
    qualifier: false,
  };

  const [formData, setFormData] = useState(initialFormState);

  const [allUsers, setAllUsers] = useState([]);
  const [targetUser, setTargetUser] = useState(null);
  
  // Auto-calculate Days Completed in form
  useEffect(() => {
    if (formData.doj) {
      const diffDays = CalculationService.calculateDaysDifference(formData.doj);
      
      // Auto-update qualifier
      const isQualifier = CalculationService.checkQualifierStatus(diffDays);
      
      setFormData(prev => ({
        ...prev,
        daysCompleted: diffDays,
        qualifier: isQualifier
      }));
    }
  }, [formData.doj]);

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/placements/user/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch placements");
      const data = await response.json();
      setPlacements(data);
      
      // Try to get user name if possible, otherwise skip
      // Just for UI nicety
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
    // Fetch detailed user info
    const fetchUserDetails = async () => {
      try {
        const response = await apiRequest(`/users/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setTargetUser(data);
          setUserName(data.name);
        }
      } catch (err) {
        console.error("Failed to fetch user details", err);
      }
    };
    if (userId) fetchUserDetails();
  }, [userId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiRequest("/users?pageSize=1000");
        if (response.ok) {
          const data = await response.json();
          setAllUsers(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch users for bulk upload mapping", err);
      }
    };
    fetchUsers();
  }, []);

  // Use simplified layout for L3 and L4 employees ONLY if they are in Vantage team
  const isVantageL4 = targetUser?.employeeProfile?.team?.name && 
                      targetUser.employeeProfile.team.name.toLowerCase().includes('vant') && 
                      ['L3', 'L4'].includes(targetUser?.employeeProfile?.level?.toUpperCase());

  // L2 specific layout
  const isL2 = targetUser?.employeeProfile?.level?.toUpperCase() === 'L2';

  const handleEdit = (placement) => {
    setEditingId(placement.id);
    setFormData({
      candidateName: placement.candidateName,
      candidateId: placement.candidateId || "",
      clientId: placement.clientId || "",
      jpcId: placement.jpcId || "",
      clientName: placement.clientName,
      doi: placement.doi ? placement.doi.split('T')[0] : "",
      doq: placement.doq ? placement.doq.split('T')[0] : "",
      doj: placement.doj ? placement.doj.split('T')[0] : "",
      daysCompleted: placement.daysCompleted,
      placementType: placement.placementType,
      billedHours: placement.billedHours || "",
      marginPercent: placement.marginPercent || "",
      revenue: placement.revenue || "",
      revenueAsLead: placement.revenueAsLead || "",
      billingStatus: placement.billingStatus,
      incentivePayoutEta: placement.incentivePayoutEta ? placement.incentivePayoutEta.split('T')[0] : "",
      incentiveAmountInr: placement.incentiveAmountInr || "",
      incentivePaid: (placement.incentivePaid !== undefined && placement.incentivePaid !== null) ? String(placement.incentivePaid) : "",
      qualifier: placement.qualifier,
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `/placements/${editingId}`
        : `/placements/user/${userId}`;
      
      const method = editingId ? "PUT" : "POST";

      const response = await apiRequest(url, {
        method,
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save placement");

      setShowModal(false);
      setFormData(initialFormState);
      setEditingId(null);
      fetchPlacements();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBulkSubmit = async () => {
    // 1. EXCEL HANDLING
    if (csvFile && (csvFile.name.toLowerCase().endsWith('.xlsx') || csvFile.name.toLowerCase().endsWith('.xls'))) {
       try {
         const data = await csvFile.arrayBuffer();
          const workbook = XLSX.read(data);
          
          const globalPlacements = [];
          
          // Loop through all sheets
          for (const sheetName of workbook.SheetNames) {
              const sheet = workbook.Sheets[sheetName];
              const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
              
              let currentRecruiterId = null; 
              let colMap = null;
     
              // Iterate
              for (let i = 0; i < jsonData.length; i++) {
                 const row = jsonData[i];
                 if (!row || row.length === 0) continue;
                 
                 const rowLower = row.map(c => String(c||"").trim().toLowerCase());

                 // Recruiter Block Start
                 let name = "";
                 const recruiterIdx = row.findIndex(c => String(c||"").trim().toLowerCase().startsWith("recruiter name"));
                 
                 if (recruiterIdx !== -1) {
                     const cellVal = String(row[recruiterIdx]).trim();
                     if (cellVal.includes(":")) {
                         name = cellVal.split(":")[1].trim();
                     } 
                     if (!name && row[recruiterIdx+1]) {
                         name = String(row[recruiterIdx+1]).trim();
                     }
                     
                     // Find ID
                     const user = allUsers.find(u => u.name.toLowerCase() === name.toLowerCase());
                     if (user) {
                         currentRecruiterId = user.id;
                     } else {
                         currentRecruiterId = null; // Unknown recruiter
                         console.warn("Unknown recruiter:", name);
                     }
                     continue;
                 }
     
                 // Headers row detection
                 if (rowLower.includes("candidate name")) {
                     colMap = {};
                     rowLower.forEach((h, idx) => colMap[h] = idx);
                     continue;
                 }
     
                 // Data Row
                 // Check for per-row recruiter (VB Code or Recruiter Name column)
                 if (colMap) {
                    const recruiterCol = colMap['recruiter name'] !== undefined ? colMap['recruiter name'] : colMap['vb code'];
                    if (recruiterCol !== undefined) {
                        const cellVal = row[recruiterCol];
                        if (cellVal) {
                             const name = String(cellVal).trim();
                             // Find ID
                             const user = allUsers.find(u => u.name.toLowerCase() === name.toLowerCase());
                             if (user) {
                                 currentRecruiterId = user.id;
                             } else {
                                 // Only reset if it's clearly a name but not found. 
                                 // If it's a code like "VB0001" we might not map it, so maybe ignore?
                                 // But here the name is in the cell "Umar Mujahid Husain".
                                 // If it's "VB Code" header but value is "Umar...", it matches.
                                 // If value is "VB0001", it won't match a user name.
                                 // Let's assume name match.
                             }
                        }
                    }
                 }

                 if (currentRecruiterId) {
                     let candidateName, clientName, doj, revenue, placementType, billingStatus, doi, clientId, jpcId, totalRevenue, daysCompleted, qualifier, marginPercent, incentiveAmountInr, incentivePaid;

                     if (colMap) {
                        // Use Dynamic Map
                        candidateName = row[colMap['candidate name']];
                        clientName = row[colMap['client']] || row[colMap['client name']];
                        const dateVal = row[colMap['doj']];
                        const dateValDoi = row[colMap['doq']] || row[colMap['doi']]; // DOQ maps to DOI
                        
                        // Parse Dates
                        const parseDate = (d) => {
                            if (!d) return new Date();
                            if (typeof d === 'number') return new Date(Math.round((d - 25569)*86400*1000));
                            return new Date(d);
                        };
                        doj = parseDate(dateVal);
                        doi = parseDate(dateValDoi);

                        totalRevenue = row[colMap['total revenue']];
                        billingStatus = row[colMap['billing status']];
                        clientId = row[colMap['client id']];
                        jpcId = row[colMap['jpc id']];
                        placementType = String(row[colMap['placement type']] || "").toLowerCase().includes("contract") ? "CONTRACT" : "PERMANENT";
                        daysCompleted = row[colMap['days completed']];
                        qualifier = String(row[colMap['revenue qualifier']] || row[colMap['qualifier']] || "").toLowerCase().includes("yes"); // Assuming text
                        marginPercent = row[colMap['margin %']];
                        incentiveAmountInr = row[colMap['incentive amount (inr)']] || row[colMap['incentive amount']] || row[colMap['incentive amount(inr)']];
                        const rawIncentivePaid = row[colMap['incentive paid']];
                        incentivePaid = (rawIncentivePaid !== undefined && rawIncentivePaid !== null) ? String(rawIncentivePaid).trim() : "";
                        
                        // Fallback revenue if not present
                        revenue = totalRevenue; 

                     } else {
                        // Fallback to legacy hardcoded format
                        candidateName = row[0];
                        clientName = row[1];
                        const ctc = row[2];
                        const role = row[3];
                        const dateVal = row[4];
        
                        if (!candidateName || !clientName) continue;
        
                        // Parse Date
                        if (typeof dateVal === 'number') {
                            doj = new Date(Math.round((dateVal - 25569)*86400*1000));
                        } else if (dateVal) {
                            doj = new Date(dateVal);
                        }
                        if (!doj || isNaN(doj.getTime())) doj = new Date();
                        doi = doj;

                        revenue = ctc || 0;
                        placementType = String(role).toLowerCase().includes("contract") ? "CONTRACT" : "PERMANENT";
                        billingStatus = "PENDING";
                        incentivePaid = "";
                     }

                     if (!candidateName) continue;

                     globalPlacements.push({
                         employeeId: currentRecruiterId,
                         candidateName,
                         clientName,
                         doi,
                         doj,
                         revenue: revenue || 0, // Maps to 'revenue' in DB
                         totalRevenue: totalRevenue || revenue || 0,
                         revenueAsLead: null, // L4 doesn't track this usually
                         placementType,
                         billingStatus: billingStatus ? (billingStatus.toUpperCase() === 'COMPLETED' ? 'BILLED' : billingStatus.toUpperCase()) : "PENDING",
                         clientId,
                         jpcId,
                         daysCompleted,
                         qualifier,
                         marginPercent,
                         incentiveAmountInr,
                         incentivePaid
                     });
                 }
              }
          }

         if (globalPlacements.length === 0) {
             alert("No placements found. Ensure 'Recruiter Name: [Name]' is correct and data follows 'Candidate, Client, CTC, Role, Date' format.");
             return;
         }

         if (!window.confirm(`Found ${globalPlacements.length} placements. Upload?`)) return;

         const response = await apiRequest("/placements/bulk-global", {
             method: "POST",
             body: JSON.stringify({ placements: globalPlacements })
         });

         if (!response.ok) throw new Error("Upload failed");
         
         const result = await response.json();
         setShowBulkModal(false);
         setCsvFile(null);
         fetchPlacements();
         setResultData(result);
         setShowResultModal(true);
         return;

       } catch(e) {
         console.error(e);
         alert("Excel Error: " + e.message);
         return;
       }
    }

    // 2. CSV/Text HANDLING
    let parsedData = [];
    let processingText = bulkText;
    
    // If using file, read it first
    if (csvFile) {
        processingText = await csvFile.text();
    }

    if (processingText) {
      const lines = processingText.split("\n").filter(l => l.trim());
      if (lines.length > 0) {
        let headers = lines[0].split(",").map(h => h.trim());
        let startIndex = 1;

        // Check if first line looks like headers. If not, use default headers and start from index 0
        if (!headers.includes("candidateName")) {
           headers = ["candidateName", "candidateId", "jpcId", "clientName", "doj", "revenue", "revenueAsLead", "placementType", "billedHours", "marginPercent", "billingStatus", "incentivePayoutEta", "incentiveAmountInr", "incentivePaid"];
           startIndex = 0;
        }

        for (let i = startIndex; i < lines.length; i++) {
          const values = lines[i].split(",").map(v => v.trim());
          if (values.length !== headers.length) {
              console.warn(`Skipping line ${i+1}: expected ${headers.length} columns, got ${values.length}`);
              continue;
          }
          const obj = {};
          headers.forEach((h, index) => obj[h] = values[index]);
          parsedData.push(obj);
        }
      }
    }

    if (parsedData.length === 0) {
      alert("No valid data found to upload. Please ensure your CSV matches the required format.");
      return;
    }

    try {
      const response = await apiRequest(`/placements/user/${userId}/bulk`, {
        method: "POST",
        body: JSON.stringify({ placements: parsedData }),
      });
      if (!response.ok) throw new Error("Failed to upload bulk placements");
      const result = await response.json();
      setShowBulkModal(false);
      setBulkText("");
      setCsvFile(null);
      fetchPlacements();
      setResultData(result);
      setShowResultModal(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} placements?`)) return;

    try {
      const response = await apiRequest("/placements/bulk", {
        method: "DELETE",
        body: JSON.stringify({ placementIds: selectedIds }),
      });
      if (!response.ok) throw new Error("Failed to delete placements");
      
      setSelectedIds([]);
      fetchPlacements();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this placement?")) return;
    try {
      await apiRequest(`/placements/${id}`, { method: "DELETE" });
      fetchPlacements();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(placements.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-[95%] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-slate-900">Placement Management</h1>
          </div>
          <div className="flex gap-3">
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2 animate-fadeIn"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Selected ({selectedIds.length})
              </button>
            )}
            <button
              onClick={() => setShowBulkModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Bulk Upload / Paste
            </button>
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Placement
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider text-left border-b border-slate-200">
                    <th className="py-3 px-2 w-8">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        onChange={handleSelectAll}
                        checked={selectedIds.length === placements.length && placements.length > 0}
                      />
                    </th>
                    {isL2 ? (
                      <>
                        <th className="py-3 px-2 font-medium">Candidate Name</th>
                        <th className="py-3 px-2 font-medium">DOJ</th>
                        <th className="py-3 px-2 font-medium">Client</th>
                        <th className="py-3 px-2 font-medium">Total Revenue</th>
                        <th className="py-3 px-2 font-medium">Billing status</th>
                        <th className="py-3 px-2 font-medium">DOQ</th>
                        <th className="py-3 px-2 font-medium">Sourcer</th>
                        <th className="py-3 px-2 font-medium">Account Manager</th>
                        <th className="py-3 px-2 font-medium">TL</th>
                        <th className="py-3 px-2 font-medium">Days Completed</th>
                        <th className="py-3 px-2 font-medium">Placement sharing</th>
                        <th className="py-3 px-2 font-medium">Placement Credit</th>
                        <th className="py-3 px-2 font-medium">Revenue as Lead</th>
                        <th className="py-3 px-2 font-medium">Revenue Qualifier</th>
                      </>
                    ) : isVantageL4 ? (
                      <>
                        <th className="py-3 px-2 font-medium">Candidate Name</th>
                        <th className="py-3 px-2 font-medium">DOJ</th>
                        <th className="py-3 px-2 font-medium">Client</th>
                        <th className="py-3 px-2 font-medium">Total Revenue</th>
                        <th className="py-3 px-2 font-medium">Billing status</th>
                        <th className="py-3 px-2 font-medium">DOQ</th>
                        <th className="py-3 px-2 font-medium">Client ID</th>
                        <th className="py-3 px-2 font-medium">JPC ID</th>
                        <th className="py-3 px-2 font-medium">Placement Type</th>
                        <th className="py-3 px-2 font-medium">Days Completed</th>
                        <th className="py-3 px-2 font-medium">Revenue Qualifier</th>
                        <th className="py-3 px-2 font-medium">Incentive amount (INR)</th>
                        <th className="py-3 px-2 font-medium">Incentive Paid</th>
                      </>
                    ) : (
                      <>
                        <th className="py-3 px-2 font-medium">Candidate Name</th>
                        <th className="py-3 px-2 font-medium">DOJ</th>
                        <th className="py-3 px-2 font-medium">DOQ</th>
                        <th className="py-3 px-2 font-medium">Client</th>
                        <th className="py-3 px-2 font-medium">Client ID</th>
                        <th className="py-3 px-2 font-medium">JPC ID</th>
                        <th className="py-3 px-2 font-medium">Placement Type</th>
                        <th className="py-3 px-2 font-medium">Revenue Generated</th>
                        <th className="py-3 px-2 font-medium">Margin</th>
                        <th className="py-3 px-2 font-medium">Billed Hours</th>
                        <th className="py-3 px-2 font-medium">Billing Status</th>
                        <th className="py-3 px-2 font-medium">Days Completed</th>
                        <th className="py-3 px-2 font-medium">Revenue Qualifier</th>
                        <th className="py-3 px-2 font-medium">Incentive amount (INR)</th>
                        <th className="py-3 px-2 font-medium">Incentive Paid (INR)</th>
                      </>
                    )}
                    <th className="py-3 px-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {placements.map((p) => (
                    <tr key={p.id} className={`hover:bg-slate-50 ${selectedIds.includes(p.id) ? 'bg-blue-50/50' : ''}`}>
                      <td className="py-3 px-2">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedIds.includes(p.id)}
                          onChange={() => handleSelectOne(p.id)}
                        />
                      </td>
                      {isL2 ? (
                        <>
                          <td className="py-3 px-2 font-medium text-slate-800">{p.candidateName}</td>
                          <td className="py-3 px-2 text-slate-600">{new Date(p.doj).toLocaleDateString()}</td>
                          <td className="py-3 px-2 text-slate-600">{p.clientName}</td>
                          <td className="py-3 px-2 text-slate-600">{p.totalRevenue || '-'}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              p.billingStatus === 'BILLED' ? 'bg-green-100 text-green-700' : 
                              p.billingStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {p.billingStatus === 'BILLED' ? 'Completed' : p.billingStatus === 'PENDING' ? 'Pending' : p.billingStatus}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-slate-600">{p.doq ? new Date(p.doq).toLocaleDateString() : '-'}</td>
                          <td className="py-3 px-2 text-slate-600">{p.sourcer || '-'}</td>
                          <td className="py-3 px-2 text-slate-600">{p.accountManager || '-'}</td>
                          <td className="py-3 px-2 text-slate-600">{p.teamLead || '-'}</td>
                          <td className="py-3 px-2 text-slate-600">{p.placementType === 'PERMANENT' ? p.daysCompleted : ''}</td>
                          <td className="py-3 px-2 text-slate-600">{p.placementSharing || '-'}</td>
                          <td className="py-3 px-2 text-slate-600">{p.placementCredit || '-'}</td>
                          <td className="py-3 px-2 text-slate-600">{p.revenueAsLead || '-'}</td>
                          <td className="py-3 px-2">
                            {p.qualifier ? <span className="text-green-600 font-bold">Yes</span> : <span className="text-slate-400">No</span>}
                          </td>
                        </>
                      ) : isVantageL4 ? (
                        <>
                          <td className="py-3 px-2 font-medium text-slate-800">{p.candidateName}</td>
                          <td className="py-3 px-2 text-slate-600">{new Date(p.doj).toLocaleDateString()}</td>
                          <td className="py-3 px-2 text-slate-600">{p.clientName}</td>
                          <td className="py-3 px-2 text-slate-600">{p.totalRevenue || '-'}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              p.billingStatus === 'BILLED' ? 'bg-green-100 text-green-700' : 
                              p.billingStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {p.billingStatus === 'BILLED' ? 'Completed' : p.billingStatus === 'PENDING' ? 'Pending' : p.billingStatus}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-slate-600">{p.doi ? new Date(p.doi).toLocaleDateString() : '-'}</td>
                          <td className="py-3 px-2 text-slate-600">{p.clientId || "—"}</td>
                          <td className="py-3 px-2 text-slate-600">{p.jpcId || "—"}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              p.placementType === 'PERMANENT' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {p.placementType === 'PERMANENT' ? 'FTE' : 'Contract'}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-slate-600">{p.placementType === 'PERMANENT' ? p.daysCompleted : ''}</td>
                          <td className="py-3 px-2">
                            {p.qualifier ? <span className="text-green-600 font-bold">Yes</span> : <span className="text-slate-400">No</span>}
                          </td>
                          <td className="py-3 px-2 text-slate-600">{p.incentiveAmountInr ? CalculationService.formatCurrency(p.incentiveAmountInr, 'INR') : '-'}</td>
                          <td className="py-3 px-2">
                            <span className="text-slate-600">{p.incentivePaid || '-'}</span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-2 font-medium text-slate-800">{p.candidateName}</td>
                          <td className="py-3 px-2 text-slate-600">{new Date(p.doj).toLocaleDateString()}</td>
                          <td className="py-3 px-2 text-slate-600">{p.doq ? new Date(p.doq).toLocaleDateString() : '-'}</td>
                          <td className="py-3 px-2 text-slate-600">{p.clientName}</td>
                          <td className="py-3 px-2 text-slate-600">{p.clientId || "—"}</td>
                          <td className="py-3 px-2 text-slate-600">{p.jpcId || "—"}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              p.placementType === 'PERMANENT' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {p.placementType === 'PERMANENT' ? 'FTE' : 'Contract'}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-emerald-600 font-medium">{CalculationService.formatCurrency(p.revenue)}</td>
                          <td className="py-3 px-2 text-slate-600">{p.marginPercent ? CalculationService.formatPercentage(p.marginPercent) : '-'}</td>
                          <td className="py-3 px-2 text-slate-600">{p.billedHours || '-'}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              p.billingStatus === 'BILLED' ? 'bg-green-100 text-green-700' : 
                              p.billingStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {p.billingStatus === 'BILLED' ? 'Completed' : p.billingStatus === 'PENDING' ? 'Pending' : p.billingStatus}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-slate-600">{p.placementType === 'PERMANENT' ? p.daysCompleted : ''}</td>
                          <td className="py-3 px-2">
                            {p.qualifier ? <span className="text-green-600 font-bold">Yes</span> : <span className="text-slate-400">No</span>}
                          </td>
                          <td className="py-3 px-2 text-slate-600">{p.incentiveAmountInr ? CalculationService.formatCurrency(p.incentiveAmountInr, 'INR') : '-'}</td>
                          <td className="py-3 px-2">
                            <span className="text-slate-600">{p.incentivePaid || '-'}</span>
                          </td>
                        </>
                      )}
                      <td className="py-3 px-2 text-right flex gap-2 justify-end">
                        <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800 text-xs">Edit</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 text-xs">Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 animate-fadeIn overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{editingId ? 'Edit Placement' : 'Add New Placement'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Candidate Name</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.candidateName} onChange={e => setFormData({...formData, candidateName: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Client ID</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">JPC ID</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.jpcId} onChange={e => setFormData({...formData, jpcId: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Client Name</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Placement Type</label>
                <select className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.placementType} onChange={e => setFormData({...formData, placementType: e.target.value})}>
                  <option value="PERMANENT">FTE</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Date of Joining (DOJ)</label>
                <input required type="date" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.doj} onChange={e => setFormData({...formData, doj: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Date of Quit (DOQ)</label>
                <input type="date" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.doq} onChange={e => setFormData({...formData, doq: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Days Completed</label>
                <input disabled type="number" className="w-full px-3 py-2 border rounded-lg bg-slate-100 text-sm"
                  value={formData.daysCompleted} />
                <p className="text-[10px] text-slate-500">Auto-calculated from DOJ</p>
              </div>

              {!isVantageL4 && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Billed Hours</label>
                    <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm"
                      value={formData.billedHours} onChange={e => setFormData({...formData, billedHours: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Margin %</label>
                    <input type="number" step="0.01" className="w-full px-3 py-2 border rounded-lg text-sm"
                      value={formData.marginPercent} onChange={e => setFormData({...formData, marginPercent: e.target.value})} />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Revenue ($)</label>
                <input required type="number" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.revenue} onChange={e => setFormData({...formData, revenue: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Sourcer</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.sourcer} onChange={e => setFormData({...formData, sourcer: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Account Manager</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.accountManager} onChange={e => setFormData({...formData, accountManager: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Team Lead</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.teamLead} onChange={e => setFormData({...formData, teamLead: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Placement Sharing</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.placementSharing} onChange={e => setFormData({...formData, placementSharing: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Total Revenue</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.totalRevenue} onChange={e => setFormData({...formData, totalRevenue: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Revenue as Lead</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.revenueAsLead} onChange={e => setFormData({...formData, revenueAsLead: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Placement Credit</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.placementCredit} onChange={e => setFormData({...formData, placementCredit: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Billing Status</label>
                <select className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.billingStatus} onChange={e => setFormData({...formData, billingStatus: e.target.value})}>
                  <option value="PENDING">Pending</option>
                  <option value="BILLED">Billed</option>
                  <option value="HOLD">Hold</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Incentive ETA</label>
                <input type="date" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.incentivePayoutEta} onChange={e => setFormData({...formData, incentivePayoutEta: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Incentive Amt (INR)</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.incentiveAmountInr} onChange={e => setFormData({...formData, incentiveAmountInr: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Incentive Paid (Amount/Details)</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.incentivePaid || ''} onChange={e => setFormData({...formData, incentivePaid: e.target.value})} />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input disabled type="checkbox" id="qualifier" className="w-4 h-4 accent-green-600"
                  checked={formData.qualifier} />
                <label htmlFor="qualifier" className="text-sm font-medium text-slate-700">Qualifier (Auto &gt; 90 days)</label>
              </div>
              
              <div className="col-span-3 flex justify-end gap-3 mt-6 border-t pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingId ? 'Update Placement' : 'Create Placement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Bulk Upload Placements</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Upload File (Excel or CSV)</label>
                <input type="file" accept=".csv, .xlsx, .xls" onChange={e => setCsvFile(e.target.files[0])} 
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                <p className="text-xs text-slate-500 mt-1">Excel Format: 'Recruiter Name: [Name]' followed by table (Candidate, Client, CTC, Role, Date)</p>
              </div>
              <div className="text-center text-slate-400 my-2">- OR -</div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Paste CSV Data (with headers)</label>
                <textarea 
                  rows={8}
                  placeholder="candidateName, clientName, doi, doj, revenue, placementType...&#10;John Doe, Acme Corp, 2023-01-01, 2023-02-01, 50000, PERMANENT"
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-1">Headers: candidateName, clientName, doi, doj, revenue, revenueAsLead, placementType, billedHours, marginPercent, billingStatus, incentivePayoutEta, incentiveAmountInr, incentivePaid</p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowBulkModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button onClick={handleBulkSubmit} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Upload Data</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Result Modal */}
      {showResultModal && resultData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Upload Summary</h2>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-emerald-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-emerald-600">{resultData.created?.length || 0}</div>
                <div className="text-xs text-emerald-800 font-medium uppercase">Created</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{resultData.updated?.length || 0}</div>
                <div className="text-xs text-blue-800 font-medium uppercase">Updated</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-slate-600">{resultData.unchanged?.length || 0}</div>
                <div className="text-xs text-slate-800 font-medium uppercase">Unchanged</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{resultData.errors?.length || 0}</div>
                <div className="text-xs text-red-800 font-medium uppercase">Errors</div>
              </div>
            </div>

            <div className="space-y-4">
               {resultData.created?.length > 0 && (
                   <div className="border rounded-lg overflow-hidden">
                       <div className="bg-emerald-100 px-4 py-2 font-medium text-emerald-800 text-sm">Created ({resultData.created.length})</div>
                       <div className="max-h-40 overflow-y-auto p-2 bg-white text-xs space-y-1">
                           {resultData.created.map((p, i) => (
                               <div key={i} className="flex justify-between border-b border-slate-50 last:border-0 pb-1">
                                   <span>{p.candidateName}</span>
                                   <span className="text-slate-500">{p.clientName}</span>
                               </div>
                           ))}
                       </div>
                   </div>
               )}
               
               {resultData.updated?.length > 0 && (
                   <div className="border rounded-lg overflow-hidden">
                       <div className="bg-blue-100 px-4 py-2 font-medium text-blue-800 text-sm">Updated ({resultData.updated.length})</div>
                       <div className="max-h-40 overflow-y-auto p-2 bg-white text-xs space-y-1">
                           {resultData.updated.map((p, i) => (
                               <div key={i} className="flex justify-between border-b border-slate-50 last:border-0 pb-1">
                                   <span>{p.candidateName}</span>
                                   <span className="text-slate-500">{p.clientName}</span>
                               </div>
                           ))}
                       </div>
                   </div>
               )}

               {resultData.unchanged?.length > 0 && (
                   <div className="border rounded-lg overflow-hidden">
                       <div className="bg-slate-100 px-4 py-2 font-medium text-slate-800 text-sm">Unchanged ({resultData.unchanged.length})</div>
                       <div className="max-h-40 overflow-y-auto p-2 bg-white text-xs space-y-1">
                           {resultData.unchanged.map((p, i) => (
                               <div key={i} className="flex justify-between border-b border-slate-50 last:border-0 pb-1">
                                   <span>{p.candidateName}</span>
                                   <span className="text-slate-500">{p.clientName}</span>
                               </div>
                           ))}
                       </div>
                   </div>
               )}

               {resultData.errors?.length > 0 && (
                   <div className="border rounded-lg overflow-hidden">
                       <div className="bg-red-100 px-4 py-2 font-medium text-red-800 text-sm">Errors ({resultData.errors.length})</div>
                       <div className="max-h-40 overflow-y-auto p-2 bg-white text-xs space-y-1">
                           {resultData.errors.map((e, i) => (
                               <div key={i} className="text-red-600 border-b border-red-50 last:border-0 pb-1">
                                   <span className="font-semibold block">{e.error}</span>
                                   <span className="text-slate-500 block truncate">{JSON.stringify(e.data)}</span>
                               </div>
                           ))}
                       </div>
                   </div>
               )}
            </div>

            <div className="flex justify-end mt-6">
              <button 
                onClick={() => { setShowResultModal(false); setResultData(null); }} 
                className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployeePlacements;
