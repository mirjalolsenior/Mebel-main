import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Roboto_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { PWAProvider } from "@/components/pwa/pwa-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" })
const robotoMono = Roboto_Mono({ subsets: ["latin", "cyrillic"], variable: "--font-roboto-mono" })

export const metadata: Metadata = {
  title: "Sherdor Mebel - Biznes boshqaruv tizimi",
  description: "Sherdor Mebel kompaniyasi uchun biznes boshqaruv tizimi",
  generator: "v0.app",
  manifest: "/manifest.json",
  keywords: ["sherdor", "mebel", "biznes", "boshqaruv", "tizim", "furniture", "business", "management"],
  authors: [{ name: "Sherdor Mebel" }],
  creator: "Sherdor Mebel",
  publisher: "Sherdor Mebel",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/icon-192.jpg",
    shortcut: "/icon-192.jpg",
    apple: "/icon-192.jpg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sherdor Mebel",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uz" className="">
      <head>
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sherdor Mebel" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icon-192.jpg" />
      </head>
      <body className={`font-sans ${inter.variable} ${robotoMono.variable} bg-background min-h-screen`}>
        <PWAProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </PWAProvider>
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
