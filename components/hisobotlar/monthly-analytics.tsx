"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MonthlySummaryCards } from "./monthly-summary-cards"
import { MonthlyCharts } from "./monthly-charts"
import { createClient } from "@/lib/supabase/client"
import { BarChart3 } from "lucide-react"

export function MonthlyAnalytics() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState<any>(null)

  const months = [
    "Yanvar",
    "Fevral",
    "Mart",
    "Aprel",
    "May",
    "Iyun",
    "Iyul",
    "Avgust",
    "Sentabr",
    "Oktabr",
    "Noyabr",
    "Dekabr",
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  useEffect(() => {
    fetchMonthlyData()
  }, [selectedMonth, selectedYear])

  const fetchMonthlyData = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const startDate = new Date(selectedYear, selectedMonth, 1)
      const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59)

      // Fetch data from all modules
      const [zakazlarRes, mebelRes, kronkaRes, arxivRes] = await Promise.all([
        supabase.from("zakazlar").select("*").gte("sana", startDate.toISOString()).lte("sana", endDate.toISOString()),
        supabase.from("mebel").select("*").gte("sana", startDate.toISOString()).lte("sana", endDate.toISOString()),
        supabase.from("kronka").select("*").gte("sana", startDate.toISOString()).lte("sana", endDate.toISOString()),
        supabase.from("arxiv").select("*").gte("sana", startDate.toISOString()).lte("sana", endDate.toISOString()),
      ])

      // Calculate metrics
      const allData = [
        ...(zakazlarRes.data || []).map((item) => ({ ...item, module: "Zakaz" })),
        ...(mebelRes.data || []).map((item) => ({ ...item, module: "Mebel" })),
        ...(kronkaRes.data || []).map((item) => ({ ...item, module: "Kronka" })),
        ...(arxivRes.data || []).map((item) => ({ ...item, module: item.modul_turi })),
      ]

      const totalOrders = allData.length
      const totalRevenue = allData.reduce((sum, item) => sum + (item.qancha_berdi || 0), 0)
      const totalDebt = allData.reduce((sum, item) => sum + (item.qancha_qoldi || 0), 0)
      const paidOrders = allData.filter((item) => (item.qancha_qoldi || 0) === 0).length
      const unpaidOrders = totalOrders - paidOrders

      // Get previous month data for comparison
      const prevStartDate = new Date(selectedYear, selectedMonth - 1, 1)
      const prevEndDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59)

      const [prevZakazlarRes, prevMebelRes, prevKronkaRes, prevArsivRes] = await Promise.all([
        supabase
          .from("zakazlar")
          .select("qancha_berdi")
          .gte("sana", prevStartDate.toISOString())
          .lte("sana", prevEndDate.toISOString()),
        supabase
          .from("mebel")
          .select("qancha_berdi")
          .gte("sana", prevStartDate.toISOString())
          .lte("sana", prevEndDate.toISOString()),
        supabase
          .from("kronka")
          .select("qancha_berdi")
          .gte("sana", prevStartDate.toISOString())
          .lte("sana", prevEndDate.toISOString()),
        supabase
          .from("arxiv")
          .select("qancha_berdi")
          .gte("sana", prevStartDate.toISOString())
          .lte("sana", prevEndDate.toISOString()),
      ])

      const prevRevenue =
        (prevZakazlarRes.data || []).reduce((sum, item) => sum + (item.qancha_berdi || 0), 0) +
        (prevMebelRes.data || []).reduce((sum, item) => sum + (item.qancha_berdi || 0), 0) +
        (prevKronkaRes.data || []).reduce((sum, item) => sum + (item.qancha_berdi || 0), 0) +
        (prevArsivRes.data || []).reduce((sum, item) => sum + (item.qancha_berdi || 0), 0)

      // Get product usage (tovarlar)
      const [tovarlarRes] = await Promise.all([
        supabase
          .from("tovarlar")
          .select("miqdor")
          .eq("amal_turi", "Ishlatildi")
          .gte("sana", startDate.toISOString())
          .lte("sana", endDate.toISOString()),
      ])

      const totalProductsUsed = (tovarlarRes.data || []).reduce((sum, item) => sum + (item.miqdor || 0), 0)

      setMonthlyData({
        totalOrders,
        totalRevenue,
        totalDebt,
        paidOrders,
        unpaidOrders,
        totalProductsUsed,
        prevRevenue,
        allData,
      })
    } catch (error) {
      console.error("Error fetching monthly data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted/20 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted/20 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Month Picker */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Oylik Tahlil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Oy</label>
              <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(Number(val))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Yil</label>
              <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(Number(val))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {monthlyData && (
        <>
          <MonthlySummaryCards monthlyData={monthlyData} />
          <MonthlyCharts monthlyData={monthlyData} />
        </>
      )}
    </div>
  )
}
