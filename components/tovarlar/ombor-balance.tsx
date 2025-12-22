"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Warehouse } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface OmborItem {
  id: string
  tovar_nomi: string
  raqami: string
  jami_keltirilgan: number
  jami_ishlatilgan: number
  qoldiq: number
  oxirgi_yangilanish: string
}

interface OmborBalanceProps {
  refreshTrigger?: number
}

export function OmborBalance({ refreshTrigger }: OmborBalanceProps) {
  const [items, setItems] = useState<OmborItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBalance() {
      const supabase = createClient()

      try {
        const { data, error } = await supabase
          .from("ombor")
          .select("*")
          .order("oxirgi_yangilanish", { ascending: false })

        if (error) throw error

        setItems(data || [])
      } catch (error) {
        console.error("Error fetching balance:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [refreshTrigger])

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            Ombor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted/20 rounded"></div>
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
          <Warehouse className="h-5 w-5" />
          Ombor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Omborda hozircha tovarlar yo'q</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="p-4 rounded-lg bg-muted/10 border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{item.tovar_nomi}</h4>
                    <Badge variant="outline" className="text-xs">
                      {item.raqami}
                    </Badge>
                  </div>
                  <Badge variant={item.qoldiq > 0 ? "default" : "secondary"}>Qoldiq: {item.qoldiq}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Jami keltirilgan</p>
                    <p className="font-medium text-green-600">{item.jami_keltirilgan}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Jami ishlatilgan</p>
                    <p className="font-medium text-red-600">{item.jami_ishlatilgan}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Oxirgi yangilanish:{" "}
                  {new Date(item.oxirgi_yangilanish).toLocaleDateString("uz-UZ", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
