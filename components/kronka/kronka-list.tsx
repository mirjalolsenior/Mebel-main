"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Ribbon, Plus, User } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { PaymentPasswordDialog } from "@/components/payment-password-dialog"

interface KronkaOrder {
  id: string
  mijoz_nomi: string
  mijoz_turi: string
  qancha_lenta_urildi: string | null
  qanchaga_kelishildi: number
  qancha_berdi: number
  qancha_qoldi: number
  izoh: string | null
  sana: string
}

interface KronkaListProps {
  refreshTrigger?: number
}

export function KronkaList({ refreshTrigger }: KronkaListProps) {
  const [orders, setOrders] = useState<KronkaOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<KronkaOrder | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data, error } = await supabase.from("kronka").select("*").order("sana", { ascending: false })

        if (error) throw error

        setOrders(data || [])
      } catch (error) {
        console.error("Error fetching ribbon orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [refreshTrigger])

  const handlePayment = async () => {
    if (!selectedOrder || !paymentAmount) return

    setPaymentLoading(true)

    try {
      const newTotal = selectedOrder.qancha_berdi + Number.parseFloat(paymentAmount)

      const { error } = await supabase
        .from("kronka")
        .update({
          qancha_berdi: newTotal,
        })
        .eq("id", selectedOrder.id)

      if (error) throw error

      toast({
        title: "Muvaffaqiyat",
        description: "To'lov muvaffaqiyatli qo'shildi",
      })

      const { data } = await supabase.from("kronka").select("*").order("sana", { ascending: false })
      setOrders(data || [])

      setShowPaymentDialog(false)
      setSelectedOrder(null)
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

  const handleOpenPayment = (order: KronkaOrder) => {
    setSelectedOrder(order)
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
            <Ribbon className="h-5 w-5" />
            Kronka buyurtmalari
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-28 bg-muted/20 rounded"></div>
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
          <Ribbon className="h-5 w-5" />
          Kronka buyurtmalari
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Hozircha kronka buyurtmalari yo'q</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="p-4 rounded-lg bg-muted/10 border border-border/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium text-foreground">{order.mijoz_nomi}</h4>
                      <Badge variant={order.mijoz_turi === "Doimiy" ? "default" : "secondary"}>
                        {order.mijoz_turi}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.sana).toLocaleDateString("uz-UZ", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge variant={order.qancha_qoldi === 0 ? "default" : "secondary"}>
                    {order.qancha_qoldi === 0 ? "To'langan" : "Qarz bor"}
                  </Badge>
                </div>

                {order.qancha_lenta_urildi && (
                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground">Lenta:</p>
                    <p className="text-sm font-medium text-foreground">{order.qancha_lenta_urildi}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Kelishilgan summa</p>
                    <p className="font-medium text-foreground">
                      {order.qanchaga_kelishildi.toLocaleString("uz-UZ")} so'm
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">To'langan</p>
                    <p className="font-medium text-green-600">{order.qancha_berdi.toLocaleString("uz-UZ")} so'm</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Qolgan</p>
                    <p className="font-medium text-red-600">{order.qancha_qoldi.toLocaleString("uz-UZ")} so'm</p>
                  </div>
                </div>

                {order.izoh && <p className="text-sm text-muted-foreground mb-3">{order.izoh}</p>}

                {order.qancha_qoldi > 0 && (
                  <Button size="sm" onClick={() => handleOpenPayment(order)} className="flex items-center gap-2">
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
          setSelectedOrder(null)
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
              <p className="text-sm text-muted-foreground">Mijoz: {selectedOrder?.mijoz_nomi}</p>
              <p className="text-sm text-muted-foreground">
                Qolgan summa: {selectedOrder?.qancha_qoldi.toLocaleString("uz-UZ")} so'm
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment">To'lov miqdori</Label>
              <Input
                id="payment"
                type="number"
                placeholder="Masalan: 50000"
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
