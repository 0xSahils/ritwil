import { useState, useEffect, useMemo } from "react";
import { apiRequest } from "../api/client";
import CalculationService from '../utils/calculationService';
import UserCreationModal from "./UserCreationModal";
import { getRoleDisplayName, matchesRoleFilter, getDisplayNameFromFilterValue } from '../utils/roleHelpers';
import { getUsers } from '../api/users';
import { motion, AnimatePresence } from 'framer-motion';

const AdminUserManagement = ({ embedded = false, autoOpenCreate = false, onModalOpened }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [polling, setPolling] = useState(true);
  const [teams, setTeams] = useState([]);
  const [managers, setManagers] = useState([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    if (autoOpenCreate && !showModal) {
      setEditingUser(null);
      setShowModal(true);
      if (onModalOpened) onModalOpened();
    }
  }, [autoOpenCreate, onModalOpened, showModal]);

  useEffect(() => {
    fetchTeams();
    fetchManagers();
    let intervalId;
    fetchUsers();

    if (polling) {
      intervalId = setInterval(() => {
        fetchUsers(false);
      }, 15000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [polling]);

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

  const fetchManagers = async () => {
    try {
      const response = await getUsers({ role: 'SUPER_ADMIN', pageSize: 100 });
      if (response.data) {
        setManagers(response.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch managers:", err);
    }
  };

  const fetchUsers = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      // Fetch all users for client-side filtering
      const response = await getUsers({ page: 1, pageSize: 1000 });
      if (response.data) {
        setAllUsers(response.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    fetchUsers(false);
    setPage(1);
  };

  // Client-side filtering and sorting
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...allUsers];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.team?.name || '').toLowerCase().includes(q) ||
        (u.manager?.name || '').toLowerCase().includes(q)
      );
    }

    // Team filter
    if (teamFilter) {
      filtered = filtered.filter(u => u.team?.id === teamFilter);
    }

    // Role filter
    if (roleFilter) {
      filtered = filtered.filter(u => matchesRoleFilter(u, roleFilter));
    }

    // Status filter
    if (statusFilter) {
      if (statusFilter === 'active') {
        filtered = filtered.filter(u => u.isActive !== false);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(u => u.isActive === false);
      }
    }

    // Level filter
    if (levelFilter) {
      filtered = filtered.filter(u => {
        const userLevel = (u.level || '').toUpperCase();
        return userLevel === levelFilter.toUpperCase();
      });
    }

    // Manager filter
    if (managerFilter) {
      filtered = filtered.filter(u => u.manager?.id === managerFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = (a.name || '').toLowerCase();
          bVal = (b.name || '').toLowerCase();
          break;
        case 'email':
          aVal = (a.email || '').toLowerCase();
          bVal = (b.email || '').toLowerCase();
          break;
        case 'role':
          aVal = getRoleDisplayName(a.role, a.level).toLowerCase();
          bVal = getRoleDisplayName(b.role, b.level).toLowerCase();
          break;
        case 'team':
          aVal = (a.team?.name || '').toLowerCase();
          bVal = (b.team?.name || '').toLowerCase();
          break;
        case 'status':
          aVal = a.isActive ? 1 : 0;
          bVal = b.isActive ? 1 : 0;
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allUsers, searchQuery, teamFilter, roleFilter, statusFilter, levelFilter, managerFilter, sortBy, sortDir]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / pageSize);
  const paginatedUsers = filteredAndSortedUsers.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) return;
    try {
      const response = await apiRequest(`/users/${userId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete user");
      fetchUsers(false);
      // Remove from local state immediately
      setAllUsers(prev => prev.filter(u => u.id !== userId));
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
      fetchUsers(false);
      // Update local state immediately
      setAllUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isActive: !currentStatus } : u
      ));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading && allUsers.length === 0) {
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

        {/* Advanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4"
        >
          {/* Basic Filters */}
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Search</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by name, email, team, or manager..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Role</label>
                <select 
                  value={roleFilter} 
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-sm"
                >
                  <option value="">All Roles</option>
                  <option value="TEAM_LEAD">Team Lead</option>
                  <option value="EMPLOYEE_L3">Senior Recruiter</option>
                  <option value="EMPLOYEE_L4">Recruiter</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Team</label>
                <select 
                  value={teamFilter} 
                  onChange={(e) => {
                    setTeamFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-sm"
                >
                  <option value="">All Teams</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                <svg className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
              </button>
              {(searchQuery || teamFilter || roleFilter || statusFilter || levelFilter || managerFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setRoleFilter('');
                    setTeamFilter('');
                    setStatusFilter('');
                    setLevelFilter('');
                    setManagerFilter('');
                    setPage(1);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 font-medium underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-slate-200"
              >
                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Status</label>
                    <select 
                      value={statusFilter} 
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Level</label>
                    <select 
                      value={levelFilter} 
                      onChange={(e) => {
                        setLevelFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-sm"
                    >
                      <option value="">All Levels</option>
                      <option value="L2">L2 - Team Lead</option>
                      <option value="L3">L3 - Senior Recruiter</option>
                      <option value="L4">L4 - Recruiter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Manager</label>
                    <select 
                      value={managerFilter} 
                      onChange={(e) => {
                        setManagerFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-sm"
                    >
                      <option value="">All Managers</option>
                      {managers.map(manager => (
                        <option key={manager.id} value={manager.id}>{manager.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filters Display */}
          {(searchQuery || teamFilter || roleFilter || statusFilter || levelFilter || managerFilter) && (
            <div className="px-5 pb-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-slate-500">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery('')} className="hover:text-blue-900">×</button>
                </span>
              )}
              {roleFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-100 text-violet-700 rounded-lg text-xs font-medium">
                  Role: {getDisplayNameFromFilterValue(roleFilter)}
                  <button onClick={() => setRoleFilter('')} className="hover:text-violet-900">×</button>
                </span>
              )}
              {teamFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                  Team: {teams.find(t => t.id === teamFilter)?.name}
                  <button onClick={() => setTeamFilter('')} className="hover:text-emerald-900">×</button>
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                  Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  <button onClick={() => setStatusFilter('')} className="hover:text-green-900">×</button>
                </span>
              )}
              {levelFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                  Level: {levelFilter}
                  <button onClick={() => setLevelFilter('')} className="hover:text-amber-900">×</button>
                </span>
              )}
              {managerFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                  Manager: {managers.find(m => m.id === managerFilter)?.name}
                  <button onClick={() => setManagerFilter('')} className="hover:text-purple-900">×</button>
                </span>
              )}
            </div>
          )}
        </motion.div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-600">
                  <button
                    onClick={() => toggleSort('name')}
                    className="flex items-center gap-1.5 hover:text-slate-700 transition-colors"
                  >
                    Name
                    {sortBy === 'name' && (
                      <span className="text-blue-600">
                        {sortDir === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th className="p-4 font-semibold text-slate-600">
                  <button
                    onClick={() => toggleSort('email')}
                    className="flex items-center gap-1.5 hover:text-slate-700 transition-colors"
                  >
                    Email
                    {sortBy === 'email' && (
                      <span className="text-blue-600">
                        {sortDir === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th className="p-4 font-semibold text-slate-600">
                  <button
                    onClick={() => toggleSort('role')}
                    className="flex items-center gap-1.5 hover:text-slate-700 transition-colors"
                  >
                    Role
                    {sortBy === 'role' && (
                      <span className="text-blue-600">
                        {sortDir === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th className="p-4 font-semibold text-slate-600">
                  <button
                    onClick={() => toggleSort('team')}
                    className="flex items-center gap-1.5 hover:text-slate-700 transition-colors"
                  >
                    Team
                    {sortBy === 'team' && (
                      <span className="text-blue-600">
                        {sortDir === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th className="p-4 font-semibold text-slate-600">Target</th>
                <th className="p-4 font-semibold text-slate-600">
                  <button
                    onClick={() => toggleSort('status')}
                    className="flex items-center gap-1.5 hover:text-slate-700 transition-colors"
                  >
                    Status
                    {sortBy === 'status' && (
                      <span className="text-blue-600">
                        {sortDir === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th className="p-4 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    {loading ? 'Loading...' : 'No users found matching your filters'}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
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
                      user.role === 'TEAM_LEAD' || user.level === 'L2' ? 'bg-amber-100 text-amber-700' :
                      user.level === 'L3' ? 'bg-violet-100 text-violet-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {getRoleDisplayName(user.role, user.level)}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
            <div>
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} users
            </div>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
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
