"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface MonthlyChartsProps {
  monthlyData: any
}

export function MonthlyCharts({ monthlyData }: MonthlyChartsProps) {
  // Prepare data for orders per day chart
  const ordersPerDay: { [key: string]: number } = {}

  monthlyData.allData.forEach((item: any) => {
    const date = new Date(item.sana)
    const day = date.getDate()
    ordersPerDay[day] = (ordersPerDay[day] || 0) + 1
  })

  const dailyChartData = Object.entries(ordersPerDay)
    .map(([day, count]) => ({ day: `${day}-kun`, orders: count }))
    .sort((a, b) => Number.parseInt(a.day) - Number.parseInt(b.day))

  // Prepare data for paid vs unpaid pie chart
  const paidUnpaidData = [
    { name: "To'landi", value: monthlyData.paidOrders, color: "#22c55e" },
    { name: "To'lanmadi", value: monthlyData.unpaidOrders, color: "#f97316" },
  ]

  // Prepare data for revenue by module
  const moduleRevenue: { [key: string]: number } = {}
  monthlyData.allData.forEach((item: any) => {
    moduleRevenue[item.module] = (moduleRevenue[item.module] || 0) + (item.qancha_berdi || 0)
  })

  const moduleChartData = Object.entries(moduleRevenue).map(([module, revenue]) => ({
    name: module,
    revenue: revenue / 1000000,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Orders Per Day Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Kunlik zakazlar</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,200,200,0.2)" />
              <XAxis dataKey="day" stroke="rgba(200,200,200,0.5)" />
              <YAxis stroke="rgba(200,200,200,0.5)" />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(100,200,255,0.3)" }}
                labelStyle={{ color: "#fff" }}
              />
              <Bar dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Paid vs Unpaid Pie Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>To'lov holati</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paidUnpaidData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paidUnpaidData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} ta`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Module Revenue Chart */}
      <Card className="glass-card lg:col-span-2">
        <CardHeader>
          <CardTitle>Modullar bo'yicha daromad</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={moduleChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,200,200,0.2)" />
              <XAxis dataKey="name" stroke="rgba(200,200,200,0.5)" />
              <YAxis
                stroke="rgba(200,200,200,0.5)"
                label={{ value: "Milyonlab so'm", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(100,200,255,0.3)" }}
                labelStyle={{ color: "#fff" }}
                formatter={(value) => `${(value as number).toFixed(1)}M so'm`}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
