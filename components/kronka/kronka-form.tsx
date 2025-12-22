"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface KronkaFormProps {
  onSuccess?: () => void
}

export function KronkaForm({ onSuccess }: KronkaFormProps) {
  const [formData, setFormData] = useState({
    mijoz_nomi: "",
    mijoz_turi: "",
    qancha_lenta_urildi: "",
    qanchaga_kelishildi: "",
    qancha_berdi: "",
    izoh: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.mijoz_nomi || !formData.mijoz_turi || !formData.qanchaga_kelishildi) {
      toast({
        title: "Xatolik",
        description: "Mijoz nomi, turi va kelishilgan summa majburiy",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("kronka").insert({
        mijoz_nomi: formData.mijoz_nomi,
        mijoz_turi: formData.mijoz_turi,
        qancha_lenta_urildi: formData.qancha_lenta_urildi || null,
        qanchaga_kelishildi: Number.parseFloat(formData.qanchaga_kelishildi),
        qancha_berdi: formData.qancha_berdi ? Number.parseFloat(formData.qancha_berdi) : 0,
        izoh: formData.izoh || null,
      })

      if (error) throw error

      toast({
        title: "Muvaffaqiyat",
        description: "Kronka buyurtmasi muvaffaqiyatli qo'shildi",
      })

      setFormData({
        mijoz_nomi: "",
        mijoz_turi: "",
        qancha_lenta_urildi: "",
        qanchaga_kelishildi: "",
        qancha_berdi: "",
        izoh: "",
      })

      onSuccess?.()
    } catch (error) {
      console.error("Error adding ribbon order:", error)
      toast({
        title: "Xatolik",
        description: "Kronka buyurtmasi qo'shishda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="glass-card mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Yangi kronka buyurtmasi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mijoz_nomi">Mijoz nomi *</Label>
            <Input
              id="mijoz_nomi"
              placeholder="Masalan: Dilshoda Nazarova"
              value={formData.mijoz_nomi}
              onChange={(e) => setFormData({ ...formData, mijoz_nomi: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mijoz_turi">Mijoz turi *</Label>
            <Select
              value={formData.mijoz_turi}
              onValueChange={(value) => setFormData({ ...formData, mijoz_turi: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Mijoz turini tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Oddiy">Oddiy</SelectItem>
                <SelectItem value="Doimiy">Doimiy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qancha_lenta_urildi">Qancha lenta urildi</Label>
            <Input
              id="qancha_lenta_urildi"
              placeholder="Masalan: 50 metr oq lenta"
              value={formData.qancha_lenta_urildi}
              onChange={(e) => setFormData({ ...formData, qancha_lenta_urildi: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qanchaga_kelishildi">Qanchaga kelishildi *</Label>
            <Input
              id="qanchaga_kelishildi"
              type="number"
              placeholder="Masalan: 150000"
              value={formData.qanchaga_kelishildi}
              onChange={(e) => setFormData({ ...formData, qanchaga_kelishildi: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qancha_berdi">Qancha berdi</Label>
            <Input
              id="qancha_berdi"
              type="number"
              placeholder="Masalan: 100000"
              value={formData.qancha_berdi}
              onChange={(e) => setFormData({ ...formData, qancha_berdi: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="izoh">Izoh</Label>
            <Textarea
              id="izoh"
              placeholder="Qo'shimcha ma'lumotlar..."
              value={formData.izoh}
              onChange={(e) => setFormData({ ...formData, izoh: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Qo'shilmoqda..." : "Buyurtma qo'shish"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
