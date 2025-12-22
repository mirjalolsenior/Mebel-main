"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ShoppingCart, Plus, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { PaymentPasswordDialog } from "@/components/payment-password-dialog"

interface Zakaz {
  id: string
  tovar_turi: string
  raqami: string | null
  qanchaga_kelishildi: number
  qancha_berdi: number
  qancha_qoldi: number
  qachon_berish_kerak: string | null
  izoh: string | null
  sana: string
}

interface ZakazlarListProps {
  refreshTrigger?: number
}

export function ZakazlarList({ refreshTrigger }: ZakazlarListProps) {
  const [zakazlar, setZakazlar] = useState<Zakaz[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedZakaz, setSelectedZakaz] = useState<Zakaz | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchZakazlar() {
      try {
        const { data, error } = await supabase.from("zakazlar").select("*").order("sana", { ascending: false })

        if (error) throw error

        setZakazlar(data || [])
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchZakazlar()
  }, [refreshTrigger])

  const handlePayment = async () => {
    if (!selectedZakaz || !paymentAmount) return

    setPaymentLoading(true)

    try {
      const newTotal = selectedZakaz.qancha_berdi + Number.parseFloat(paymentAmount)

      const { error } = await supabase
        .from("zakazlar")
        .update({
          qancha_berdi: newTotal,
        })
        .eq("id", selectedZakaz.id)

      if (error) throw error

      toast({
        title: "Muvaffaqiyat",
        description: "To'lov muvaffaqiyatli qo'shildi",
      })

      // Refresh the list
      const { data } = await supabase.from("zakazlar").select("*").order("sana", { ascending: false })
      setZakazlar(data || [])

      setShowPaymentDialog(false)
      setSelectedZakaz(null)
      setPaymentAmount("")
    } catch (error) {
      console.error("Error adding payment:", error)
      toast({
        title: "Xatolik",
        description: "To'lov qo'shishda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleOpenPayment = (zakaz: Zakaz) => {
    setSelectedZakaz(zakaz)
    setShowPasswordDialog(true)
  }

  const handlePasswordSuccess = () => {
    setShowPasswordDialog(false)
    setShowPaymentDialog(true)
  }

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Zakazlar ro'yxati
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

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Zakazlar ro'yxati
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {zakazlar.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Hozircha zakazlar yo'q</p>
          ) : (
            zakazlar.map((zakaz) => (
              <div key={zakaz.id} className="p-4 rounded-lg bg-muted/10 border border-border/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{zakaz.tovar_turi}</h4>
                      {zakaz.raqami && (
                        <Badge variant="outline" className="text-xs">
                          {zakaz.raqami}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(zakaz.sana).toLocaleDateString("uz-UZ", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge variant={zakaz.qancha_qoldi === 0 ? "default" : "secondary"}>
                    {zakaz.qancha_qoldi === 0 ? "To'langan" : "Qarz bor"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Kelishilgan summa</p>
                    <p className="font-medium text-foreground">
                      {zakaz.qanchaga_kelishildi.toLocaleString("uz-UZ")} so'm
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">To'langan</p>
                    <p className="font-medium text-green-600">{zakaz.qancha_berdi.toLocaleString("uz-UZ")} so'm</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Qolgan</p>
                    <p className="font-medium text-red-600">{zakaz.qancha_qoldi.toLocaleString("uz-UZ")} so'm</p>
                  </div>
                </div>

                {zakaz.qachon_berish_kerak && (
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Berish muddati:{" "}
                      {new Date(zakaz.qachon_berish_kerak).toLocaleDateString("uz-UZ", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}

                {zakaz.izoh && <p className="text-sm text-muted-foreground mb-3">{zakaz.izoh}</p>}

                {zakaz.qancha_qoldi > 0 && (
                  <Button size="sm" onClick={() => handleOpenPayment(zakaz)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    To'lov qo'shish
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>

      <PaymentPasswordDialog
        isOpen={showPasswordDialog}
        onClose={() => {
          setShowPasswordDialog(false)
          setSelectedZakaz(null)
        }}
        onSuccess={handlePasswordSuccess}
      />

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>To'lov qo'shish</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Zakaz: {selectedZakaz?.tovar_turi}</p>
              <p className="text-sm text-muted-foreground">
                Qolgan summa: {selectedZakaz?.qancha_qoldi.toLocaleString("uz-UZ")} so'm
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment">To'lov miqdori</Label>
              <Input
                id="payment"
                type="number"
                placeholder="Masalan: 100000"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <Button onClick={handlePayment} disabled={paymentLoading} className="w-full">
              {paymentLoading ? "Qo'shilmoqda..." : "To'lov qo'shish"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
