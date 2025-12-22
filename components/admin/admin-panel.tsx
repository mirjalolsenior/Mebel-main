"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LogOut, Database, Users, Package, FileText, Settings, AlertTriangle, CheckSquare, Edit2 } from "lucide-react"
import { AdminDeletionPanel } from "./admin-deletion-panel"
import { AdminSelectiveDeletion } from "./admin-selective-deletion"
import { AdminEditPanel } from "./admin-edit-panel"

interface AdminPanelProps {
  onLogout: () => void
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen p-6 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground">Tizim boshqaruvi va sozlamalari</p>
          </div>
          <Button onClick={onLogout} variant="outline" className="animate-float bg-transparent">
            <LogOut className="w-4 h-4 mr-2" />
            Chiqish
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card animate-slideIn">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Jami foydalanuvchilar</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <Users className="w-8 h-8 text-primary animate-pulse-gentle" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card animate-slideIn" style={{ animationDelay: "0.1s" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aktiv modullar</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <Package className="w-8 h-8 text-primary animate-pulse-gentle" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card animate-slideIn" style={{ animationDelay: "0.2s" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ma'lumotlar bazasi</p>
                  <p className="text-2xl font-bold">Faol</p>
                </div>
                <Database className="w-8 h-8 text-green-500 animate-pulse-gentle" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card animate-slideIn" style={{ animationDelay: "0.3s" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hisobotlar</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <FileText className="w-8 h-8 text-primary animate-pulse-gentle" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Umumiy</TabsTrigger>
            <TabsTrigger value="database">Ma'lumotlar</TabsTrigger>
            <TabsTrigger value="edit">Tahrirlash</TabsTrigger>
            <TabsTrigger value="deletion">Ochirish</TabsTrigger>
            <TabsTrigger value="selective">Tanlab ochirish</TabsTrigger>
            <TabsTrigger value="users">Foydalanuvchilar</TabsTrigger>
            <TabsTrigger value="settings">Sozlamalar</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="glass-card animate-slideIn">
              <CardHeader>
                <CardTitle>Tizim holati</CardTitle>
                <CardDescription>Sherdor Mebel boshqaruv tizimi holati</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-gentle"></div>
                      <span className="font-medium">Ma'lumotlar bazasi</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Faol
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse-gentle"></div>
                      <span className="font-medium">Tovarlar moduli</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Faol
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse-gentle"></div>
                      <span className="font-medium">Zakazlar moduli</span>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      Faol
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card className="glass-card animate-slideIn">
              <CardHeader>
                <CardTitle>Ma'lumotlar bazasi boshqaruvi</CardTitle>
                <CardDescription>Jadvallar va ma'lumotlarni boshqarish</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-float" />
                    <h3 className="text-lg font-semibold mb-2">Ma'lumotlar bazasi boshqaruvi</h3>
                    <p className="text-muted-foreground">
                      Bu yerda jadvallarni ko'rish, tahrirlash va boshqarish imkoniyatlari bo'ladi
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edit" className="space-y-6">
            <Card className="glass-card animate-slideIn border-blue-200">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Edit2 className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-blue-700">Ma'lumotlarni tahrirlash</CardTitle>
                </div>
                <CardDescription className="text-blue-600">
                  Xatoliklarni tuzatish va ma'lumotlarni yangilash
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminEditPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deletion" className="space-y-6">
            <Card className="glass-card animate-slideIn border-red-200">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <CardTitle className="text-red-700">Barcha ma'lumotlarni ochirish</CardTitle>
                </div>
                <CardDescription className="text-red-600">
                  Jadvallarning barcha ma'lumotlarini bir vaqtda ochirish. Juda xavfli amal!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminDeletionPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="selective" className="space-y-6">
            <Card className="glass-card animate-slideIn border-orange-200">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <CheckSquare className="w-5 h-5 text-orange-500" />
                  <CardTitle className="text-orange-700">Tanlab ochirish</CardTitle>
                </div>
                <CardDescription className="text-orange-600">
                  Har bir jadvaldan kerakli elementlarni tanlab oching. Xavfsizroq usul.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminSelectiveDeletion />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="glass-card animate-slideIn">
              <CardHeader>
                <CardTitle>Foydalanuvchilar</CardTitle>
                <CardDescription>Tizim foydalanuvchilarini boshqarish</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-float" />
                    <h3 className="text-lg font-semibold mb-2">Foydalanuvchilar boshqaruvi</h3>
                    <p className="text-muted-foreground">Hozircha faqat admin foydalanuvchisi mavjud</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="glass-card animate-slideIn">
              <CardHeader>
                <CardTitle>Tizim sozlamalari</CardTitle>
                <CardDescription>Umumiy tizim sozlamalari</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-float" />
                    <h3 className="text-lg font-semibold mb-2">Tizim sozlamalari</h3>
                    <p className="text-muted-foreground">
                      Bu yerda tizim sozlamalarini o'zgartirish imkoniyatlari bo'ladi
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
