import type React from "react"
import "./globals.css"
import "@/styles/custom.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { BuyMeCoffee } from "@/components/ui/buy-me-coffee"
import Script from "next/script"

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
      <head>
        {/* Google AdSense Auto Ads Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5415010136926818"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        {/* Auto Ads Configuration */}
        <Script id="auto-ads-config" strategy="afterInteractive">
          {`
            window.adsbygoogle = window.adsbygoogle || [];
            adsbygoogle.push({
              google_ad_client: "ca-pub-5415010136926818",
              enable_page_level_ads: true,
              overlays: {bottom: true}
            });
          `}
        </Script>
        
        {/* Manual AdSense Script (for our strategic placements) */}
        {process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
        {/* Buy Me A Coffee Widget - Replace 'yourusername' with your actual username */}
        <BuyMeCoffee 
          username="yourusername"
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
