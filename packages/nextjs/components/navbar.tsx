"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText } from "lucide-react"
import { usePathname } from "next/navigation"
// import { ThemeToggle } from "~~/components/theme-toggle"
import { CustomConnectButton } from "~~/components/scaffold-move";


// Simplified version of cn function to avoid potential issues
const classNames = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(" ")
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname() || ""

  const isActive = (path: string) => pathname === path

  return (
    <header className="container mx-auto px-4  flex items-center justify-between">
    <div className="container flex h-16 items-center justify-between px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <FileText className="h-6 w-6" />
        <span>DocSign</span>
      </Link>
      <nav className="hidden gap-6 md:flex">
        <Link href="/" className="text-sm font-medium">
          Home
        </Link>
        <Link href="/features" className="text-sm font-medium text-muted-foreground">
          Features
        </Link>
        <Link href="/pricing" className="text-sm font-medium text-muted-foreground">
          Pricing
        </Link>
        <Link href="/about" className="text-sm font-medium text-muted-foreground">
          About
        </Link>
      </nav>
      <div className="flex items-center gap-4">
      <CustomConnectButton />
      </div>
    </div>
  </header>
  )
}
