import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

const PieChart = ({ percentage, size = 50 }) => {
  const radius = size / 2 - 4;
  const center = size / 2;
  const innerRadius = radius * 0.65;
  const angle = (percentage / 100) * 360;
  const largeArcFlag = angle > 180 ? 1 : 0;
  const endAngle = (angle * Math.PI) / 180;
  const endX = center + radius * Math.sin(endAngle);
  const endY = center - radius * Math.cos(endAngle);
  const startX = center;
  const startY = center - radius;
  const innerEndX = center + innerRadius * Math.sin(endAngle);
  const innerEndY = center - innerRadius * Math.cos(endAngle);
  const innerStartX = center;
  const innerStartY = center - innerRadius;

  const getGradientColors = (value) => {
    if (value <= 30) {
      return { start: "#ef4444", end: "#dc2626", stop1: "#f87171" };
    }
    if (value <= 80) {
      return { start: "#eab308", end: "#ca8a04", stop1: "#facc15" };
    }
    return { start: "#22c55e", end: "#16a34a", stop1: "#4ade80" };
  };

  const gradientColors = getGradientColors(percentage);
  const gradientId = `campaign-pie-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  return (
    <div
      className="relative flex-shrink-0 group"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-md"
        style={{
          background: `radial-gradient(circle, ${gradientColors.start} 0%, transparent 70%)`,
          transform: "scale(1.2)",
        }}
      />
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 relative z-10 drop-shadow-lg"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor={gradientColors.start}
              stopOpacity="1"
            />
            <stop
              offset="50%"
              stopColor={gradientColors.stop1}
              stopOpacity="1"
            />
            <stop
              offset="100%"
              stopColor={gradientColors.end}
              stopOpacity="1"
            />
          </linearGradient>
          <filter
            id={`shadow-${gradientId}`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
            <feOffset dx="0" dy="1" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-slate-200/60"
          opacity="0.8"
        />
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="white"
          className="drop-shadow-sm"
        />
        {percentage > 0 && (
          <path
            d={`M ${center} ${center} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} L ${innerEndX} ${innerEndY} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY} Z`}
            fill={`url(#${gradientId})`}
            filter={`url(#shadow-${gradientId})`}
            className="transition-all duration-500 ease-out animate-scaleIn"
            style={{
              transformOrigin: `${center}px ${center}px`,
            }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
        <span
          className="text-[11px] font-extrabold text-slate-800 leading-none drop-shadow-sm"
          style={{
            textShadow: "0 1px 2px rgba(255, 255, 255, 0.8)",
          }}
        >
          {Math.round(percentage)}
        </span>
        <span className="text-[8px] font-semibold text-slate-500 leading-none mt-0.5">
          %
        </span>
      </div>
      {percentage > 80 && (
        <div
          className="absolute inset-0 rounded-full border-2 border-green-400/30 animate-ping"
          style={{ animationDuration: "2s" }}
        />
      )}
    </div>
  );
};

const CampaignDashboard = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCampaigns, setExpandedCampaigns] = useState({});
  const [creating, setCreating] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    objective: "",
    targetAmount: "",
    startDate: "",
    endDate: "",
  });
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [selectedLead, setSelectedLead] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState({});
  const [assignmentTargets, setAssignmentTargets] = useState({});
  const [progressUpdates, setProgressUpdates] = useState({});

  const teamLeads = useMemo(
    () => users.filter((u) => u.role === "TEAM_LEAD"),
    [users]
  );
  const employees = useMemo(
    () => users.filter((u) => u.role === "EMPLOYEE"),
    [users]
  );

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [campaignRes, usersRes] = await Promise.all([
          apiRequest("/campaigns"),
          apiRequest("/users"),
        ]);

        if (!campaignRes.ok) {
          const data = await campaignRes.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load campaigns");
        }
        if (!usersRes.ok) {
          const data = await usersRes.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load users");
        }

        const campaignData = await campaignRes.json();
        const usersData = await usersRes.json();

        if (isMounted) {
          setCampaigns(campaignData);
          setUsers(usersData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (user?.role === "SUPER_ADMIN") {
      fetchData();
    } else {
      setLoading(false);
      setError("Only super admins can access campaign management");
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  const toggleCampaign = (id) => {
    setExpandedCampaigns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleNewCampaignChange = (field, value) => {
    setNewCampaign((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (savingCampaign) return;
    setSavingCampaign(true);
    setError("");

    try {
      const payload = {
        name: newCampaign.name,
        description: newCampaign.description || undefined,
        objective: newCampaign.objective || undefined,
        targetAmount: Number(newCampaign.targetAmount || 0),
        startDate: newCampaign.startDate,
        endDate: newCampaign.endDate,
      };

      const response = await apiRequest("/campaigns", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create campaign");
      }

      const created = await response.json();
      const normalized = {
        id: created.id,
        name: created.name,
        description: created.description,
        objective: created.objective,
        status: created.status,
        targetAmount: created.targetAmount,
        startDate: created.startDate,
        endDate: created.endDate,
        totalTarget: created.totalTarget || 0,
        progressPercent: created.progressPercent || 0,
        teamLeads: created.teamLeads || [],
        assignmentsCount: created.assignmentsCount || 0,
        completedAssignmentsCount:
          created.completedAssignmentsCount || 0,
      };
      setCampaigns((prev) => [normalized, ...prev]);
      setCreating(false);
      setNewCampaign({
        name: "",
        description: "",
        objective: "",
        targetAmount: "",
        startDate: "",
        endDate: "",
      });
    } catch (err) {
      setError(err.message || "Failed to create campaign");
    } finally {
      setSavingCampaign(false);
    }
  };

  const handleAddTeamLead = async (campaignId) => {
    const userId = selectedLead[campaignId];
    if (!userId) return;
    try {
      const response = await apiRequest(`/campaigns/${campaignId}/team-leads`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add team lead");
      }
      const added = await response.json();
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaignId
            ? {
                ...c,
                teamLeads: [
                  ...c.teamLeads,
                  { id: added.userId, name: added.name },
                ],
              }
            : c
        )
      );
    } catch (err) {
      setError(err.message || "Failed to add team lead");
    }
  };

  const handleAddAssignment = async (campaignId) => {
    const userId = selectedEmployee[campaignId];
    const targetValue = Number(assignmentTargets[campaignId] || 0);
    if (!userId || !targetValue) return;

    try {
      const response = await apiRequest(`/campaigns/${campaignId}/assignments`, {
        method: "POST",
        body: JSON.stringify({
          userId,
          role: "EMPLOYEE",
          targetAmount: targetValue,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to assign employee");
      }
      const created = await response.json();

      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaignId
            ? {
                ...c,
                assignmentsCount: (c.assignmentsCount || 0) + 1,
                totalTarget:
                  (c.totalTarget || 0) + created.targetAmount,
              }
            : c
        )
      );
    } catch (err) {
      setError(err.message || "Failed to assign employee");
    }
  };

  const handleUpdateProgress = async (assignmentId, campaignId) => {
    const value = progressUpdates[assignmentId];
    if (value === undefined || value === null) return;
    const percent = Math.max(
      0,
      Math.min(100, Number(value) || 0)
    );

    try {
      const response = await apiRequest(
        `/campaigns/assignments/${assignmentId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ progressPercent: percent }),
        }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update progress");
      }
      const updated = await response.json();

      const detailRes = await apiRequest(`/campaigns/${campaignId}`);
      if (detailRes.ok) {
        const detail = await detailRes.json();
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaignId
              ? {
                  ...c,
                  progressPercent: detail.progressPercent,
                  totalTarget: detail.totalTarget,
                }
              : c
          )
        );
      }
    } catch (err) {
      setError(err.message || "Failed to update progress");
    }
  };

  const handleAddImage = async (campaignId, url) => {
    if (!url) return;
    try {
      const response = await apiRequest(`/campaigns/${campaignId}/images`, {
        method: "POST",
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add image");
      }
    } catch (err) {
      setError(err.message || "Failed to add image");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg px-8 py-6 max-w-md w-full text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-full bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalCampaignTarget = campaigns.reduce(
    (sum, c) => sum + Number(c.targetAmount || 0),
    0
  );
  const activeCampaigns = campaigns.filter(
    (c) => c.status === "ACTIVE"
  ).length;
  const totalAssignments = campaigns.reduce(
    (sum, c) => sum + Number(c.assignmentsCount || 0),
    0
  );
  const completedAssignments = campaigns.reduce(
    (sum, c) => sum + Number(c.completedAssignmentsCount || 0),
    0
  );
  const overallProgress =
    campaigns.length > 0
      ? Math.round(
          campaigns.reduce(
            (sum, c) => sum + Number(c.progressPercent || 0),
            0
          ) / campaigns.length
        )
      : 0;
  const completionRate =
    totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-purple-50/30" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-indigo-100/20 rounded-full blur-3xl animate-float-gentle" />
        <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-gradient-to-br from-indigo-100/25 to-purple-100/20 rounded-full blur-3xl animate-float-gentle-delayed" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-100/20 to-blue-100/15 rounded-full blur-3xl animate-float-gentle-slow" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg shadow-slate-200/50 p-6 md:p-8 mb-8 border border-white/60">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur opacity-30 animate-pulse-slow" />
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 13.5l7.5-7.5L17 12l4-4M3 20.25l7.5-7.5L17 19l4-4"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
                  Campaign Management
                </h1>
                <p className="text-slate-500 mt-1 text-sm flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Plan, assign and track campaign performance
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex gap-3">
                <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl text-xs font-medium flex flex-col justify-center">
                  <span className="opacity-70 text-[11px]">
                    Active campaigns
                  </span>
                  <span className="text-lg font-semibold">
                    {activeCampaigns}
                  </span>
                </div>
                <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl text-xs font-medium flex flex-col justify-center">
                  <span className="opacity-70 text-[11px]">
                    Total campaign target
                  </span>
                  <span className="text-lg font-semibold">
                    {`$${totalCampaignTarget.toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}`}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCreating(true)}
                className="group bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-2xl transition-all duration-300 font-medium flex items-center gap-2 text-sm shadow-lg shadow-slate-300/50 hover:shadow-xl hover:shadow-slate-400/50 hover:scale-105"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Campaign
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md p-4 border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 mb-1">
              Overall progress
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">
                {overallProgress}
              </span>
              <span className="text-xs text-slate-500">%</span>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md p-4 border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 mb-1">
              Assignments completed
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-slate-900">
                {completedAssignments}/{totalAssignments}
              </span>
              <span className="text-xs text-slate-500">
                ({completionRate}%)
              </span>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md p-4 border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 mb-1">
              Active vs total campaigns
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-slate-900">
                {activeCampaigns}/{campaigns.length}
              </span>
            </div>
          </div>
        </div>

        {creating && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg shadow-slate-200/50 p-6 md:p-8 mb-8 border border-white/60">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Create Campaign
            </h2>
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={handleCreateCampaign}
            >
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Campaign name
                </label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) =>
                    handleNewCampaignChange("name", e.target.value)
                  }
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Target amount (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newCampaign.targetAmount}
                  onChange={(e) =>
                    handleNewCampaignChange(
                      "targetAmount",
                      e.target.value
                    )
                  }
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Start date
                </label>
                <input
                  type="date"
                  value={newCampaign.startDate}
                  onChange={(e) =>
                    handleNewCampaignChange(
                      "startDate",
                      e.target.value
                    )
                  }
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  End date
                </label>
                <input
                  type="date"
                  value={newCampaign.endDate}
                  onChange={(e) =>
                    handleNewCampaignChange(
                      "endDate",
                      e.target.value
                    )
                  }
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Objective
                </label>
                <textarea
                  value={newCampaign.objective}
                  onChange={(e) =>
                    handleNewCampaignChange(
                      "objective",
                      e.target.value
                    )
                  }
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70"
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCampaign}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {savingCampaign ? "Creating..." : "Create campaign"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg shadow-slate-200/50 p-6 md:p-8 border border-white/60">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              Campaign overview
            </h2>
            <span className="text-xs text-slate-500">
              {campaigns.length} campaign
              {campaigns.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="space-y-4">
            {campaigns.map((campaign, index) => (
              <div
                key={campaign.id}
                className="border-l-2 border-slate-200 pl-6 transition-all duration-200 animate-fadeInUp"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div
                  className="bg-gradient-to-r from-slate-50/80 to-slate-100/60 backdrop-blur-md p-5 rounded-2xl hover:shadow-md hover:scale-[1.01] transition-all duration-200 border border-slate-100/70 cursor-pointer group relative overflow-hidden"
                  onClick={() => toggleCampaign(campaign.id)}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
                    <svg
                      viewBox="0 0 100 100"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="80"
                        cy="20"
                        r="30"
                        fill="currentColor"
                        className="text-slate-300"
                        opacity="0.1"
                      />
                      <circle
                        cx="90"
                        cy="10"
                        r="20"
                        fill="currentColor"
                        className="text-slate-400"
                        opacity="0.15"
                      />
                    </svg>
                  </div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="relative bg-slate-900 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-semibold shadow-md group-hover:scale-110 transition-transform duration-300">
                        <span>{index + 1}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm md:text-base font-bold text-slate-800">
                            {campaign.name}
                          </h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900/5 text-slate-700 border border-slate-200">
                            {campaign.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 max-w-xl">
                          {campaign.objective ||
                            campaign.description ||
                            "No objective added yet"}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-600">
                          <span>
                            Target:{" "}
                            <span className="font-semibold text-slate-800">
                              {`$${Number(
                                campaign.targetAmount || 0
                              ).toLocaleString("en-US", {
                                maximumFractionDigits: 0,
                              })}`}
                            </span>
                          </span>
                          <span>
                            Leads:{" "}
                            <span className="font-semibold text-slate-800">
                              {campaign.teamLeads.length}
                            </span>
                          </span>
                          <span>
                            Assignments:{" "}
                            <span className="font-semibold text-slate-800">
                              {campaign.assignmentsCount || 0}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end text-xs">
                        <span className="text-slate-500 mb-1">
                          Overall progress
                        </span>
                        <PieChart
                          percentage={Number(
                            campaign.progressPercent || 0
                          )}
                          size={52}
                        />
                      </div>
                      <svg
                        className={`w-5 h-5 text-slate-400 transition-all duration-300 group-hover:text-slate-600 ${
                          expandedCampaigns[campaign.id]
                            ? "transform rotate-180"
                            : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {expandedCampaigns[campaign.id] && (
                  <div className="mt-4 ml-4 space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/80 border border-slate-100 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-semibold text-slate-700">
                            Team leads
                          </h3>
                          <span className="text-[10px] text-slate-400">
                            {campaign.teamLeads.length} assigned
                          </span>
                        </div>
                        <div className="space-y-2 mb-3">
                          {campaign.teamLeads.length === 0 && (
                            <p className="text-xs text-slate-400">
                              No team leads assigned yet.
                            </p>
                          )}
                          {campaign.teamLeads.map((lead) => (
                            <div
                              key={lead.id}
                              className="flex items-center gap-2 text-xs text-slate-700"
                            >
                              <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-semibold">
                                {lead.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </div>
                              <span>{lead.name}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <select
                            className="flex-1 px-2 py-1.5 rounded-xl border border-slate-200 text-xs bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={selectedLead[campaign.id] || ""}
                            onChange={(e) =>
                              setSelectedLead((prev) => ({
                                ...prev,
                                [campaign.id]: e.target.value,
                              }))
                            }
                          >
                            <option value="">Select lead</option>
                            {teamLeads.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() =>
                              handleAddTeamLead(campaign.id)
                            }
                            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      <div className="bg-white/80 border border-slate-100 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-semibold text-slate-700">
                            Assign employees
                          </h3>
                          <span className="text-[10px] text-slate-400">
                            Create individual targets
                          </span>
                        </div>
                        <div className="space-y-2">
                          <select
                            className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={selectedEmployee[campaign.id] || ""}
                            onChange={(e) =>
                              setSelectedEmployee((prev) => ({
                                ...prev,
                                [campaign.id]: e.target.value,
                              }))
                            }
                          >
                            <option value="">Select employee</option>
                            {employees.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name}
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              placeholder="Target amount"
                              className="flex-1 px-2 py-1.5 rounded-xl border border-slate-200 text-xs bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={assignmentTargets[campaign.id] || ""}
                              onChange={(e) =>
                                setAssignmentTargets((prev) => ({
                                  ...prev,
                                  [campaign.id]: e.target.value,
                                }))
                              }
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleAddAssignment(campaign.id)
                              }
                              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                            >
                              Assign
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/80 border border-slate-100 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-semibold text-slate-700">
                            Campaign assets
                          </h3>
                          <span className="text-[10px] text-slate-400">
                            Visual materials and creatives
                          </span>
                        </div>
                        <div className="space-y-2">
                          <input
                            type="url"
                            placeholder="Paste image URL"
                            className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddImage(
                                  campaign.id,
                                  e.currentTarget.value
                                );
                                e.currentTarget.value = "";
                              }
                            }}
                          />
                          <p className="text-[10px] text-slate-400">
                            Press Enter to attach image URL to this
                            campaign. All creatives remain visible to
                            assigned leads and employees.
                          </p>
                        </div>
                      </div>
                    </div>

                    <CampaignAssignments
                      campaignId={campaign.id}
                      onUpdateProgress={handleUpdateProgress}
                      progressUpdates={progressUpdates}
                      setProgressUpdates={setProgressUpdates}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CampaignAssignments = ({
  campaignId,
  onUpdateProgress,
  progressUpdates,
  setProgressUpdates,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(`/campaigns/${campaignId}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load details");
        }
        const data = await res.json();
        if (isMounted) {
          setAssignments(data.assignments || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load details");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchAssignments();
    return () => {
      isMounted = false;
    };
  }, [campaignId]);

  if (loading) {
    return (
      <div className="bg-white/80 border border-slate-100 rounded-2xl p-4 text-xs text-slate-500">
        Loading assignments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/80 border border-red-100 rounded-2xl p-4 text-xs text-red-600">
        {error}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-white/80 border border-slate-100 rounded-2xl p-4 text-xs text-slate-500">
        No employees assigned yet. Use the Assign employees section
        above to distribute campaign targets.
      </div>
    );
  }

  return (
    <div className="bg-white/80 border border-slate-100 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-700">
          Assigned team members
        </h3>
        <span className="text-[10px] text-slate-400">
          Update progress to track completion
        </span>
      </div>
      <div className="space-y-2">
        {assignments.map((a) => (
          <div
            key={a.id}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border border-slate-100 rounded-xl px-3 py-2 bg-slate-50/60"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-semibold">
                {a.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-800">
                  {a.name}
                </div>
                <div className="text-[10px] text-slate-500">
                  {a.role} · Target{" "}
                  {`$${Number(a.targetAmount || 0).toLocaleString(
                    "en-US",
                    {
                      maximumFractionDigits: 0,
                    }
                  )}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 md:min-w-[260px]">
              <div className="flex-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>Progress</span>
                  <span className="font-semibold text-slate-700">
                    {a.progressPercent}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${a.progressPercent}%` }}
                  />
                </div>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="%"
                className="w-16 px-2 py-1 rounded-xl border border-slate-200 text-[10px] bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={
                  progressUpdates[a.id] !== undefined
                    ? progressUpdates[a.id]
                    : ""
                }
                onChange={(e) =>
                  setProgressUpdates((prev) => ({
                    ...prev,
                    [a.id]: e.target.value,
                  }))
                }
              />
              <button
                type="button"
                onClick={() =>
                  onUpdateProgress(a.id, campaignId)
                }
                className="px-3 py-1 rounded-xl bg-slate-900 text-white text-[10px] font-semibold hover:bg-slate-800"
              >
                Update
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignDashboard;
