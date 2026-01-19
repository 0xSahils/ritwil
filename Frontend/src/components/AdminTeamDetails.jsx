import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";

const AdminTeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("leads");
  
  // Modal states
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [addingType, setAddingType] = useState("member"); // 'lead' or 'member'

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

  const fetchAvailableUsers = async () => {
    try {
      const response = await apiRequest("/users?pageSize=1000"); // Fetch all users (optimize later)
      if (response.ok) {
        const data = await response.json();
        // Filter out users already in this team (optional, but good UX)
        // For now, just show all
        setAvailableUsers(data.data || []);
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
        : { userIds: [selectedUser] };

      const response = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to add user");

      setShowAddMemberModal(false);
      setSelectedUser("");
      fetchTeamDetails();
    } catch (err) {
      alert(err.message);
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

  if (loading) return <div className="p-8 text-center">Loading team details...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  if (!team) return <div className="p-8 text-center">Team not found</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
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
              <span>Total Target: <span className="font-semibold text-slate-900">₹{team.yearlyTarget.toLocaleString()}</span></span>
              <span>Total Revenue: <span className="font-semibold text-emerald-600">₹{team.totalRevenue.toLocaleString()}</span></span>
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
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  setAddingType(activeTab === "leads" ? "lead" : "member");
                  fetchAvailableUsers();
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

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-sm">
                    <th className="pb-3 font-medium pl-4">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Target (₹)</th>
                    <th className="pb-3 font-medium">Revenue (₹)</th>
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
                      <td className="py-4 text-emerald-600 font-medium">₹{user.revenue.toLocaleString()}</td>
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

      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Add {addingType === "lead" ? "Team Lead" : "Team Member"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select User</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select a user...</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) - {u.role}
                    </option>
                  ))}
                </select>
              </div>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeamDetails;
