import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import TeamPage from './components/TeamPage'
import TeamLeadPage from './components/TeamLeadPage'
import EmployeeDetails from './components/EmployeeDetails'
import TeamManagement from './components/TeamManagement'
import EditProfile from './components/EditProfile'
import AdminTeamManagement from './components/AdminTeamManagement'
import AdminTeamDetails from './components/AdminTeamDetails'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
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
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <AdminTeamManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teams/:id"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <AdminTeamDetails />
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
            <ProtectedRoute allowedRoles={['EMPLOYEE', 'SUPER_ADMIN', 'TEAM_LEAD']}>
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
