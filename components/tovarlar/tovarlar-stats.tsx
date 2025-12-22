"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingUp, TrendingDown } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface StatsData {
  jamiTovarlar: number
  jamiKeltirilgan: number
  jamiIshlatilgan: number
}

export function TovarlarStats() {
  const [stats, setStats] = useState<StatsData>({
    jamiTovarlar: 0,
    jamiKeltirilgan: 0,
    jamiIshlatilgan: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()

      try {
        // Get total unique products
        const { count: totalProducts } = await supabase.from("ombor").select("*", { count: "exact", head: true })

        // Get total brought in
        const { data: keltirilganData } = await supabase.from("ombor").select("jami_keltirilgan")

        // Get total used
        const { data: ishlatilganData } = await supabase.from("ombor").select("jami_ishlatilgan")

        const jamiKeltirilgan = keltirilganData?.reduce((sum, item) => sum + (item.jami_keltirilgan || 0), 0) || 0
        const jamiIshlatilgan = ishlatilganData?.reduce((sum, item) => sum + (item.jami_ishlatilgan || 0), 0) || 0

        setStats({
          jamiTovarlar: totalProducts || 0,
          jamiKeltirilgan,
          jamiIshlatilgan,
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="glass-card border-blue-500/20 bg-blue-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Jami tovarlar</CardTitle>
          <Package className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.jamiTovarlar}</div>
          <p className="text-xs text-muted-foreground">Turli xil tovarlar</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-green-500/20 bg-green-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Jami keltirilgan</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.jamiKeltirilgan}</div>
          <p className="text-xs text-muted-foreground">Dona tovar keltirilgan</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-red-500/20 bg-red-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Jami ishlatilgan</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.jamiIshlatilgan}</div>
          <p className="text-xs text-muted-foreground">Dona tovar ishlatilgan</p>
        </CardContent>
      </Card>
    </div>
  )
}
