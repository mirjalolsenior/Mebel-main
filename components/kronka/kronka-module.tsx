"use client"

import { useState } from "react"
import { KronkaStats } from "./kronka-stats"
import { KronkaForm } from "./kronka-form"
import { KronkaList } from "./kronka-list"

export function KronkaModule() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <KronkaStats />
      <KronkaForm onSuccess={handleSuccess} />
      <KronkaList refreshTrigger={refreshTrigger} />
    </div>
  )
}
