"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import {
  Trash2,
  Database,
  Package,
  ShoppingCart,
  Hammer,
  Scissors,
  Archive,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

interface DeletionOption {
  id: string
  title: string
  description: string
  table: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}

const deletionOptions: DeletionOption[] = [
  {
    id: "tovarlar",
    title: "Tovarlar ma'lumotlari",
    description: "Barcha tovar ma'lumotlarini ochirish",
    table: "tovarlar",
    icon: <Package className="w-5 h-5" />,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "ombor",
    title: "Ombor ma'lumotlari",
    description: "Ombor hisobotlari va statistikalarini ochirish",
    table: "ombor",
    icon: <Database className="w-5 h-5" />,
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    id: "zakazlar",
    title: "Zakazlar ma'lumotlari",
    description: "Barcha zakaz ma'lumotlarini ochirish",
    table: "zakazlar",
    icon: <ShoppingCart className="w-5 h-5" />,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    id: "mebel",
    title: "Mebel ishlab chiqarish",
    description: "Mebel ishlab chiqarish ma'lumotlarini ochirish",
    table: "mebel",
    icon: <Hammer className="w-5 h-5" />,
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    id: "kronka",
    title: "Kronka ishlab chiqarish",
    description: "Kronka ishlab chiqarish ma'lumotlarini ochirish",
    table: "kronka",
    icon: <Scissors className="w-5 h-5" />,
    color: "text-pink-700",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
  {
    id: "arxiv",
    title: "Arxiv ma'lumotlari",
    description: "Barcha arxiv ma'lumotlarini ochirish",
    table: "arxiv",
    icon: <Archive className="w-5 h-5" />,
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
]

export function AdminDeletionPanel() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [allLoading, setAllLoading] = useState(false)

  const handleDeleteTable = async (option: DeletionOption) => {
    setLoadingStates((prev) => ({ ...prev, [option.id]: true }))

    try {
      const { error } = await supabase.from(option.table).delete().neq("id", "never-match") // This will delete all records

      if (error) {
        console.error(`Error deleting ${option.table}:`, error)
        toast.error(`Xatolik: ${option.title} ochirishda muammo yuz berdi`)
      } else {
        toast.success(`${option.title} muvaffaqiyatli ochirildi`)
      }
    } catch (error) {
      console.error(`Error deleting ${option.table}:`, error)
      toast.error(`Xatolik: ${option.title} ochirishda muammo yuz berdi`)
    } finally {
      setLoadingStates((prev) => ({ ...prev, [option.id]: false }))
    }
  }

  const handleDeleteAll = async () => {
    setAllLoading(true)

    try {
      const deletePromises = deletionOptions.map((option) =>
        supabase.from(option.table).delete().neq("id", "never-match"),
      )

      const results = await Promise.allSettled(deletePromises)

      let successCount = 0
      let errorCount = 0

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && !result.value.error) {
          successCount++
        } else {
          errorCount++
          console.error(
            `Error deleting ${deletionOptions[index].table}:`,
            result.status === "fulfilled" ? result.value.error : result.reason,
          )
        }
      })

      if (errorCount === 0) {
        toast.success("Barcha ma'lumotlar muvaffaqiyatli ochirildi")
      } else if (successCount > 0) {
        toast.warning(`${successCount} ta jadval ochirildi, ${errorCount} ta jadvalni ochirishda xatolik yuz berdi`)
      } else {
        toast.error("Barcha jadvallarni ochirishda xatolik yuz berdi")
      }
    } catch (error) {
      console.error("Error deleting all data:", error)
      toast.error("Barcha ma'lumotlarni ochirishda xatolik yuz berdi")
    } finally {
      setAllLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-red-800">Diqqat!</h4>
          <p className="text-sm text-red-700">Ochirilgan ma'lumotlarni qaytarib bo'lmaydi. Iltimos, ehtiyot bo'ling.</p>
        </div>
      </div>

      {/* Individual Deletion Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deletionOptions.map((option) => (
          <Card key={option.id} className={`${option.bgColor} ${option.borderColor} border`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={option.color}>{option.icon}</div>
                  <CardTitle className={`text-sm ${option.color}`}>{option.title}</CardTitle>
                </div>
                <Badge variant="outline" className={`${option.color} border-current`}>
                  Jadval
                </Badge>
              </div>
              <CardDescription className="text-xs">{option.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="w-full" disabled={loadingStates[option.id]}>
                    {loadingStates[option.id] ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Ochirilmoqda...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Ochirish
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <span>Tasdiqlash</span>
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Haqiqatan ham <strong>{option.title}</strong> ni ochirmoqchimisiz? Bu amal qaytarilmaydi va barcha
                      ma'lumotlar yo'qoladi.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteTable(option)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Ha, ochirish
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete All Option */}
      <Card className="border-red-300 bg-red-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <CardTitle className="text-red-800">Barcha ma'lumotlarni ochirish</CardTitle>
          </div>
          <CardDescription className="text-red-700">
            Tizimning barcha ma'lumotlarini bir vaqtda ochirish. Bu juda xavfli amal!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full bg-red-600 hover:bg-red-700" disabled={allLoading}>
                {allLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Barcha ma'lumotlar ochirilmoqda...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Barcha ma'lumotlarni ochirish
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                  <span>Jiddiy ogohlantirish!</span>
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p className="font-semibold text-red-800">Siz barcha tizim ma'lumotlarini ochirishni xohlayapsiz!</p>
                  <p>Bu quyidagi barcha ma'lumotlarni o'chiradi:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Tovarlar va ombor ma'lumotlari</li>
                    <li>Zakazlar tarixi</li>
                    <li>Mebel va kronka ishlab chiqarish ma'lumotlari</li>
                    <li>Arxiv ma'lumotlari</li>
                  </ul>
                  <p className="font-semibold text-red-800">Bu amal qaytarilmaydi!</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll} className="bg-red-600 hover:bg-red-700">
                  Ha, barcha ma'lumotlarni ochirish
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
