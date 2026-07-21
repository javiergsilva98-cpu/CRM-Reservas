import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { RestaurantPage } from './pages/RestaurantPage'
import { ReservationPage } from './pages/ReservationPage'
import { LoginPage as SuperAdminLoginPage } from './pages/admin/LoginPage'
import { DashboardPage as SuperAdminDashboardPage } from './pages/admin/DashboardPage'
import { LoginPage as CrmLoginPage } from './pages/crm/LoginPage'
import { DashboardPage as CrmDashboardPage } from './pages/crm/DashboardPage'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/admin/login" element={<SuperAdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <SuperAdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path="/:slug/crm/login" element={<CrmLoginPage />} />
        <Route
          path="/:slug/crm"
          element={
            <ProtectedRoute>
              <CrmDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path="/:slug/reservar" element={<ReservationPage />} />
        <Route path="/:slug" element={<RestaurantPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
