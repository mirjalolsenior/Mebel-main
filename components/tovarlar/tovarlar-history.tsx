"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface TovarHistory {
  id: string
  tovar_nomi: string
  raqami: string
  amal_turi: string
  miqdor: number
  sana: string
}

interface TovarlarHistoryProps {
  refreshTrigger?: number
}

export function TovarlarHistory({ refreshTrigger }: TovarlarHistoryProps) {
  const [history, setHistory] = useState<TovarHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      const supabase = createClient()

      try {
        const { data, error } = await supabase
          .from("tovarlar")
          .select("*")
          .order("sana", { ascending: false })
          .limit(20)

        if (error) throw error

        setHistory(data || [])
      } catch (error) {
        console.error("Error fetching history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [refreshTrigger])

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Tarix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted/20 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Tarix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Hozircha hech qanday yozuv yo'q</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/10 border border-border/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground">{item.tovar_nomi}</h4>
                    <Badge variant="outline" className="text-xs">
                      {item.raqami}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(item.sana).toLocaleDateString("uz-UZ", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={item.amal_turi === "Olib keldi" ? "default" : "secondary"} className="mb-1">
                    {item.amal_turi}
                  </Badge>
                  <p className="text-sm font-medium text-foreground">{item.miqdor} dona</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
