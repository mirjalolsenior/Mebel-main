"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, DollarSign, Clock, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface ZakazlarStats {
  jamiZakazlar: number
  jamiSumma: number
  jamiTolangan: number
  jamiQarz: number
}

export function ZakazlarStats() {
  const [stats, setStats] = useState<ZakazlarStats>({
    jamiZakazlar: 0,
    jamiSumma: 0,
    jamiTolangan: 0,
    jamiQarz: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()

      try {
        const { data, error } = await supabase
          .from("zakazlar")
          .select("qanchaga_kelishildi, qancha_berdi, qancha_qoldi")

        if (error) throw error

        const jamiSumma = data?.reduce((sum, item) => sum + (item.qanchaga_kelishildi || 0), 0) || 0
        const jamiTolangan = data?.reduce((sum, item) => sum + (item.qancha_berdi || 0), 0) || 0
        const jamiQarz = data?.reduce((sum, item) => sum + (item.qancha_qoldi || 0), 0) || 0

        setStats({
          jamiZakazlar: data?.length || 0,
          jamiSumma,
          jamiTolangan,
          jamiQarz,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass-card animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted/20 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="glass-card border-blue-500/20 bg-blue-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Jami zakazlar</CardTitle>
          <ShoppingCart className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.jamiZakazlar}</div>
          <p className="text-xs text-muted-foreground">Faol zakazlar</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-purple-500/20 bg-purple-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Jami summa</CardTitle>
          <DollarSign className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.jamiSumma.toLocaleString("uz-UZ")} so'm</div>
          <p className="text-xs text-muted-foreground">Umumiy qiymat</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-green-500/20 bg-green-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">To'langan</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.jamiTolangan.toLocaleString("uz-UZ")} so'm</div>
          <p className="text-xs text-muted-foreground">Jami to'lovlar</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-red-500/20 bg-red-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Qarz</CardTitle>
          <Clock className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.jamiQarz.toLocaleString("uz-UZ")} so'm</div>
          <p className="text-xs text-muted-foreground">Qolgan to'lovlar</p>
        </CardContent>
      </Card>
    </div>
  )
}
