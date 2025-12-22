"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Header } from "@/components/header"
import { TovarlarModule } from "@/components/tovarlar/tovarlar-module"
import { ZakazlarModule } from "@/components/zakazlar/zakazlar-module"
import { MebelModule } from "@/components/mebel/mebel-module"
import { KronkaModule } from "@/components/kronka/kronka-module"
import { ArxivModule } from "@/components/arxiv/arxiv-module"
import { AdminModule } from "@/components/admin/admin-module"
import { HisobotlarModule } from "@/components/hisobotlar/hisobotlar-module"
import { NotificationManager } from "@/components/pwa/notification-manager"
import { usePWA } from "@/components/pwa/pwa-provider"
import { useNotificationMonitor } from "@/lib/hooks/useNotificationMonitor"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("tovarlar")
  const { sendNotification, notificationPermission } = usePWA()

  useNotificationMonitor({
    checkInterval: 5 * 60 * 1000, // Check every 5 minutes
    lowStockThreshold: 10, // Alert when stock < 10
  })

  useEffect(() => {
    // Example: Send welcome notification when app loads
    if (notificationPermission === "granted") {
      setTimeout(() => {
        sendNotification(
          "Sherdor Mebel tizimiga xush kelibsiz!",
          "Biznes boshqaruv tizimi tayyor. Barcha modullar faol.",
        )
      }, 2000)
    }
  }, [notificationPermission, sendNotification])

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case "tovarlar":
        return "Tovarlar"
      case "zakazlar":
        return "Zakazlar"
      case "mebel":
        return "Mebel"
      case "kronka":
        return "Kronka"
      case "hisobotlar":
        return "Hisobotlar"
      case "arxiv":
        return "Arxiv"
      case "sozlamalar":
        return "Sozlamalar"
      case "admin":
        return "Admin"
      default:
        return "Tovarlar"
    }
  }

  const getPageSubtitle = (tab: string) => {
    switch (tab) {
      case "tovarlar":
        return "Mahsulotlar va ombor holati boshqaruvi"
      case "zakazlar":
        return "Buyurtmalar boshqaruvi"
      case "mebel":
        return "Mebel ishlab chiqarish"
      case "kronka":
        return "Lenta ishlab chiqarish"
      case "hisobotlar":
        return "Statistika va hisobotlar"
      case "arxiv":
        return "Yakunlangan ishlar arxivi"
      case "sozlamalar":
        return "Tizim sozlamalari"
      case "admin":
        return "Administrator paneli"
      default:
        return "Mahsulotlar va ombor holati boshqaruvi"
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "tovarlar":
        return <TovarlarModule />
      case "zakazlar":
        return <ZakazlarModule />
      case "mebel":
        return <MebelModule />
      case "kronka":
        return <KronkaModule />
      case "hisobotlar":
        return <HisobotlarModule />
      case "arxiv":
        return <ArxivModule />
      case "admin":
        return <AdminModule />
      case "sozlamalar":
        return <NotificationManager />
      default:
        return (
          <div className="glass-card rounded-2xl p-8 min-h-[600px] animate-fadeIn">
            <div className="flex items-center justify-center h-full">
              <div className="text-center animate-slideIn">
                <h3 className="text-2xl font-semibold text-foreground mb-4">{getPageTitle(activeTab)} moduli</h3>
                <p className="text-muted-foreground">{getPageSubtitle(activeTab)}</p>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen animate-fadeIn">
      <Header title={getPageTitle(activeTab)} subtitle={getPageSubtitle(activeTab)} />

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container mx-auto px-6 pb-6">{renderContent()}</main>
    </div>
  )
}
