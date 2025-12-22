"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Lock, Eye, EyeOff } from "lucide-react"

interface PaymentPasswordDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PaymentPasswordDialog({ isOpen, onClose, onSuccess }: PaymentPasswordDialogProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (password === "942692222") {
      setPassword("")
      setError("")
      onSuccess()
    } else {
      setError("Noto'g'ri parol kiritildi")
    }

    setIsLoading(false)
  }

  const handleClose = () => {
    setPassword("")
    setError("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            To'lov qo'shish uchun parolni kiriting
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-password">Parol</Label>
            <div className="relative">
              <Input
                id="payment-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parolni kiriting"
                className="pr-10"
                required
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md animate-slideIn">{error}</div>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
              Bekor qilish
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Tekshirilmoqda..." : "Tasdiqlash"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
