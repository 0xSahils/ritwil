import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

/** CUID-like id (backend user id); slug is name-based. */
function looksLikeCuid(value) {
  return typeof value === "string" && value.length >= 24 && value.length <= 26 && /^c[a-z0-9]+$/i.test(value);
}

function toSlug(name) {
  return (name ?? "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const EditProfile = () => {
  const { id: idOrSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const userIdForApi = (() => {
    if (!user) return null;
    if (looksLikeCuid(idOrSlug)) return idOrSlug;
    if (toSlug(user.name) === idOrSlug) return user.id;
    return null;
  })();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user && !userIdForApi) {
      setError("You are not authorized to edit this profile");
      setLoading(false);
      return;
    }
    fetchUserData();
  }, [idOrSlug, user, userIdForApi]);

  const fetchUserData = async () => {
    try {
      // In a real app, you might have a dedicated /me endpoint or get specific user details
      // Here we'll simulate getting the data or reuse an existing endpoint if available
      // For now, we'll just use the ID to let them update name/email/password
      
      // Fetching user details often requires an admin endpoint or a "me" endpoint
      // Let's assume we can get basic info or just start with empty/placeholder if not easily fetchable without admin rights
      // However, to fill the form, we ideally want current values.
      // Since we don't have a direct "get single user" endpoint for employees in the code I saw earlier (mostly admin/dashboard routes),
      // we might need to rely on what's in the AuthContext or fetch from a new endpoint.
      // For this implementation, I'll assume we can't easily get the full details without adding a backend route,
      // so I'll focus on the UPDATE functionality.
      
      // Use auth user data if available
      if (user) {
        setFormData({
            name: user.name || "",
            email: user.email || "",
            password: "",
        });
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    try {
      // We need to use the admin-like endpoint but for self-update.
      // The backend route `PUT /users/:id` currently requires SUPER_ADMIN.
      // We should probably create a `PUT /users/profile` or allow `PUT /users/:id` for the user themselves.
      // Since I can't easily change backend RBAC in this file alone, I'll assume I need to update the backend too.
      // But for now, let's try hitting the endpoint.
      
      const payload = { ...formData };
      if (!payload.password) delete payload.password;

      // Note: This will likely fail with 403 Forbidden if the backend requires SUPER_ADMIN for PUT /users/:id
      // We will fix the backend in the next step.
      const response = await apiRequest(`/users/${userIdForApi}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      setTimeout(() => navigate(-1), 1500); // Go back after success
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Edit Profile</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              New Password <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
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
  );
};

export default EditProfile;
