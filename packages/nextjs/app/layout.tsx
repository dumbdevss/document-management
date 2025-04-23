import type React from "react"
import type { Metadata } from "next"
import { Karla } from "next/font/google"
import { ScaffoldMoveAppWithProviders } from "../components/ScaffoldMoveAppWithProviders"
import "./globals.css"

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
})

export const metadata: Metadata = {
  title: "DocSign - Document Management",
  description: "Secure document management and signing platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${karla.variable} font-karla bg-neutral-50 text-neutral-800`}><ScaffoldMoveAppWithProviders>{children}</ScaffoldMoveAppWithProviders></body>
    </html>
  )
}



import './globals.css'