"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface HisobotlarListProps {
  viewType: "umumiy" | "detalli"
  refreshTrigger?: number
}

interface ReportItem {
  id: string
  module: string
  title: string
  count: number
  lastUpdated: string
  status: "active" | "completed" | "pending"
}

export function HisobotlarList({ viewType, refreshTrigger }: HisobotlarListProps) {
  const [reports, setReports] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReports() {
      const supabase = createClient()
      setLoading(true)

      try {
        // Generate summary reports from different modules
        const [tovarlarData, zakazlarData, mebelData, kronkaData] = await Promise.all([
          supabase
            .from("tovarlar")
            .select("*")
            .order("sana", { ascending: false })
            .limit(viewType === "umumiy" ? 5 : 50),
          supabase
            .from("zakazlar")
            .select("*")
            .order("sana", { ascending: false })
            .limit(viewType === "umumiy" ? 5 : 50),
          supabase
            .from("mebel")
            .select("*")
            .order("sana", { ascending: false })
            .limit(viewType === "umumiy" ? 5 : 50),
          supabase
            .from("kronka")
            .select("*")
            .order("sana", { ascending: false })
            .limit(viewType === "umumiy" ? 5 : 50),
        ])

        const reportItems: ReportItem[] = [
          {
            id: "tovarlar-report",
            module: "Tovarlar",
            title: "Tovarlar hisoboti",
            count: tovarlarData.data?.length || 0,
            lastUpdated: tovarlarData.data?.[0]?.sana || new Date().toISOString(),
            status: tovarlarData.data && tovarlarData.data.length > 0 ? "active" : "pending",
          },
          {
            id: "zakazlar-report",
            module: "Zakazlar",
            title: "Zakazlar hisoboti",
            count: zakazlarData.data?.length || 0,
            lastUpdated: zakazlarData.data?.[0]?.sana || new Date().toISOString(),
            status: zakazlarData.data && zakazlarData.data.length > 0 ? "active" : "pending",
          },
          {
            id: "mebel-report",
            module: "Mebel",
            title: "Mebel ishlab chiqarish hisoboti",
            count: mebelData.data?.length || 0,
            lastUpdated: mebelData.data?.[0]?.sana || new Date().toISOString(),
            status: mebelData.data && mebelData.data.length > 0 ? "active" : "pending",
          },
          {
            id: "kronka-report",
            module: "Kronka",
            title: "Lenta ishlab chiqarish hisoboti",
            count: kronkaData.data?.length || 0,
            lastUpdated: kronkaData.data?.[0]?.sana || new Date().toISOString(),
            status: kronkaData.data && kronkaData.data.length > 0 ? "active" : "pending",
          },
        ]

        setReports(reportItems)
      } catch (error) {
        console.error("Error fetching reports:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [viewType, refreshTrigger])

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {viewType === "umumiy" ? "Umumiy hisobotlar" : "Detalli hisobotlar"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
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
          <FileText className="h-5 w-5" />
          {viewType === "umumiy" ? "Umumiy hisobotlar" : "Detalli hisobotlar"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Hozircha hech qanday hisobot yo'q</p>
              <p className="text-sm text-muted-foreground mt-2">
                Ma'lumotlar kiritilgandan so'ng hisobotlar paydo bo'ladi
              </p>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/10 border border-border/50 hover:bg-muted/20 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-foreground">{report.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {report.module}
                    </Badge>
                    <Badge
                      variant={
                        report.status === "active" ? "default" : report.status === "completed" ? "secondary" : "outline"
                      }
                      className="text-xs"
                    >
                      {report.status === "active"
                        ? "Faol"
                        : report.status === "completed"
                          ? "Tugallangan"
                          : "Kutilmoqda"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(report.lastUpdated).toLocaleDateString("uz-UZ", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {report.count} ta yozuv
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
