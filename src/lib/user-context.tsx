"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useSession } from "next-auth/react"

interface UserContextType {
  userImage: string | null | undefined
  updateUserImage: (newImage: string) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const { data: session } = useSession()
  const [userImage, setUserImage] = useState<string | null | undefined>(session?.user?.image)

  // Update user image when session changes
  useEffect(() => {
    setUserImage(session?.user?.image)
  }, [session?.user?.image])

  const updateUserImage = (newImage: string) => {
    setUserImage(newImage)
  }

  return (
    <UserContext.Provider value={{ userImage, updateUserImage }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
} 