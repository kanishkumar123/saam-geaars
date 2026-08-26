import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import './index.css'
import './responsive.css'
import App from './App.jsx'
import AdminApp from './admin/AdminApp.jsx'
import SecretRoute from './features/tank-game/SecretRoute.tsx'
import { useKonami } from './features/tank-game/useKonami.ts'

// Konami-code listener lives at the router root (not inside SecretRoute)
// so the easter egg is reachable from anywhere in the site, not just once
// you're already on /secret.
function KonamiListener() {
  const navigate = useNavigate()
  useKonami(() => navigate('/secret'))
  return null
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <KonamiListener />
      <Routes>
        <Route path="/*" element={<App />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/secret" element={<SecretRoute />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
