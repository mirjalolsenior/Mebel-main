"use client"

import { useState } from "react"
import { AdminLogin } from "./admin-login"
import { AdminPanel } from "./admin-panel"

export function AdminModule() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return <AdminPanel onLogout={handleLogout} />
}
