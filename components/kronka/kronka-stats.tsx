"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Ribbon, Users, DollarSign, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface KronkaStats {
  jamiMijozlar: number
  doimiyMijozlar: number
  jamiSumma: number
  jamiQarz: number
}

export function KronkaStats() {
  const [stats, setStats] = useState<KronkaStats>({
    jamiMijozlar: 0,
    doimiyMijozlar: 0,
    jamiSumma: 0,
    jamiQarz: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()

      try {
        const { data, error } = await supabase.from("kronka").select("mijoz_turi, qanchaga_kelishildi, qancha_qoldi")

        if (error) throw error

        const jamiSumma = data?.reduce((sum, item) => sum + (item.qanchaga_kelishildi || 0), 0) || 0
        const jamiQarz = data?.reduce((sum, item) => sum + (item.qancha_qoldi || 0), 0) || 0
        const doimiyMijozlar = data?.filter((item) => item.mijoz_turi === "Doimiy").length || 0

        setStats({
          jamiMijozlar: data?.length || 0,
          doimiyMijozlar,
          jamiSumma,
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
      <Card className="glass-card border-pink-500/20 bg-pink-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Jami mijozlar</CardTitle>
          <Ribbon className="h-4 w-4 text-pink-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.jamiMijozlar}</div>
          <p className="text-xs text-muted-foreground">Faol mijozlar</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-green-500/20 bg-green-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Doimiy mijozlar</CardTitle>
          <Users className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.doimiyMijozlar}</div>
          <p className="text-xs text-muted-foreground">VIP mijozlar</p>
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
