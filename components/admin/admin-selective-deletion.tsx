"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, Package, ShoppingCart, Hammer, Scissors, Archive, Database, Search, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

interface TableData {
  id: string
  [key: string]: any
}

interface TableConfig {
  id: string
  title: string
  table: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  displayFields: string[]
  searchFields: string[]
}

const tableConfigs: TableConfig[] = [
  {
    id: "tovarlar",
    title: "Tovarlar",
    table: "tovarlar",
    icon: <Package className="w-4 h-4" />,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    displayFields: ["nomi", "sana"],
    searchFields: ["nomi"],
  },
  {
    id: "ombor",
    title: "Ombor",
    table: "ombor",
    icon: <Database className="w-4 h-4" />,
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    displayFields: ["tovar_nomi", "oxirgi_yangilanish"],
    searchFields: ["tovar_nomi"],
  },
  {
    id: "zakazlar",
    title: "Zakazlar",
    table: "zakazlar",
    icon: <ShoppingCart className="w-4 h-4" />,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    displayFields: ["tovar_turi", "qanchaga_kelishildi", "sana"],
    searchFields: ["tovar_turi"],
  },
  {
    id: "mebel",
    title: "Mebel",
    table: "mebel",
    icon: <Hammer className="w-4 h-4" />,
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    displayFields: ["mijoz_nomi", "qanchaga_kelishildi", "sana"],
    searchFields: ["mijoz_nomi"],
  },
  {
    id: "kronka",
    title: "Kronka",
    table: "kronka",
    icon: <Scissors className="w-4 h-4" />,
    color: "text-pink-700",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    displayFields: ["mijoz_nomi", "qanchaga_kelishildi", "sana"],
    searchFields: ["mijoz_nomi"],
  },
  {
    id: "arxiv",
    title: "Arxiv",
    table: "arxiv",
    icon: <Archive className="w-4 h-4" />,
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    displayFields: ["tovar_nomi", "sana"],
    searchFields: ["tovar_nomi"],
  },
]

export function AdminSelectiveDeletion() {
  const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>({})
  const [tableData, setTableData] = useState<Record<string, TableData[]>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({})
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadTableData = async (config: TableConfig) => {
    setLoading((prev) => ({ ...prev, [config.id]: true }))

    try {
      const orderColumn = config.table === "ombor" ? "oxirgi_yangilanish" : "sana"
      const { data, error } = await supabase.from(config.table).select("*").order(orderColumn, { ascending: false })

      if (error) {
        console.error(`Error loading ${config.table}:`, error)
        toast.error(`${config.title} ma'lumotlarini yuklashda xatolik`)
        return
      }

      setTableData((prev) => ({ ...prev, [config.id]: data || [] }))
    } catch (error) {
      console.error(`Error loading ${config.table}:`, error)
      toast.error(`${config.title} ma'lumotlarini yuklashda xatolik`)
    } finally {
      setLoading((prev) => ({ ...prev, [config.id]: false }))
    }
  }

  useEffect(() => {
    tableConfigs.forEach((config) => {
      loadTableData(config)
    })
  }, [])

  const handleItemSelect = (tableId: string, itemId: string, checked: boolean) => {
    setSelectedItems((prev) => {
      const currentSelected = prev[tableId] || []
      if (checked) {
        return { ...prev, [tableId]: [...currentSelected, itemId] }
      } else {
        return { ...prev, [tableId]: currentSelected.filter((id) => id !== itemId) }
      }
    })
  }

  const handleSelectAll = (tableId: string, checked: boolean) => {
    const data = tableData[tableId] || []
    const filteredData = getFilteredData(tableId)

    if (checked) {
      setSelectedItems((prev) => ({
        ...prev,
        [tableId]: filteredData.map((item) => item.id),
      }))
    } else {
      setSelectedItems((prev) => ({ ...prev, [tableId]: [] }))
    }
  }

  const getFilteredData = (tableId: string) => {
    const data = tableData[tableId] || []
    const searchTerm = searchTerms[tableId]?.toLowerCase() || ""
    const config = tableConfigs.find((c) => c.id === tableId)

    if (!searchTerm || !config) return data

    return data.filter((item) =>
      config.searchFields.some((field) => item[field]?.toString().toLowerCase().includes(searchTerm)),
    )
  }

  const handleDeleteSelected = async () => {
    const totalSelected = Object.values(selectedItems).reduce((sum, items) => sum + items.length, 0)
    if (totalSelected === 0) {
      toast.error("Ochirish uchun elementlarni tanlang")
      return
    }

    setDeleteLoading(true)

    try {
      const deletePromises = Object.entries(selectedItems).map(async ([tableId, itemIds]) => {
        if (itemIds.length === 0) return { success: true, table: tableId }

        const config = tableConfigs.find((c) => c.id === tableId)
        if (!config) return { success: false, table: tableId }

        const { error } = await supabase.from(config.table).delete().in("id", itemIds)

        return { success: !error, table: tableId, error }
      })

      const results = await Promise.all(deletePromises)

      let successCount = 0
      let errorCount = 0

      results.forEach((result) => {
        if (result.success) {
          successCount++
        } else {
          errorCount++
          console.error(`Error deleting from ${result.table}:`, result.error)
        }
      })

      if (errorCount === 0) {
        toast.success(`${totalSelected} ta element muvaffaqiyatli ochirildi`)
      } else {
        toast.warning(`${successCount} ta jadvaldan elementlar ochirildi, ${errorCount} ta jadvalni ochirishda xatolik`)
      }

      setSelectedItems({})
      tableConfigs.forEach((config) => {
        loadTableData(config)
      })
    } catch (error) {
      console.error("Error deleting selected items:", error)
      toast.error("Tanlangan elementlarni ochirishda xatolik yuz berdi")
    } finally {
      setDeleteLoading(false)
    }
  }

  const formatDisplayValue = (item: TableData, field: string) => {
    const value = item[field]

    if ((field === "sana" || field === "oxirgi_yangilanish") && value) {
      return new Date(value).toLocaleDateString("uz-UZ", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    }

    if (typeof value === "number" && (field.includes("qancha") || field.includes("summa"))) {
      return `${value.toLocaleString("uz-UZ")} so'm`
    }

    return value?.toString() || "-"
  }

  const totalSelected = Object.values(selectedItems).reduce((sum, items) => sum + items.length, 0)

  return (
    <div className="space-y-6">
      {/* Header with delete button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tanlab ochirish</h3>
          <p className="text-sm text-muted-foreground">Har bir jadvaldan kerakli elementlarni tanlab oching</p>
        </div>

        {totalSelected > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                {totalSelected} ta elementni ochirish
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tanlangan elementlarni ochirish</AlertDialogTitle>
                <AlertDialogDescription>
                  Siz {totalSelected} ta elementni ochirishni xohlayapsiz. Bu amal qaytarilmaydi.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteSelected}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Ochirilmoqda...
                    </>
                  ) : (
                    "Ha, ochirish"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Tabs for each table */}
      <Tabs defaultValue={tableConfigs[0].id} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {tableConfigs.map((config) => (
            <TabsTrigger key={config.id} value={config.id} className="flex items-center gap-1">
              {config.icon}
              <span className="hidden sm:inline">{config.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tableConfigs.map((config) => (
          <TabsContent key={config.id} value={config.id}>
            <Card className={`${config.bgColor} ${config.borderColor} border`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={config.color}>{config.icon}</div>
                    <CardTitle className={`text-lg ${config.color}`}>{config.title} ma'lumotlari</CardTitle>
                  </div>
                  <Badge variant="outline" className={`${config.color} border-current`}>
                    {getFilteredData(config.id).length} ta element
                  </Badge>
                </div>
                <CardDescription>{config.title} jadvalidagi elementlarni tanlab oching</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={`${config.title} ichida qidirish...`}
                    value={searchTerms[config.id] || ""}
                    onChange={(e) =>
                      setSearchTerms((prev) => ({
                        ...prev,
                        [config.id]: e.target.value,
                      }))
                    }
                    className="flex-1"
                  />
                </div>

                {/* Select All */}
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
                  <Checkbox
                    checked={
                      getFilteredData(config.id).length > 0 &&
                      getFilteredData(config.id).every((item) => selectedItems[config.id]?.includes(item.id))
                    }
                    onCheckedChange={(checked) => handleSelectAll(config.id, checked as boolean)}
                  />
                  <span className="text-sm font-medium">
                    Barchasini tanlash ({getFilteredData(config.id).length} ta)
                  </span>
                </div>

                {/* Data List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {loading[config.id] ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="ml-2">Yuklanmoqda...</span>
                    </div>
                  ) : getFilteredData(config.id).length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">Ma'lumotlar topilmadi</p>
                  ) : (
                    getFilteredData(config.id).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-background/50 rounded border">
                        <Checkbox
                          checked={selectedItems[config.id]?.includes(item.id) || false}
                          onCheckedChange={(checked) => handleItemSelect(config.id, item.id, checked as boolean)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {config.displayFields.map((field) => (
                              <div key={field}>
                                <p className="text-xs text-muted-foreground capitalize">{field.replace(/_/g, " ")}</p>
                                <p className="text-sm font-medium truncate">{formatDisplayValue(item, field)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
