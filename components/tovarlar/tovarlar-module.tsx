"use client"

import { useState } from "react"
import { TovarlarStats } from "./tovarlar-stats"
import { TovarForm } from "./tovar-form"
import { TovarlarHistory } from "./tovarlar-history"
import { OmborBalance } from "./ombor-balance"
import { Button } from "@/components/ui/button"
import { BarChart3, Package } from "lucide-react"

export function TovarlarModule() {
  const [activeView, setActiveView] = useState<"tarix" | "ombor">("tarix")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <TovarlarStats />

      <TovarForm onSuccess={handleSuccess} />

      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={activeView === "tarix" ? "default" : "outline"}
          onClick={() => setActiveView("tarix")}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Tarix
        </Button>
        <Button
          variant={activeView === "ombor" ? "default" : "outline"}
          onClick={() => setActiveView("ombor")}
          className="flex items-center gap-2"
        >
          <Package className="h-4 w-4" />
          Ombor
        </Button>
      </div>

      {activeView === "tarix" ? (
        <TovarlarHistory refreshTrigger={refreshTrigger} />
      ) : (
        <OmborBalance refreshTrigger={refreshTrigger} />
      )}
    </div>
  )
}
