"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Filter, Download } from "lucide-react"

interface ArxivFiltersProps {
  filters: {
    modulTuri: string
    mijozTuri: string
    dateFrom: string
    dateTo: string
  }
  onFiltersChange: (filters: any) => void
  onExport: () => void
  exportLoading: boolean
}

export function ArxivFilters({ filters, onFiltersChange, onExport, exportLoading }: ArxivFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      modulTuri: "",
      mijozTuri: "",
      dateFrom: "",
      dateTo: "",
    })
  }

  return (
    <Card className="glass-card mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtrlar va eksport
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="modul_turi">Modul turi</Label>
            <Select value={filters.modulTuri} onValueChange={(value) => handleFilterChange("modulTuri", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Barcha modullar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha modullar</SelectItem>
                <SelectItem value="Zakaz">Zakaz</SelectItem>
                <SelectItem value="Mebel">Mebel</SelectItem>
                <SelectItem value="Kronka">Kronka</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mijoz_turi">Mijoz turi</Label>
            <Select value={filters.mijozTuri} onValueChange={(value) => handleFilterChange("mijozTuri", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Barcha mijozlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha mijozlar</SelectItem>
                <SelectItem value="Oddiy">Oddiy</SelectItem>
                <SelectItem value="Doimiy">Doimiy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_from">Boshlanish sanasi</Label>
            <Input
              id="date_from"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_to">Tugash sanasi</Label>
            <Input
              id="date_to"
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={clearFilters}>
            Filtrlarni tozalash
          </Button>
          <Button onClick={onExport} disabled={exportLoading} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {exportLoading ? "Eksport qilinmoqda..." : "CSV eksport"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
