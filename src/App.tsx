import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PageFallback } from './components/PageFallback'

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })))
const RestaurantPage = lazy(() =>
  import('./pages/RestaurantPage').then((m) => ({ default: m.RestaurantPage })),
)
const ReservationPage = lazy(() =>
  import('./pages/ReservationPage').then((m) => ({ default: m.ReservationPage })),
)
const ManageReservationPage = lazy(() =>
  import('./pages/ManageReservationPage').then((m) => ({ default: m.ManageReservationPage })),
)
const AvisoLegalPage = lazy(() =>
  import('./pages/legal/AvisoLegalPage').then((m) => ({ default: m.AvisoLegalPage })),
)
const PrivacidadPage = lazy(() =>
  import('./pages/legal/PrivacidadPage').then((m) => ({ default: m.PrivacidadPage })),
)
const TerminosPage = lazy(() =>
  import('./pages/legal/TerminosPage').then((m) => ({ default: m.TerminosPage })),
)
const SuperAdminLoginPage = lazy(() =>
  import('./pages/admin/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const SuperAdminDashboardPage = lazy(() =>
  import('./pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const CrmLoginPage = lazy(() =>
  import('./pages/crm/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const CrmDashboardPage = lazy(() =>
  import('./pages/crm/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const NewReservationPage = lazy(() =>
  import('./pages/crm/NewReservationPage').then((m) => ({ default: m.NewReservationPage })),
)
const HoursPage = lazy(() => import('./pages/crm/HoursPage').then((m) => ({ default: m.HoursPage })))
const AvailabilityPage = lazy(() =>
  import('./pages/crm/AvailabilityPage').then((m) => ({ default: m.AvailabilityPage })),
)
const AnalyticsPage = lazy(() =>
  import('./pages/crm/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })),
)
const CustomersPage = lazy(() =>
  import('./pages/crm/CustomersPage').then((m) => ({ default: m.CustomersPage })),
)
const CustomerDetailPage = lazy(() =>
  import('./pages/crm/CustomerDetailPage').then((m) => ({ default: m.CustomerDetailPage })),
)
const SalaPage = lazy(() => import('./pages/crm/SalaPage').then((m) => ({ default: m.SalaPage })))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/legal/aviso-legal" element={<AvisoLegalPage />} />
          <Route path="/legal/privacidad" element={<PrivacidadPage />} />
          <Route path="/legal/terminos" element={<TerminosPage />} />

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
          <Route
            path="/:slug/crm/nueva-reserva"
            element={
              <ProtectedRoute>
                <NewReservationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:slug/crm/horarios"
            element={
              <ProtectedRoute>
                <HoursPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:slug/crm/disponibilidad"
            element={
              <ProtectedRoute>
                <AvailabilityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:slug/crm/analitica"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:slug/crm/clientes"
            element={
              <ProtectedRoute>
                <CustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:slug/crm/clientes/:customerId"
            element={
              <ProtectedRoute>
                <CustomerDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:slug/crm/sala"
            element={
              <ProtectedRoute>
                <SalaPage />
              </ProtectedRoute>
            }
          />

          <Route path="/:slug/reservar/gestionar" element={<ManageReservationPage />} />
          <Route path="/:slug/reservar" element={<ReservationPage />} />
          <Route path="/:slug" element={<RestaurantPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
