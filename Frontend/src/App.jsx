import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import TeamPage from './components/TeamPage'
import TeamLeadPage from './components/TeamLeadPage'
import EmployeeDetails from './components/EmployeeDetails'
import TeamManagement from './components/TeamManagement'
import EditProfile from './components/EditProfile'
import AdminTeamManagement from './components/AdminTeamManagement'
import AdminTeamDetails from './components/AdminTeamDetails'
import AdminEmployeePlacements from './components/AdminEmployeePlacements'
import S1AdminDashboard from './components/S1AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
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
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
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
            <ProtectedRoute allowedRoles={['EMPLOYEE', 'SUPER_ADMIN', 'TEAM_LEAD']}>
              <EditProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
