"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Filter, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { uz } from "date-fns/locale"

interface HisobotlarFiltersProps {
  onFilterChange: () => void
}

export function HisobotlarFilters({ onFilterChange }: HisobotlarFiltersProps) {
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [module, setModule] = useState<string>("all")
  const [status, setStatus] = useState<string>("all")

  const handleReset = () => {
    setDateFrom(undefined)
    setDateTo(undefined)
    setModule("all")
    setStatus("all")
    onFilterChange()
  }

  const handleApplyFilters = () => {
    onFilterChange()
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtrlar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Boshlanish sanasi</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP", { locale: uz }) : "Sanani tanlang"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tugash sanasi</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP", { locale: uz }) : "Sanani tanlang"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Modul</label>
            <Select value={module} onValueChange={setModule}>
              <SelectTrigger>
                <SelectValue placeholder="Modulni tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha modullar</SelectItem>
                <SelectItem value="tovarlar">Tovarlar</SelectItem>
                <SelectItem value="zakazlar">Zakazlar</SelectItem>
                <SelectItem value="mebel">Mebel</SelectItem>
                <SelectItem value="kronka">Kronka</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Holat</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Holatni tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha holatlar</SelectItem>
                <SelectItem value="active">Faol</SelectItem>
                <SelectItem value="completed">Tugallangan</SelectItem>
                <SelectItem value="pending">Kutilmoqda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Amallar</label>
            <div className="flex gap-2">
              <Button onClick={handleApplyFilters} className="flex-1">
                Qo'llash
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
