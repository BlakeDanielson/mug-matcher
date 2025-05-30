import type React from "react"
import "./globals.css"
import "@/styles/custom.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { BuyMeCoffee } from "@/components/ui/buy-me-coffee"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mugshot Matching Game",
  description: "Match criminals with their crimes",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        <Toaster />
        <BuyMeCoffee 
          username={process.env.NEXT_PUBLIC_BUYMEACOFFEE_USERNAME || "blvke"}
          message="Thank you for playing Mugshot Matching Game! If you enjoyed it, consider buying me a coffee! ☕"
          description="Support the developer!"
          color="#FFDD00"
          position="right"
          xMargin={18}
          yMargin={18}
        />
      </body>
    </html>
  )
}
