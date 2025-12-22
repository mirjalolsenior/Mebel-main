"use client"

import { useState } from "react"
import { MebelStats } from "./mebel-stats"
import { MebelForm } from "./mebel-form"
import { MebelList } from "./mebel-list"

export function MebelModule() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <MebelStats />
      <MebelForm onSuccess={handleSuccess} />
      <MebelList refreshTrigger={refreshTrigger} />
    </div>
  )
}
