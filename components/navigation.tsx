"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, Sofa, Ribbon, Archive, BarChart3, Settings, Shield, Menu, X } from "lucide-react"

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navigationItems = [
  { id: "tovarlar", label: "Tovarlar", icon: Package },
  { id: "zakazlar", label: "Zakazlar", icon: ShoppingCart },
  { id: "mebel", label: "Mebel", icon: Sofa },
  { id: "kronka", label: "Kronka", icon: Ribbon },
  { id: "hisobotlar", label: "Hisobotlar", icon: BarChart3 },
  { id: "arxiv", label: "Arxiv", icon: Archive },
  { id: "sozlamalar", label: "Sozlamalar", icon: Settings },
  { id: "admin", label: "Admin", icon: Shield },
]

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="glass-card"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-center p-6">
        <div className="glass-card rounded-2xl p-2">
          <div className="flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200",
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "hover:bg-accent/50 text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-4 top-16 bottom-4 w-64 glass-card rounded-2xl p-4">
            <div className="flex flex-col gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    onClick={() => {
                      onTabChange(item.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl justify-start transition-all duration-200",
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "hover:bg-accent/50 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
