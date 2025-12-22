"use client"

import { useState } from "react"
import { ArxivStats } from "./arxiv-stats"
import { ArxivFilters } from "./arxiv-filters"
import { ArxivList } from "./arxiv-list"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function ArxivModule() {
  const [filters, setFilters] = useState({
    modulTuri: "",
    mijozTuri: "",
    dateFrom: "",
    dateTo: "",
  })
  const [exportLoading, setExportLoading] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    setExportLoading(true)
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

      // Convert to CSV
      const headers = [
        "ID",
        "Modul turi",
        "Mijoz/Tovar",
        "Raqam/Miqdor",
        "Mijoz turi",
        "Kelishilgan summa",
        "To'langan summa",
        "Qolgan summa",
        "Izoh",
        "Sana",
      ]

      const csvContent = [
        headers.join(","),
        ...(data || []).map((record) =>
          [
            record.id,
            record.modul_turi,
            `"${record.mijoz_nomi_yoki_tovar_turi}"`,
            record.raqami_yoki_miqdori || "",
            record.mijoz_turi || "",
            record.qanchaga_kelishildi,
            record.qancha_berdi,
            record.qancha_qoldi,
            `"${record.izoh || ""}"`,
            new Date(record.sana).toLocaleDateString("uz-UZ"),
          ].join(","),
        ),
      ].join("\n")

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `sherdor-mebel-arxiv-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Muvaffaqiyat",
        description: "Arxiv ma'lumotlari CSV formatda yuklab olindi",
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Xatolik",
        description: "Ma'lumotlarni eksport qilishda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <ArxivStats />
      <ArxivFilters
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
        exportLoading={exportLoading}
      />
      <ArxivList filters={filters} />
    </div>
  )
}
