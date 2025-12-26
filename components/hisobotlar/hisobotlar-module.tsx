"use client"

import { useState } from "react"
import { HisobotlarStats } from "./hisobotlar-stats"
import { HisobotlarList } from "./hisobotlar-list"
import { HisobotlarFilters } from "./hisobotlar-filters"
import { Button } from "@/components/ui/button"
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
import { BarChart3, Trash2, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { MonthlyAnalytics } from "./monthly-analytics"

export function HisobotlarModule() {
  const [activeView, setActiveView] = useState<"oylik" | "umumiy">("oylik")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isClearing, setIsClearing] = useState(false)

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleClearReports = async () => {
    setIsClearing(true)
    const supabase = createClient()

    try {
      // Clear all historical data from different modules
      const tables = ["tovarlar", "zakazlar", "mebel", "kronka"]

      for (const table of tables) {
        const { error } = await supabase.from(table).delete().neq("id", "never-match") // This will delete all records

        if (error) {
          console.error(`Error clearing ${table}:`, error)
          throw error
        }
      }

      toast.success("Barcha hisobotlar muvaffaqiyatli tozalandi!")
      handleRefresh()
    } catch (error) {
      console.error("Error clearing reports:", error)
      toast.error("Hisobotlarni tozalashda xatolik yuz berdi")
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant={activeView === "oylik" ? "default" : "outline"}
          onClick={() => setActiveView("oylik")}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Oylik tahlil
        </Button>
        <Button
          variant={activeView === "umumiy" ? "default" : "outline"}
          onClick={() => setActiveView("umumiy")}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Umumiy hisobotlar
        </Button>
      </div>

      {activeView === "oylik" && <MonthlyAnalytics />}

      {/* Existing umumiy view code */}
      {activeView === "umumiy" && (
        <>
          <HisobotlarStats refreshTrigger={refreshTrigger} />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Hisobotlarni tozalash
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hisobotlarni tozalash</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu amal barcha hisobotlar va tarixiy ma'lumotlarni o'chirib tashlaydi. Bu amalni bekor qilib
                  bo'lmaydi. Davom etishni xohlaysizmi?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearReports}
                  disabled={isClearing}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isClearing ? "Tozalanmoqda..." : "Ha, tozalash"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <HisobotlarFilters onFilterChange={handleRefresh} />
          <HisobotlarList viewType="umumiy" refreshTrigger={refreshTrigger} />
        </>
      )}
    </div>
  )
}
