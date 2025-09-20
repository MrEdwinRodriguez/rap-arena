"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SearchModal } from "@/components/search-modal"
import { AuthModal } from "@/components/auth-modal"
import { Search, User, Mic } from "lucide-react"
import Link from "next/link"

export function Header() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Mic size={32} className="text-primary" />
            <h1 className="text-2xl font-serif font-bold text-primary">RapArena</h1>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/beat-library" className="text-foreground hover:text-primary transition-colors">
              Beat Library
            </Link>
            <Link href="/recording-studio" className="text-foreground hover:text-primary transition-colors">
              Recording Studio
            </Link>
            <a href="#discover" className="text-foreground hover:text-primary transition-colors">
              Discover
            </a>
            <a href="#leaderboard" className="text-foreground hover:text-primary transition-colors">
              Leaderboard
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsAuthOpen(true)} data-auth-modal>
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setIsAuthOpen(true)}>
              Get Started
            </Button>
          </div>
        </div>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  )
}
