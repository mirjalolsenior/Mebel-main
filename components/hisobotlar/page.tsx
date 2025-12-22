"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { BarChart3, TrendingUp, Users, DollarSign, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface ReportData {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  monthlyRevenue: { [key: string]: number }
  topCustomers: Array<{ name: string; total: number; orders: number }>
  moduleStats: { [key: string]: { count: number; revenue: number } }
}

export default function HisobotlarPage() {
  const [reportData, setReportData] = useState<ReportData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    monthlyRevenue: {},
    topCustomers: [],
    moduleStats: {},
  })
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const { toast } = useToast()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    generateReport()
  }, [selectedMonth, selectedYear])

  const generateReport = async () => {
    setLoading(true)
    try {
      // Fetch data from all modules
      const [zakazlar, mebel, kronka, arxiv] = await Promise.all([
        supabase.from("zakazlar").select("*"),
        supabase.from("mebel").select("*"),
        supabase.from("kronka").select("*"),
        supabase.from("arxiv").select("*"),
      ])

      const allData = [
        ...(zakazlar.data || []).map((item) => ({ ...item, module: "Zakaz" })),
        ...(mebel.data || []).map((item) => ({ ...item, module: "Mebel" })),
        ...(kronka.data || []).map((item) => ({ ...item, module: "Kronka" })),
        ...(arxiv.data || []).map((item) => ({ ...item, module: item.modul_turi })),
      ]

      // Calculate statistics
      const totalRevenue = allData.reduce((sum, item) => sum + (item.qancha_berdi || 0), 0)
      const totalOrders = allData.length
      const uniqueCustomers = new Set(
        allData.map((item) => item.mijoz_nomi || item.mijoz_nomi_yoki_tovar_turi || item.tovar_turi),
      ).size

      // Monthly revenue
      const monthlyRevenue: { [key: string]: number } = {}
      allData.forEach((item) => {
        const date = new Date(item.sana)
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (item.qancha_berdi || 0)
      })

      // Top customers
      const customerStats: { [key: string]: { total: number; orders: number } } = {}
      allData.forEach((item) => {
        const customerName = item.mijoz_nomi || item.mijoz_nomi_yoki_tovar_turi || item.tovar_turi
        if (!customerStats[customerName]) {
          customerStats[customerName] = { total: 0, orders: 0 }
        }
        customerStats[customerName].total += item.qancha_berdi || 0
        customerStats[customerName].orders += 1
      })

      const topCustomers = Object.entries(customerStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)

      // Module statistics
      const moduleStats: { [key: string]: { count: number; revenue: number } } = {}
      allData.forEach((item) => {
        const module = item.module
        if (!moduleStats[module]) {
          moduleStats[module] = { count: 0, revenue: 0 }
        }
        moduleStats[module].count += 1
        moduleStats[module].revenue += item.qancha_berdi || 0
      })

      setReportData({
        totalRevenue,
        totalOrders,
        totalCustomers: uniqueCustomers,
        monthlyRevenue,
        topCustomers,
        moduleStats,
      })
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Xatolik",
        description: "Hisobotni yaratishda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    const reportContent = `
Sherdor Mebel - Oylik Hisobot
${new Date().toLocaleDateString("uz-UZ")}

UMUMIY STATISTIKA:
- Jami daromad: ${formatCurrency(reportData.totalRevenue)}
- Jami buyurtmalar: ${reportData.totalOrders}
- Jami mijozlar: ${reportData.totalCustomers}

ENG YAXSHI MIJOZLAR:
${reportData.topCustomers
  .map(
    (customer, index) =>
      `${index + 1}. ${customer.name} - ${formatCurrency(customer.total)} (${customer.orders} buyurtma)`,
  )
  .join("\n")}

MODUL STATISTIKASI:
${Object.entries(reportData.moduleStats)
  .map(([module, stats]) => `${module}: ${stats.count} buyurtma - ${formatCurrency(stats.revenue)}`)
  .join("\n")}
    `.trim()

    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `hisobot_${selectedYear}_${selectedMonth}.txt`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Muvaffaqiyat",
      description: "Hisobot eksport qilindi",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm"
  }

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

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hisobotlar</h1>
          <p className="text-gray-600">Biznes statistikasi va tahlil</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-32">
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
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportReport} className="bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Eksport
          </Button>
        </div>
      </div>

      {/* Main Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(reportData.totalRevenue)}</p>
                <p className="text-sm text-gray-600">Jami daromad</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{reportData.totalOrders}</p>
                <p className="text-sm text-gray-600">Jami buyurtmalar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{reportData.totalCustomers}</p>
                <p className="text-sm text-gray-600">Jami mijozlar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(reportData.totalRevenue / reportData.totalOrders || 0)}
                </p>
                <p className="text-sm text-gray-600">O'rtacha buyurtma</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Modul statistikasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(reportData.moduleStats).map(([module, stats]) => (
              <div key={module} className="p-4 border rounded-lg">
                <h3 className="font-semibold text-lg">{module}</h3>
                <p className="text-sm text-gray-600">{stats.count} buyurtma</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(stats.revenue)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Eng yaxshi mijozlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportData.topCustomers.map((customer, index) => (
              <div key={customer.name} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.orders} buyurtma</p>
                  </div>
                </div>
                <p className="font-bold text-green-600">{formatCurrency(customer.total)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
