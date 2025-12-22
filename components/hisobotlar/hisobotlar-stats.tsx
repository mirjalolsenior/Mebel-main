"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Hammer, Scissors, DollarSign, AlertCircle, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface HisobotlarStatsProps {
  refreshTrigger?: number
}

interface Stats {
  tovarlar: number
  zakazlar: number
  mebel: number
  kronka: number
  jamiPullar: number
  jamiZakazlar: number
  jamiQarzdorlik: number
}

export function HisobotlarStats({ refreshTrigger }: HisobotlarStatsProps) {
  const [stats, setStats] = useState<Stats>({
    tovarlar: 0,
    zakazlar: 0,
    mebel: 0,
    kronka: 0,
    jamiPullar: 0,
    jamiZakazlar: 0,
    jamiQarzdorlik: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()
      setLoading(true)

      try {
        // Get counts from each table
        const [tovarlarResult, zakazlarResult, mebelResult, kronkaResult, zakazlarData, arxivData] = await Promise.all([
          supabase.from("tovarlar").select("*", { count: "exact", head: true }),
          supabase.from("zakazlar").select("*", { count: "exact", head: true }),
          supabase.from("mebel").select("*", { count: "exact", head: true }),
          supabase.from("kronka").select("*", { count: "exact", head: true }),
          supabase.from("zakazlar").select("qanchaga_kelishildi, qancha_berdi, qancha_qoldi"),
          supabase.from("arxiv").select("qanchaga_kelishildi, qancha_berdi, qancha_qoldi"),
        ])

        let totalMoney = 0
        let totalOrders = 0
        let totalDebt = 0

        if (zakazlarData.data) {
          totalOrders = zakazlarData.data.length
          zakazlarData.data.forEach((zakaz) => {
            totalMoney += zakaz.qancha_berdi || 0
            totalDebt += zakaz.qancha_qoldi || 0
          })
        }

        if (arxivData.data) {
          totalOrders += arxivData.data.length
          arxivData.data.forEach((arxiv) => {
            totalMoney += arxiv.qancha_berdi || 0
            totalDebt += arxiv.qancha_qoldi || 0
          })
        }

        setStats({
          tovarlar: tovarlarResult.count || 0,
          zakazlar: zakazlarResult.count || 0,
          mebel: mebelResult.count || 0,
          kronka: kronkaResult.count || 0,
          jamiPullar: totalMoney,
          jamiZakazlar: totalOrders,
          jamiQarzdorlik: totalDebt,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [refreshTrigger])

  const statCards = [
    {
      title: "Jami pullar",
      value: `${stats.jamiPullar.toLocaleString("uz-UZ")} so'm`,
      icon: DollarSign,
      description: "Umumiy to'langan summa",
      variant: "success" as const,
    },
    {
      title: "Jami zakazlar",
      value: stats.jamiZakazlar,
      icon: CheckCircle,
      description: "Barcha zakazlar soni",
      variant: "default" as const,
    },
    {
      title: "Jami qarzdorlik",
      value: `${stats.jamiQarzdorlik.toLocaleString("uz-UZ")} so'm`,
      icon: AlertCircle,
      description: "Umumiy qarz miqdori",
      variant: "warning" as const,
    },
    {
      title: "Tovarlar",
      value: stats.tovarlar,
      icon: Package,
      description: "Jami tovarlar soni",
      variant: "default" as const,
    },
    {
      title: "Zakazlar",
      value: stats.zakazlar,
      icon: ShoppingCart,
      description: "Jami zakazlar soni",
      variant: "default" as const,
    },
    {
      title: "Mebel",
      value: stats.mebel,
      icon: Hammer,
      description: "Mebel ishlab chiqarish",
      variant: "default" as const,
    },
    {
      title: "Kronka",
      value: stats.kronka,
      icon: Scissors,
      description: "Lenta ishlab chiqarish",
      variant: "default" as const,
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Card key={i} className="glass-card animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted/20 rounded w-20"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted/20 rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted/20 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon
        const getCardColor = () => {
          switch (stat.variant) {
            case "success":
              return "border-green-500/20 bg-green-500/5"
            case "warning":
              return "border-orange-500/20 bg-orange-500/5"
            default:
              return ""
          }
        }

        const getTextColor = () => {
          switch (stat.variant) {
            case "success":
              return "text-green-600"
            case "warning":
              return "text-orange-600"
            default:
              return "text-foreground"
          }
        }

        return (
          <Card key={stat.title} className={`glass-card animate-slideIn ${getCardColor()}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getTextColor()}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
