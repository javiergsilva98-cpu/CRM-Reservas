import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/admin/LoginPage'
import { DashboardPage } from './pages/admin/DashboardPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
