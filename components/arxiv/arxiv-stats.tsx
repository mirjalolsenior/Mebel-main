"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Archive, CheckCircle, DollarSign, Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface ArxivStats {
  jamiYozuvlar: number
  zakazlar: number
  mebellar: number
  kronkalar: number
  jamiSumma: number
}

export function ArxivStats() {
  const [stats, setStats] = useState<ArxivStats>({
    jamiYozuvlar: 0,
    zakazlar: 0,
    mebellar: 0,
    kronkalar: 0,
    jamiSumma: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()

      try {
        const { data, error } = await supabase.from("arxiv").select("modul_turi, qanchaga_kelishildi")

        if (error) throw error

        const jamiSumma = data?.reduce((sum, item) => sum + (item.qanchaga_kelishildi || 0), 0) || 0
        const zakazlar = data?.filter((item) => item.modul_turi === "Zakaz").length || 0
        const mebellar = data?.filter((item) => item.modul_turi === "Mebel").length || 0
        const kronkalar = data?.filter((item) => item.modul_turi === "Kronka").length || 0

        setStats({
          jamiYozuvlar: data?.length || 0,
          zakazlar,
          mebellar,
          kronkalar,
          jamiSumma,
        })
      } catch (error) {
        console.error("Error fetching archive stats:", error)
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
          <CardTitle className="text-sm font-medium text-muted-foreground">Jami yozuvlar</CardTitle>
          <Archive className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.jamiYozuvlar}</div>
          <p className="text-xs text-muted-foreground">Yakunlangan ishlar</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-green-500/20 bg-green-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Zakazlar</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.zakazlar}</div>
          <p className="text-xs text-muted-foreground">
            Mebel: {stats.mebellar} | Kronka: {stats.kronkalar}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card border-purple-500/20 bg-purple-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Jami summa</CardTitle>
          <DollarSign className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.jamiSumma.toLocaleString("uz-UZ")} so'm</div>
          <p className="text-xs text-muted-foreground">Yakunlangan ishlar qiymati</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-orange-500/20 bg-orange-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Bu oy</CardTitle>
          <Calendar className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.jamiYozuvlar > 0 ? Math.ceil(stats.jamiYozuvlar / 12) : 0}
          </div>
          <p className="text-xs text-muted-foreground">O'rtacha oylik</p>
        </CardContent>
      </Card>
    </div>
  )
}
