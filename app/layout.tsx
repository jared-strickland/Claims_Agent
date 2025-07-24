import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={cn("h-full font-sans antialiased", inter.variable)}>{children}</body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
