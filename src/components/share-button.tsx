"use client"

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"

interface ShareButtonProps {
  shareUrl: string
  title: string
  text: string
  size?: "sm" | "default" | "lg"
  className?: string
}

export function ShareButton({ shareUrl, title, text, size = "default", className }: ShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl
        })
      } catch (err) {
        console.log('Error sharing:', err)
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl)
        alert('Link copied to clipboard!')
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareUrl)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleShare}
      className={className}
    >
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </Button>
  )
}
