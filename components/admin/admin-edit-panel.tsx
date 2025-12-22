"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Package, ShoppingCart, Hammer, Scissors, Archive, Database, Search, Loader2, Edit2 } from "lucide-react"
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
  editFields: { name: string; label: string; type: string }[]
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
    editFields: [
      { name: "nomi", label: "Tovar nomi", type: "text" },
      { name: "sana", label: "Sana", type: "date" },
    ],
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
    editFields: [
      { name: "tovar_nomi", label: "Tovar nomi", type: "text" },
      { name: "oxirgi_yangilanish", label: "Oxirgi yangilanish", type: "datetime-local" },
    ],
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
    displayFields: ["tovar_turi", "qanchaga_kelishildi", "qancha_tolandi"],
    editFields: [
      { name: "tovar_turi", label: "Tovar turi", type: "text" },
      { name: "tel_raqami", label: "Telefon raqami", type: "text" },
      { name: "qanchaga_kelishildi", label: "Qanchaga kelishildi", type: "number" },
      { name: "qancha_tolandi", label: "Qancha to'landi", type: "number" },
      { name: "yetkazish_sanasi", label: "Yetkazish sanasi", type: "date" },
      { name: "izoh", label: "Izoh", type: "textarea" },
    ],
    searchFields: ["tovar_turi", "tel_raqami"],
  },
  {
    id: "mebel",
    title: "Mebel",
    table: "mebel",
    icon: <Hammer className="w-4 h-4" />,
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    displayFields: ["mijoz_nomi", "qanchaga_kelishildi", "qancha_tolandi"],
    editFields: [
      { name: "mijoz_nomi", label: "Mijoz nomi", type: "text" },
      { name: "tel_raqami", label: "Telefon raqami", type: "text" },
      { name: "qanchaga_kelishildi", label: "Qanchaga kelishildi", type: "number" },
      { name: "qancha_tolandi", label: "Qancha to'landi", type: "number" },
      { name: "yetkazish_sanasi", label: "Yetkazish sanasi", type: "date" },
      { name: "izoh", label: "Izoh", type: "textarea" },
    ],
    searchFields: ["mijoz_nomi", "tel_raqami"],
  },
  {
    id: "kronka",
    title: "Kronka",
    table: "kronka",
    icon: <Scissors className="w-4 h-4" />,
    color: "text-pink-700",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    displayFields: ["mijoz_nomi", "qanchaga_kelishildi", "qancha_tolandi"],
    editFields: [
      { name: "mijoz_nomi", label: "Mijoz nomi", type: "text" },
      { name: "tel_raqami", label: "Telefon raqami", type: "text" },
      { name: "qanchaga_kelishildi", label: "Qanchaga kelishildi", type: "number" },
      { name: "qancha_tolandi", label: "Qancha to'landi", type: "number" },
      { name: "yetkazish_sanasi", label: "Yetkazish sanasi", type: "date" },
      { name: "izoh", label: "Izoh", type: "textarea" },
    ],
    searchFields: ["mijoz_nomi", "tel_raqami"],
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
    editFields: [
      { name: "tovar_nomi", label: "Tovar nomi", type: "text" },
      { name: "sana", label: "Sana", type: "date" },
    ],
    searchFields: ["tovar_nomi"],
  },
]

export function AdminEditPanel() {
  const [tableData, setTableData] = useState<Record<string, TableData[]>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({})
  const [editingItem, setEditingItem] = useState<{ config: TableConfig; item: TableData } | null>(null)
  const [editFormData, setEditFormData] = useState<Record<string, any>>({})
  const [saveLoading, setSaveLoading] = useState(false)

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

  const getFilteredData = (tableId: string) => {
    const data = tableData[tableId] || []
    const searchTerm = searchTerms[tableId]?.toLowerCase() || ""
    const config = tableConfigs.find((c) => c.id === tableId)

    if (!searchTerm || !config) return data

    return data.filter((item) =>
      config.searchFields.some((field) => item[field]?.toString().toLowerCase().includes(searchTerm)),
    )
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

  const handleEdit = (config: TableConfig, item: TableData) => {
    setEditingItem({ config, item })

    // Initialize form data with current values
    const formData: Record<string, any> = {}
    config.editFields.forEach((field) => {
      let value = item[field.name]

      // Format date fields for input
      if (field.type === "date" && value) {
        value = value.split("T")[0]
      } else if (field.type === "datetime-local" && value) {
        value = new Date(value).toISOString().slice(0, 16)
      }

      formData[field.name] = value ?? ""
    })

    setEditFormData(formData)
  }

  const handleSave = async () => {
    if (!editingItem) return

    setSaveLoading(true)

    try {
      const updateData: Record<string, any> = {}

      // Prepare update data
      editingItem.config.editFields.forEach((field) => {
        let value = editFormData[field.name]

        // Convert number strings to actual numbers
        if (field.type === "number" && typeof value === "string") {
          value = Number.parseFloat(value) || 0
        }

        updateData[field.name] = value
      })

      const { error } = await supabase.from(editingItem.config.table).update(updateData).eq("id", editingItem.item.id)

      if (error) {
        console.error("Error updating item:", error)
        toast.error("Ma'lumotni yangilashda xatolik yuz berdi")
        return
      }

      toast.success("Ma'lumot muvaffaqiyatli yangilandi")
      setEditingItem(null)
      setEditFormData({})

      // Reload the table data
      loadTableData(editingItem.config)
    } catch (error) {
      console.error("Error updating item:", error)
      toast.error("Ma'lumotni yangilashda xatolik yuz berdi")
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Ma'lumotlarni tahrirlash</h3>
        <p className="text-sm text-muted-foreground">Jadvallardan kerakli ma'lumotlarni toping va tahrirlang</p>
      </div>

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
                <CardDescription>{config.title} jadvalidagi ma'lumotlarni tahrirlash</CardDescription>
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
                        <Button variant="outline" size="sm" onClick={() => handleEdit(config, item)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Tahrirlash
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ma'lumotni tahrirlash</DialogTitle>
            <DialogDescription>{editingItem?.config.title} jadvalidagi ma'lumotni o'zgartiring</DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4 py-4">
              {editingItem.config.editFields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.name}
                      value={editFormData[field.name] || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type}
                      value={editFormData[field.name] || ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)} disabled={saveLoading}>
              Bekor qilish
            </Button>
            <Button onClick={handleSave} disabled={saveLoading}>
              {saveLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                "Saqlash"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
