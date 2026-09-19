import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { NuqsAdapter } from "nuqs/adapters/next/app"

import { Toaster } from "@/components/ui/sonner"

import "./globals.css"

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
})

export const metadata: Metadata = {
  title: "Produkty — WorkConnect",
  description: "Katalog produktów z wieloetapowym formularzem dodawania produktu.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
