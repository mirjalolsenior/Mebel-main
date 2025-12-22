"use client"

import { useState } from "react"
import { ZakazlarStats } from "./zakazlar-stats"
import { ZakazForm } from "./zakaz-form"
import { ZakazlarList } from "./zakazlar-list"

export function ZakazlarModule() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <ZakazlarStats />
      <ZakazForm onSuccess={handleSuccess} />
      <ZakazlarList refreshTrigger={refreshTrigger} />
    </div>
  )
}
