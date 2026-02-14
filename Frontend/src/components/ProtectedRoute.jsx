import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "SUPER_ADMIN") {
      return <Navigate to="/team" replace />;
    }
    if (user.role === "S1_ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.role === "TEAM_LEAD") {
      return <Navigate to="/teamlead" replace />;
    }
    if (user.role === "EMPLOYEE") {
      const slug = (user.name ?? "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || user.id;
      return <Navigate to={`/employee/${slug}`} replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

