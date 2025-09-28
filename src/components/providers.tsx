"use client"

import { SessionProvider } from "next-auth/react"
import { UserProvider } from "@/lib/user-context"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </SessionProvider>
  )
} 