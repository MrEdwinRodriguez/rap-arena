"use client"

import { useState, useEffect } from "react"
import { SessionProvider } from "next-auth/react"
import { UserProvider } from "@/lib/user-context"
import { PostModal } from "@/components/post-modal"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [postModalId, setPostModalId] = useState<string | null>(null)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)

  useEffect(() => {
    const handleOpenPostModal = (event: CustomEvent) => {
      setPostModalId(event.detail.postId)
      setIsPostModalOpen(true)
    }

    window.addEventListener('openPostModal' as any, handleOpenPostModal)
    return () => {
      window.removeEventListener('openPostModal' as any, handleOpenPostModal)
    }
  }, [])

  return (
    <SessionProvider>
      <UserProvider>
        {children}
        
        {/* Global Post Modal */}
        <PostModal 
          postId={postModalId}
          isOpen={isPostModalOpen}
          onClose={() => {
            setIsPostModalOpen(false)
            setPostModalId(null)
          }}
        />
      </UserProvider>
    </SessionProvider>
  )
} 