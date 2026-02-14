import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import CalculationService from "../utils/calculationService";

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
  const [selectedIds, setSelectedIds] = useState([]);
  const [targetUser, setTargetUser] = useState(null);

  // Split by source so we show Personal (recruiter sheet) vs Team (lead sheet) clearly
  const personalPlacements = placements.filter((p) => p.source === "personal");
  const teamPlacements = placements.filter((p) => p.source === "team");
  const legacyPlacements = placements.filter((p) => !p.source || p.source === "legacy");
  const filteredPlacements = placements;

  // Show Team section only for team leads (L2/L3); hide for L4 and other roles
  const isTeamLead = targetUser?.role === "TEAM_LEAD";

  const initialFormState = {
    candidateName: "",
    candidateId: "",
    placementYear: new Date().getFullYear(),
    clientName: "",
    plcId: "",
    doi: "",
    doq: "",
    doj: "",
    placementType: "PERMANENT",
    billedHours: "",
    revenue: "",
    teamLead: "",
    placementSharing: "",
    totalRevenue: "",
    revenueAsLead: "",
    billingStatus: "PENDING",
    collectionStatus: "",
    incentivePayoutEta: "",
    incentiveAmountInr: "",
    incentivePaidInr: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // Auto-calculate Days Completed - REMOVED as per request to delete field
  // useEffect(() => {
  //   if (formData.doj) {
  //     const diffDays = CalculationService.calculateDaysDifference(formData.doj);
  //     setFormData(prev => ({ ...prev, daysCompleted: diffDays }));
  //   }
  // }, [formData.doj]);

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

  const handleEdit = (placement) => {
    setEditingId(placement.id);
    setFormData({
      candidateName: placement.candidateName,
      candidateId: placement.candidateId || "",
      placementYear: placement.placementYear || new Date().getFullYear(),
      clientName: placement.clientName,
      plcId: placement.plcId || "",
      doq: placement.doq ? placement.doq.split('T')[0] : "",
      doj: placement.doj ? placement.doj.split('T')[0] : "",
      placementType: placement.placementType,
      billedHours: placement.billedHours || "",
      revenue: placement.revenue || "",
      teamLead: placement.teamLead || "",
      placementSharing: placement.placementSharing || "",
      totalRevenue: placement.totalRevenue || "",
      revenueAsLead: placement.revenueAsLead || "",
      billingStatus: placement.billingStatus,
      collectionStatus: placement.collectionStatus || "",
      incentivePayoutEta: placement.incentivePayoutEta ? placement.incentivePayoutEta.split('T')[0] : "",
      incentiveAmountInr: placement.incentiveAmountInr || "",
      incentivePaidInr: (placement.incentivePaidInr !== undefined && placement.incentivePaidInr !== null) ? String(placement.incentivePaidInr) : "",
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
      setSelectedIds(filteredPlacements.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectAllInSection = (sectionPlacements) => {
    setSelectedIds((prev) => {
      const sectionIds = sectionPlacements.map((p) => p.id);
      const allSelected = sectionIds.length > 0 && sectionIds.every((id) => prev.includes(id));
      if (allSelected) return prev.filter((id) => !sectionIds.includes(id));
      return [...new Set([...prev, ...sectionIds])];
    });
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
          <div className="space-y-8">
            {/* Personal (Recruiter sheet) placements */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2">
                <h2 className="text-sm font-semibold text-indigo-900">Personal (Recruiter) Placements</h2>
                <p className="text-xs text-indigo-700 mt-0.5">From the recruiter / members placement sheet. Empty if no personal sheet was uploaded.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider text-left border-b border-slate-200">
                      <th className="py-3 px-2 w-8">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          onChange={() => handleSelectAllInSection(personalPlacements)}
                          checked={personalPlacements.length > 0 && personalPlacements.every((p) => selectedIds.includes(p.id))}
                        />
                      </th>
                      <th className="py-3 px-2 font-medium">Candidate Name</th>
                      <th className="py-3 px-2 font-medium">Recruiter Name</th>
                      <th className="py-3 px-2 font-medium">Lead</th>
                      <th className="py-3 px-2 font-medium">Split With</th>
                      <th className="py-3 px-2 font-medium">Placement Year</th>
                      <th className="py-3 px-2 font-medium">DOJ</th>
                      <th className="py-3 px-2 font-medium">DOQ</th>
                      <th className="py-3 px-2 font-medium">Client</th>
                      <th className="py-3 px-2 font-medium">PLC ID</th>
                      <th className="py-3 px-2 font-medium">Placement Type</th>
                      <th className="py-3 px-2 font-medium">Billing Status</th>
                      <th className="py-3 px-2 font-medium">Collection Status</th>
                      <th className="py-3 px-2 font-medium">Total Billed Hours</th>
                      <th className="py-3 px-2 font-medium">Revenue (USD)</th>
                      <th className="py-3 px-2 font-medium">Revenue -Lead (USD)</th>
                      <th className="py-3 px-2 font-medium">Incentive amount (INR)</th>
                      <th className="py-3 px-2 font-medium">Incentive Paid (INR)</th>
                      <th className="py-3 px-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {personalPlacements.length === 0 ? (
                      <tr>
                        <td colSpan="100%" className="px-6 py-8 text-center text-slate-500">
                          <span className="font-medium">No personal (recruiter) placements</span>
                        </td>
                      </tr>
                    ) : (
                      personalPlacements.map((p) => (
                        <tr key={p.id} className={`hover:bg-slate-50 ${selectedIds.includes(p.id) ? "bg-blue-50/50" : ""}`}>
                          <td className="py-3 px-2">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              checked={selectedIds.includes(p.id)}
                              onChange={() => handleSelectOne(p.id)}
                            />
                          </td>
                          <td className="py-3 px-2 font-medium text-slate-800">{p.candidateName}</td>
                          <td className="py-3 px-2 text-slate-600">{userName || "-"}</td>
                          <td className="py-3 px-2 text-slate-600">{p.teamLead || "-"}</td>
                          <td className="py-3 px-2 text-slate-600">{p.placementSharing || "-"}</td>
                          <td className="py-3 px-2 text-slate-600">{p.placementYear || "-"}</td>
                          <td className="py-3 px-2 text-slate-600">{new Date(p.doj).toLocaleDateString()}</td>
                          <td className="py-3 px-2 text-slate-600">{p.doq ? new Date(p.doq).toLocaleDateString() : "-"}</td>
                          <td className="py-3 px-2 text-slate-600">{p.clientName}</td>
                          <td className="py-3 px-2 text-slate-600">{p.plcId || "-"}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(p.placementType && (p.placementType.toUpperCase().includes("PERMANENT") || p.placementType.toUpperCase().includes("FTE"))) ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}`}>
                              {p.placementType || "-"}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.billingStatus === "BILLED" ? "bg-green-100 text-green-700" : p.billingStatus === "PENDING" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                              {p.billingStatus === "BILLED" ? "Completed" : p.billingStatus === "PENDING" ? "Pending" : p.billingStatus}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-slate-600">{p.collectionStatus || "-"}</td>
                          <td className="py-3 px-2 text-slate-600">{p.billedHours || "-"}</td>
                          <td className="py-3 px-2 text-emerald-600 font-medium">{CalculationService.formatCurrency(p.revenue)}</td>
                          <td className="py-3 px-2 text-slate-600">{p.revenueAsLead || "-"}</td>
                          <td className="py-3 px-2 text-slate-600">{p.incentiveAmountInr ? CalculationService.formatCurrency(p.incentiveAmountInr, "INR") : "-"}</td>
                          <td className="py-3 px-2 text-slate-600">{p.incentivePaidInr || "-"}</td>
                          <td className="py-3 px-2 text-right flex gap-2 justify-end">
                            <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800 text-xs">Edit</button>
                            <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 text-xs">Del</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Team (Lead sheet) placements – only for team leads (L2/L3); hidden for L4 and other roles */}
            {isTeamLead && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-violet-50 border-b border-violet-100 px-4 py-2">
                  <h2 className="text-sm font-semibold text-violet-900">Team (Lead) Placements</h2>
                  <p className="text-xs text-violet-700 mt-0.5">From the team lead placement sheet. Only present for team leads.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider text-left border-b border-slate-200">
                        <th className="py-3 px-2 w-8">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            onChange={() => handleSelectAllInSection(teamPlacements)}
                            checked={teamPlacements.length > 0 && teamPlacements.every((p) => selectedIds.includes(p.id))}
                          />
                        </th>
                        <th className="py-3 px-2 font-medium">Candidate Name</th>
                        <th className="py-3 px-2 font-medium">Recruiter Name</th>
                        <th className="py-3 px-2 font-medium">Lead</th>
                        <th className="py-3 px-2 font-medium">Split With</th>
                        <th className="py-3 px-2 font-medium">Placement Year</th>
                        <th className="py-3 px-2 font-medium">DOJ</th>
                        <th className="py-3 px-2 font-medium">DOQ</th>
                        <th className="py-3 px-2 font-medium">Client</th>
                        <th className="py-3 px-2 font-medium">PLC ID</th>
                        <th className="py-3 px-2 font-medium">Placement Type</th>
                        <th className="py-3 px-2 font-medium">Billing Status</th>
                        <th className="py-3 px-2 font-medium">Collection Status</th>
                        <th className="py-3 px-2 font-medium">Total Billed Hours</th>
                        <th className="py-3 px-2 font-medium">Revenue (USD)</th>
                        <th className="py-3 px-2 font-medium">Revenue -Lead (USD)</th>
                        <th className="py-3 px-2 font-medium">Incentive amount (INR)</th>
                        <th className="py-3 px-2 font-medium">Incentive Paid (INR)</th>
                        <th className="py-3 px-2 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {teamPlacements.length === 0 ? (
                        <tr>
                          <td colSpan="100%" className="px-6 py-8 text-center text-slate-500">
                            <span className="font-medium">No team (lead) placements</span>
                          </td>
                        </tr>
                      ) : (
                        teamPlacements.map((p) => (
                          <tr key={p.id} className={`hover:bg-slate-50 ${selectedIds.includes(p.id) ? "bg-blue-50/50" : ""}`}>
                            <td className="py-3 px-2">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                checked={selectedIds.includes(p.id)}
                                onChange={() => handleSelectOne(p.id)}
                              />
                            </td>
                            <td className="py-3 px-2 font-medium text-slate-800">{p.candidateName}</td>
                            <td className="py-3 px-2 text-slate-600">{userName || "-"}</td>
                            <td className="py-3 px-2 text-slate-600">{p.teamLead || "-"}</td>
                            <td className="py-3 px-2 text-slate-600">{p.placementSharing || "-"}</td>
                            <td className="py-3 px-2 text-slate-600">{p.placementYear || "-"}</td>
                            <td className="py-3 px-2 text-slate-600">{new Date(p.doj).toLocaleDateString()}</td>
                            <td className="py-3 px-2 text-slate-600">{p.doq ? new Date(p.doq).toLocaleDateString() : "-"}</td>
                            <td className="py-3 px-2 text-slate-600">{p.clientName}</td>
                            <td className="py-3 px-2 text-slate-600">{p.plcId || "-"}</td>
                            <td className="py-3 px-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(p.placementType && (p.placementType.toUpperCase().includes("PERMANENT") || p.placementType.toUpperCase().includes("FTE"))) ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}`}>
                                {p.placementType || "-"}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.billingStatus === "BILLED" ? "bg-green-100 text-green-700" : p.billingStatus === "PENDING" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                                {p.billingStatus === "BILLED" ? "Completed" : p.billingStatus === "PENDING" ? "Pending" : p.billingStatus}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-slate-600">{p.collectionStatus || "-"}</td>
                            <td className="py-3 px-2 text-slate-600">{p.billedHours || "-"}</td>
                            <td className="py-3 px-2 text-emerald-600 font-medium">{CalculationService.formatCurrency(p.revenue)}</td>
                            <td className="py-3 px-2 text-slate-600">{p.revenueAsLead || "-"}</td>
                            <td className="py-3 px-2 text-slate-600">{p.incentiveAmountInr ? CalculationService.formatCurrency(p.incentiveAmountInr, "INR") : "-"}</td>
                            <td className="py-3 px-2 text-slate-600">{p.incentivePaidInr || "-"}</td>
                            <td className="py-3 px-2 text-right flex gap-2 justify-end">
                              <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800 text-xs">Edit</button>
                              <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 text-xs">Del</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Legacy placements (if any) */}
            {legacyPlacements.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 border-b border-slate-200 px-4 py-2">
                  <h2 className="text-sm font-semibold text-slate-800">Legacy / Other Placements</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider text-left border-b border-slate-200">
                        <th className="py-3 px-2 w-8">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            onChange={() => handleSelectAllInSection(legacyPlacements)}
                            checked={legacyPlacements.length > 0 && legacyPlacements.every((p) => selectedIds.includes(p.id))}
                          />
                        </th>
                        <th className="py-3 px-2 font-medium">Candidate Name</th>
                        <th className="py-3 px-2 font-medium">Recruiter Name</th>
                        <th className="py-3 px-2 font-medium">Lead</th>
                        <th className="py-3 px-2 font-medium">Split With</th>
                        <th className="py-3 px-2 font-medium">Placement Year</th>
                        <th className="py-3 px-2 font-medium">DOJ</th>
                        <th className="py-3 px-2 font-medium">DOQ</th>
                        <th className="py-3 px-2 font-medium">Client</th>
                        <th className="py-3 px-2 font-medium">PLC ID</th>
                        <th className="py-3 px-2 font-medium">Placement Type</th>
                        <th className="py-3 px-2 font-medium">Billing Status</th>
                        <th className="py-3 px-2 font-medium">Collection Status</th>
                        <th className="py-3 px-2 font-medium">Total Billed Hours</th>
                        <th className="py-3 px-2 font-medium">Revenue (USD)</th>
                        <th className="py-3 px-2 font-medium">Revenue -Lead (USD)</th>
                        <th className="py-3 px-2 font-medium">Incentive amount (INR)</th>
                        <th className="py-3 px-2 font-medium">Incentive Paid (INR)</th>
                        <th className="py-3 px-2 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {legacyPlacements.map((p) => (
                        <tr key={p.id} className={`hover:bg-slate-50 ${selectedIds.includes(p.id) ? "bg-blue-50/50" : ""}`}>
                          <td className="py-3 px-2">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              checked={selectedIds.includes(p.id)}
                              onChange={() => handleSelectOne(p.id)}
                            />
                          </td>
                          <td className="py-3 px-2 font-medium text-slate-800">{p.candidateName}</td>
                          <td className="py-3 px-2 text-slate-600">{userName || "-"}</td>
                          <td className="py-3 px-2 text-slate-600">{p.teamLead || "-"}</td>
                          <td className="py-3 px-2 text-slate-600">{p.placementSharing || "-"}</td>
                          <td className="py-3 px-2 text-slate-600">{p.placementYear || "-"}</td>
                          <td className="py-3 px-2 text-slate-600">{new Date(p.doj).toLocaleDateString()}</td>
                          <td className="py-3 px-2 text-slate-600">{p.doq ? new Date(p.doq).toLocaleDateString() : "-"}</td>
                          <td className="py-3 px-2 text-slate-600">{p.clientName}</td>
                          <td className="py-3 px-2 text-slate-600">{p.plcId || "-"}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(p.placementType && (p.placementType.toUpperCase().includes("PERMANENT") || p.placementType.toUpperCase().includes("FTE"))) ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}`}>
                              {p.placementType || "-"}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.billingStatus === "BILLED" ? "bg-green-100 text-green-700" : p.billingStatus === "PENDING" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                              {p.billingStatus === "BILLED" ? "Completed" : p.billingStatus === "PENDING" ? "Pending" : p.billingStatus}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-slate-600">{p.collectionStatus || "-"}</td>
                          <td className="py-3 px-2 text-slate-600">{p.billedHours || "-"}</td>
                          <td className="py-3 px-2 text-emerald-600 font-medium">{CalculationService.formatCurrency(p.revenue)}</td>
                          <td className="py-3 px-2 text-slate-600">{p.revenueAsLead || "-"}</td>
                          <td className="py-3 px-2 text-slate-600">{p.incentiveAmountInr ? CalculationService.formatCurrency(p.incentiveAmountInr, "INR") : "-"}</td>
                          <td className="py-3 px-2 text-slate-600">{p.incentivePaidInr || "-"}</td>
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
                <label className="block text-xs font-medium text-slate-700 mb-1">Placement Year</label>
                <input required type="number" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.placementYear} onChange={e => setFormData({...formData, placementYear: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Client</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">PLC ID</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.plcId || ""} onChange={e => setFormData({...formData, plcId: e.target.value})} />
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
                <label className="block text-xs font-medium text-slate-700 mb-1">Total Billed Hours</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.billedHours} onChange={e => setFormData({...formData, billedHours: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Revenue (USD)</label>
                <input required type="number" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.revenue} onChange={e => setFormData({...formData, revenue: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Lead</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.teamLead} onChange={e => setFormData({...formData, teamLead: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Split With</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.placementSharing} onChange={e => setFormData({...formData, placementSharing: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Total Revenue</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.totalRevenue} onChange={e => setFormData({...formData, totalRevenue: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Revenue as Lead (USD)</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.revenueAsLead} onChange={e => setFormData({...formData, revenueAsLead: e.target.value})} />
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
                <label className="block text-xs font-medium text-slate-700 mb-1">Collection Status</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.collectionStatus || ""} onChange={e => setFormData({...formData, collectionStatus: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Incentive ETA</label>
                <input type="date" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.incentivePayoutEta} onChange={e => setFormData({...formData, incentivePayoutEta: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Incentive amount (INR)</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.incentiveAmountInr} onChange={e => setFormData({...formData, incentiveAmountInr: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Incentive Paid (INR)</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.incentivePaidInr || ''} onChange={e => setFormData({...formData, incentivePaidInr: e.target.value})} />
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

    </div>
  );
};

export default AdminEmployeePlacements;
