import { useState, useEffect } from "react";
import { apiRequest } from "../api/client";
import CalculationService from '../utils/calculationService';
import UserCreationModal from "./UserCreationModal";

const AdminUserManagement = ({ embedded = false, autoOpenCreate = false, onModalOpened }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [pagination, setPagination] = useState(null);
  const [polling, setPolling] = useState(true);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    if (autoOpenCreate && !showModal) {
      setEditingUser(null);
      setShowModal(true);
      if (onModalOpened) onModalOpened();
    }
  }, [autoOpenCreate, onModalOpened, showModal]);

  useEffect(() => {
    fetchTeams();
    let intervalId;
    fetchUsers(page);

    if (polling) {
      intervalId = setInterval(() => {
        fetchUsers(page, false);
      }, 15000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [page, polling]);

  const fetchTeams = async () => {
    try {
      const response = await apiRequest("/teams");
      if (response.ok) {
        const data = await response.json();
        setTeams(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    }
  };

  const fetchUsers = async (pageToLoad = 1, showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const params = new URLSearchParams({
        page: String(pageToLoad),
        pageSize: String(pageSize),
      });
      const response = await apiRequest(`/users?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.data || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    fetchUsers(page, false);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) return;
    try {
      const response = await apiRequest(`/users/${userId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete user");
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const toggleStatus = async (userId, currentStatus) => {
    try {
      await apiRequest(`/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchUsers(page, false);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className={embedded ? "p-4 text-center" : "p-8 text-center"}>
        Loading users...
      </div>
    );
  }

  return (
    <div className={embedded ? "" : "p-6 bg-slate-50 min-h-screen"}>
      <div className={embedded ? "" : "max-w-7xl mx-auto"}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl font-bold text-slate-800">
            Users
          </h2>
          <button
            onClick={() => {
              setEditingUser(null);
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            Add New User
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-600">Name</th>
                <th className="p-4 font-semibold text-slate-600">Email</th>
                <th className="p-4 font-semibold text-slate-600">Role</th>
                <th className="p-4 font-semibold text-slate-600">Team</th>
                <th className="p-4 font-semibold text-slate-600">Target</th>
                <th className="p-4 font-semibold text-slate-600">Status</th>
                <th className="p-4 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 text-slate-800 font-medium">
                    {user.name}
                  </td>
                  <td className="p-4 text-slate-600">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'TEAM_LEAD' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {user.role === 'SUPER_ADMIN' ? 'L1' : user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{user.team?.name || "-"}</td>
                  <td className="p-4 text-slate-600">
                    {user.yearlyTarget ? CalculationService.formatCurrency(user.yearlyTarget) : "-"}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 space-x-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
            <div>
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPage((prev) => Math.max(1, prev - 1))
                }
                className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                disabled={
                  pagination.page >= pagination.totalPages
                }
                onClick={() =>
                  setPage((prev) =>
                    pagination.totalPages
                      ? Math.min(pagination.totalPages, prev + 1)
                      : prev + 1
                  )
                }
                className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        <UserCreationModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          editingUser={editingUser}
          onSuccess={handleCreateSuccess}
          teams={teams}
        />
      </div>
    </div>
  );
};

export default AdminUserManagement;
