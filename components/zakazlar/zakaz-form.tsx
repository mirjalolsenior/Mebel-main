"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface ZakazFormProps {
  onSuccess?: () => void
}

export function ZakazForm({ onSuccess }: ZakazFormProps) {
  const [formData, setFormData] = useState({
    tovar_turi: "",
    raqami: "",
    qanchaga_kelishildi: "",
    qancha_berdi: "",
    qachon_berish_kerak: "",
    izoh: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.tovar_turi || !formData.qanchaga_kelishildi) {
      toast({
        title: "Xatolik",
        description: "Tovar turi va kelishilgan summa majburiy",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("zakazlar").insert({
        tovar_turi: formData.tovar_turi,
        raqami: formData.raqami || null,
        qanchaga_kelishildi: Number.parseFloat(formData.qanchaga_kelishildi),
        qancha_berdi: formData.qancha_berdi ? Number.parseFloat(formData.qancha_berdi) : 0,
        qachon_berish_kerak: formData.qachon_berish_kerak || null,
        izoh: formData.izoh || null,
      })

      if (error) throw error

      toast({
        title: "Muvaffaqiyat",
        description: "Zakaz muvaffaqiyatli qo'shildi",
      })

      setFormData({
        tovar_turi: "",
        raqami: "",
        qanchaga_kelishildi: "",
        qancha_berdi: "",
        qachon_berish_kerak: "",
        izoh: "",
      })

      onSuccess?.()
    } catch (error) {
      console.error("Error adding order:", error)
      toast({
        title: "Xatolik",
        description: "Zakaz qo'shishda xatolik yuz berdi",
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
          Yangi zakaz
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tovar_turi">Tovar turi *</Label>
            <Input
              id="tovar_turi"
              placeholder="Masalan: Stol"
              value={formData.tovar_turi}
              onChange={(e) => setFormData({ ...formData, tovar_turi: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="raqami">Raqami</Label>
            <Input
              id="raqami"
              placeholder="Masalan: ST001"
              value={formData.raqami}
              onChange={(e) => setFormData({ ...formData, raqami: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qanchaga_kelishildi">Qanchaga kelishildi *</Label>
            <Input
              id="qanchaga_kelishildi"
              type="number"
              placeholder="Masalan: 500000"
              value={formData.qanchaga_kelishildi}
              onChange={(e) => setFormData({ ...formData, qanchaga_kelishildi: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qancha_berdi">Qancha berdi</Label>
            <Input
              id="qancha_berdi"
              type="number"
              placeholder="Masalan: 200000"
              value={formData.qancha_berdi}
              onChange={(e) => setFormData({ ...formData, qancha_berdi: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qachon_berish_kerak">Qachon berish kerak</Label>
            <Input
              id="qachon_berish_kerak"
              type="date"
              value={formData.qachon_berish_kerak}
              onChange={(e) => setFormData({ ...formData, qachon_berish_kerak: e.target.value })}
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
              {loading ? "Qo'shilmoqda..." : "Zakaz qo'shish"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
