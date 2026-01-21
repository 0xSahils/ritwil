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

  const initialFormState = {
    candidateName: "",
    candidateId: "",
    jpcId: "",
    clientName: "",
    doi: "",
    doj: "",
    daysCompleted: 0,
    placementType: "PERMANENT",
    billedHours: "",
    marginPercent: "",
    revenue: "",
    billingStatus: "PENDING",
    incentivePayoutEta: "",
    incentiveAmountInr: "",
    incentivePaid: false,
    qualifier: false,
  };

  const [formData, setFormData] = useState(initialFormState);

  const [allUsers, setAllUsers] = useState([]);
  
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

  const handleEdit = (placement) => {
    setEditingId(placement.id);
    setFormData({
      candidateName: placement.candidateName,
      clientName: placement.clientName,
      doi: placement.doi ? placement.doi.split('T')[0] : "",
      doj: placement.doj ? placement.doj.split('T')[0] : "",
      daysCompleted: placement.daysCompleted,
      placementType: placement.placementType,
      billedHours: placement.billedHours || "",
      marginPercent: placement.marginPercent || "",
      revenue: placement.revenue || "",
      billingStatus: placement.billingStatus,
      incentivePayoutEta: placement.incentivePayoutEta ? placement.incentivePayoutEta.split('T')[0] : "",
      incentiveAmountInr: placement.incentiveAmountInr || "",
      incentivePaid: placement.incentivePaid,
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
              
              let currentRecruiterId = null; // Reset per sheet (safer assumption)
     
              // Iterate
              for (let i = 0; i < jsonData.length; i++) {
                 const row = jsonData[i];
                 if (!row || row.length === 0) continue;
                 
                 const firstStr = String(row[0] || "").trim();
                 
                 // Recruiter Block Start
                 if (firstStr.toLowerCase().startsWith("recruiter name")) {
                     // Try to split by ':' or check next cell
                     let name = "";
                     if (firstStr.includes(":")) {
                         name = firstStr.split(":")[1].trim();
                     } 
                     if (!name && row[1]) {
                         name = String(row[1]).trim();
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
     
                 // Headers row - skip
                 if (firstStr.toLowerCase() === "candidate name" || row.some(c => String(c).toLowerCase() === "candidate name")) {
                     continue;
                 }
     
                 // Data Row
                 if (currentRecruiterId) {
                     // Expecting: Candidate Name, Company Name, CTC, Role, Date
                     const candidateName = row[0];
                     const clientName = row[1];
                     const ctc = row[2];
                     const role = row[3];
                     const dateVal = row[4];
     
                     if (!candidateName || !clientName) continue;
     
                     // Parse Date
                     let doj = new Date();
                     if (typeof dateVal === 'number') {
                          // Excel date
                          doj = new Date(Math.round((dateVal - 25569)*86400*1000));
                     } else if (dateVal) {
                          doj = new Date(dateVal);
                     }
     
                     if (isNaN(doj.getTime())) doj = new Date();
     
                     globalPlacements.push({
                         employeeId: currentRecruiterId,
                         candidateName,
                         clientName,
                         doi: doj,
                         doj: doj,
                         revenue: ctc || 0,
                         placementType: String(role).toLowerCase().includes("contract") ? "CONTRACT" : "PERMANENT",
                         billingStatus: "PENDING",
                         incentivePaid: false
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
         alert(`Upload processed!\nCreated: ${result.created?.length || 0}\nUpdated: ${result.updated?.length || 0}\nErrors: ${result.errors?.length || 0}`);
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
           headers = ["candidateName", "candidateId", "jpcId", "clientName", "doj", "revenue", "placementType", "billedHours", "marginPercent", "billingStatus", "incentivePayoutEta", "incentiveAmountInr", "incentivePaid"];
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
      alert(`Upload processed!\nCreated: ${result.created?.length || 0}\nUpdated: ${result.updated?.length || 0}`);
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
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <th className="py-3 px-2">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={placements.length > 0 && selectedIds.length === placements.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="py-3 px-2 font-medium">Candidate</th>
                    <th className="py-3 px-2 font-medium">Candidate ID</th>
                    <th className="py-3 px-2 font-medium">JPC ID</th>
                    <th className="py-3 px-2 font-medium">DOJ</th>
                    <th className="py-3 px-2 font-medium">Days</th>
                    <th className="py-3 px-2 font-medium">Client</th>
                    <th className="py-3 px-2 font-medium">Type</th>
                    <th className="py-3 px-2 font-medium">Hours</th>
                    <th className="py-3 px-2 font-medium">Margin %</th>
                    <th className="py-3 px-2 font-medium">Revenue ($)</th>
                    <th className="py-3 px-2 font-medium">Status</th>
                    <th className="py-3 px-2 font-medium">Inc. ETA</th>
                    <th className="py-3 px-2 font-medium">Inc. (INR)</th>
                    <th className="py-3 px-2 font-medium">Paid</th>
                    <th className="py-3 px-2 font-medium">Qualifier</th>
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
                      <td className="py-3 px-2 font-medium text-slate-800">{p.candidateName}</td>
                      <td className="py-3 px-2 text-slate-600">{p.candidateId || "—"}</td>
                      <td className="py-3 px-2 text-slate-600">{p.jpcId || "—"}</td>
                      <td className="py-3 px-2 text-slate-600">{new Date(p.doj).toLocaleDateString()}</td>
                      <td className="py-3 px-2 text-slate-600">{p.daysCompleted}</td>
                      <td className="py-3 px-2 text-slate-600">{p.clientName}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.placementType === 'PERMANENT' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {p.placementType === 'PERMANENT' ? 'Perm' : 'Cont'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-600">{p.billedHours || '-'}</td>
                      <td className="py-3 px-2 text-slate-600">{p.marginPercent ? CalculationService.formatPercentage(p.marginPercent) : '-'}</td>
                      <td className="py-3 px-2 text-emerald-600 font-medium">{CalculationService.formatCurrency(p.revenue)}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.billingStatus === 'BILLED' ? 'bg-green-100 text-green-700' : 
                          p.billingStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {p.billingStatus === 'BILLED' ? 'Completed' : p.billingStatus === 'PENDING' ? 'Pending' : p.billingStatus}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-600">{p.incentivePayoutEta ? new Date(p.incentivePayoutEta).toLocaleDateString() : '-'}</td>
                      <td className="py-3 px-2 text-slate-600">{p.incentiveAmountInr ? CalculationService.formatCurrency(p.incentiveAmountInr, 'INR') : '-'}</td>
                      <td className="py-3 px-2">
                        {p.incentivePaid ? <span className="text-green-600">✓</span> : <span className="text-slate-300">✗</span>}
                      </td>
                      <td className="py-3 px-2">
                        {p.qualifier ? <span className="text-green-600 font-bold">Yes</span> : <span className="text-slate-400">No</span>}
                      </td>
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
                <label className="block text-xs font-medium text-slate-700 mb-1">Candidate ID</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.candidateId} onChange={e => setFormData({...formData, candidateId: e.target.value})} />
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
                  <option value="PERMANENT">Permanent</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">DOI</label>
                <input required type="date" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.doi} onChange={e => setFormData({...formData, doi: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">DOQ (DOJ)</label>
                <input required type="date" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.doj} onChange={e => setFormData({...formData, doj: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Days Completed</label>
                <input disabled type="number" className="w-full px-3 py-2 border rounded-lg bg-slate-100 text-sm"
                  value={formData.daysCompleted} />
                <p className="text-[10px] text-slate-500">Auto-calculated from DOQ</p>
              </div>

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
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Revenue ($)</label>
                <input required type="number" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.revenue} onChange={e => setFormData({...formData, revenue: e.target.value})} />
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

              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" id="incentivePaid" className="w-4 h-4"
                  checked={formData.incentivePaid} onChange={e => setFormData({...formData, incentivePaid: e.target.checked})} />
                <label htmlFor="incentivePaid" className="text-sm font-medium text-slate-700">Incentive Paid</label>
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
                <p className="text-xs text-slate-500 mt-1">Headers: candidateName, clientName, doi, doj, revenue, placementType, billedHours, marginPercent, billingStatus, incentivePayoutEta, incentiveAmountInr, incentivePaid</p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowBulkModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button onClick={handleBulkSubmit} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Upload Data</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployeePlacements;
