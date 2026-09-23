import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Admin from './pages/Admin'

function App() {
  const [role, setRole] = useState(() => sessionStorage.getItem('role'))

  const handleLogin = (newRole) => {
    sessionStorage.setItem('role', newRole)
    setRole(newRole)
  }

  if (!role) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home role={role} />} />
        <Route
          path="/admin"
          element={role === 'you' ? <Admin /> : <Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App