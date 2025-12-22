"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Archive } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ArxivRecord {
  id: string
  modul_turi: string
  mijoz_nomi_yoki_tovar_turi: string
  raqami_yoki_miqdori: string | null
  mijoz_turi: string | null
  qanchaga_kelishildi: number
  qancha_berdi: number
  qancha_qoldi: number
  izoh: string | null
  sana: string
}

interface ArxivListProps {
  filters: {
    modulTuri: string
    mijozTuri: string
    dateFrom: string
    dateTo: string
  }
  refreshTrigger?: number
}

export function ArxivList({ filters, refreshTrigger }: ArxivListProps) {
  const [records, setRecords] = useState<ArxivRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecords() {
      const supabase = createClient()

      try {
        let query = supabase.from("arxiv").select("*")

        // Apply filters
        if (filters.modulTuri) {
          query = query.eq("modul_turi", filters.modulTuri)
        }
        if (filters.mijozTuri) {
          query = query.eq("mijoz_turi", filters.mijozTuri)
        }
        if (filters.dateFrom) {
          query = query.gte("sana", filters.dateFrom)
        }
        if (filters.dateTo) {
          query = query.lte("sana", filters.dateTo)
        }

        const { data, error } = await query.order("sana", { ascending: false })

        if (error) throw error

        setRecords(data || [])
      } catch (error) {
        console.error("Error fetching archive records:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [filters, refreshTrigger])

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Arxiv yozuvlari
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-muted/20 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getModuleBadgeColor = (modul: string) => {
    switch (modul) {
      case "Zakaz":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "Mebel":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "Kronka":
        return "bg-pink-500/10 text-pink-500 border-pink-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          Arxiv yozuvlari ({records.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {records.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {Object.values(filters).some((f) => f)
                ? "Filtr bo'yicha yozuvlar topilmadi"
                : "Arxivda hozircha yozuvlar yo'q"}
            </p>
          ) : (
            records.map((record) => (
              <div key={record.id} className="p-4 rounded-lg bg-muted/10 border border-border/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getModuleBadgeColor(record.modul_turi)}>{record.modul_turi}</Badge>
                      <h4 className="font-medium text-foreground">{record.mijoz_nomi_yoki_tovar_turi}</h4>
                      {record.raqami_yoki_miqdori && (
                        <Badge variant="outline" className="text-xs">
                          {record.raqami_yoki_miqdori}
                        </Badge>
                      )}
                      {record.mijoz_turi && (
                        <Badge variant={record.mijoz_turi === "Doimiy" ? "default" : "secondary"}>
                          {record.mijoz_turi}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Yakunlangan:{" "}
                      {new Date(record.sana).toLocaleDateString("uz-UZ", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                    To'langan
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Kelishilgan summa</p>
                    <p className="font-medium text-foreground">
                      {record.qanchaga_kelishildi.toLocaleString("uz-UZ")} so'm
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">To'langan</p>
                    <p className="font-medium text-green-600">{record.qancha_berdi.toLocaleString("uz-UZ")} so'm</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Qolgan</p>
                    <p className="font-medium text-gray-500">{record.qancha_qoldi.toLocaleString("uz-UZ")} so'm</p>
                  </div>
                </div>

                {record.izoh && <p className="text-sm text-muted-foreground">{record.izoh}</p>}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
