import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

// Lazy load components
const LoginForm = lazy(() => import('./components/LoginForm'))
const TeamPage = lazy(() => import('./components/TeamPage'))
const TeamLeadPage = lazy(() => import('./components/TeamLeadPage'))
const EmployeeDetails = lazy(() => import('./components/EmployeeDetails'))
const TeamManagement = lazy(() => import('./components/TeamManagement'))
const EditProfile = lazy(() => import('./components/EditProfile'))
const AdminTeamManagement = lazy(() => import('./components/AdminTeamManagement'))
const AdminTeamDetails = lazy(() => import('./components/AdminTeamDetails'))
const AdminEmployeePlacements = lazy(() => import('./components/AdminEmployeePlacements'))
const S1AdminDashboard = lazy(() => import('./components/S1AdminDashboard'))
const AdminAuditLogs = lazy(() => import('./components/AdminAuditLogs'))

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['S1_ADMIN']}>
                <S1AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['S1_ADMIN', 'SUPER_ADMIN']}>
                <AdminAuditLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <TeamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teams"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'S1_ADMIN']}>
                <AdminTeamManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teams/:id"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'S1_ADMIN']}>
                <AdminTeamDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employee/:id/placements"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'S1_ADMIN']}>
                <AdminEmployeePlacements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teamlead"
            element={
              <ProtectedRoute allowedRoles={['TEAM_LEAD']}>
                <TeamLeadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team-management"
            element={
              <ProtectedRoute allowedRoles={['TEAM_LEAD']}>
                <TeamManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/:id"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'SUPER_ADMIN', 'TEAM_LEAD', 'S1_ADMIN']}>
                <EmployeeDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'TEAM_LEAD']}>
                <EditProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
