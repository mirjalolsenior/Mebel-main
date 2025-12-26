"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Package, DollarSign, AlertCircle, TrendingUp, Percent } from "lucide-react"

interface MonthlySummaryCardsProps {
  monthlyData: any
}

export function MonthlySummaryCards({ monthlyData }: MonthlySummaryCardsProps) {
  const revenueChange = monthlyData.prevRevenue
    ? ((monthlyData.totalRevenue - monthlyData.prevRevenue) / monthlyData.prevRevenue) * 100
    : 0

  const paymentRate = monthlyData.totalOrders ? (monthlyData.paidOrders / monthlyData.totalOrders) * 100 : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Orders */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Jami zakazlar</CardTitle>
          <ShoppingCart className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">{monthlyData.totalOrders}</div>
          <p className="text-xs text-muted-foreground mt-2">O'sha oyda yaratilgan</p>
        </CardContent>
      </Card>

      {/* Products Used */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Ishlatilgan tovarlar</CardTitle>
          <Package className="h-5 w-5 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-600">{monthlyData.totalProductsUsed}</div>
          <p className="text-xs text-muted-foreground mt-2">Jami miqdor</p>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Jami tushum</CardTitle>
          <DollarSign className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {(monthlyData.totalRevenue / 1000000).toFixed(1)}M so'm
          </div>
          <div
            className={`text-xs mt-2 flex items-center gap-1 ${revenueChange >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            <TrendingUp className="h-3 w-3" />
            {revenueChange >= 0 ? "+" : ""}
            {revenueChange.toFixed(1)}% o'zgarish
          </div>
        </CardContent>
      </Card>

      {/* Total Debt */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Jami qarzdorlik</CardTitle>
          <AlertCircle className="h-5 w-5 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{(monthlyData.totalDebt / 1000000).toFixed(1)}M so'm</div>
          <p className="text-xs text-muted-foreground mt-2">To'lanishi kerak</p>
        </CardContent>
      </Card>

      {/* Payment Rate */}
      <Card className="glass-card col-span-1 md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">To'lov to'plash darajasi</CardTitle>
          <Percent className="h-5 w-5 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-indigo-600">{paymentRate.toFixed(1)}%</div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex-1">
              <div className="text-xs text-green-600 font-medium mb-1">To'landilar</div>
              <div className="text-sm font-bold">
                {monthlyData.paidOrders} / {monthlyData.totalOrders}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-orange-600 font-medium mb-1">To'lanmadi</div>
              <div className="text-sm font-bold">
                {monthlyData.unpaidOrders} / {monthlyData.totalOrders}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Order Value */}
      <Card className="glass-card col-span-1 md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">O'rtacha zakaz qiymati</CardTitle>
          <TrendingUp className="h-5 w-5 text-cyan-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-cyan-600">
            {monthlyData.totalOrders > 0 ? (monthlyData.totalRevenue / monthlyData.totalOrders / 1000).toFixed(1) : 0}K
            so'm
          </div>
          <p className="text-xs text-muted-foreground mt-2">Zakozalariga nisbatan o'rtacha</p>
        </CardContent>
      </Card>
    </div>
  )
}
