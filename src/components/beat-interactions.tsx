"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Heart, Download, Share2, Star } from "lucide-react"

interface BeatInteractionsProps {
  beatId: string
  initialLikesCount?: number
  initialDownloadsCount?: number
  size?: "sm" | "default" | "lg"
  showCounts?: boolean
  beatInfo?: {
    id: string
    title: string
    description?: string
    user: {
      id: string
      name?: string
      username?: string
      image?: string
    }
  }
}

export default function BeatInteractions({
  beatId,
  initialLikesCount = 0,
  initialDownloadsCount = 0,
  size = "default",
  showCounts = true,
  beatInfo
}: BeatInteractionsProps) {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [downloadsCount, setDownloadsCount] = useState(initialDownloadsCount)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isTogglingLike, setIsTogglingLike] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchLikeStatus()
      fetchFavoriteStatus()
    }
  }, [session?.user?.id, beatId])

  const fetchLikeStatus = async () => {
    try {
      const response = await fetch(`/api/beats/${beatId}/like-status`)
      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.isLiked)
        setLikesCount(data.likesCount)
      }
    } catch (error) {
      console.error('Error fetching like status:', error)
    }
  }

  const fetchFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/beats/${beatId}/favorite`)
      if (response.ok) {
        const data = await response.json()
        setIsFavorited(data.isFavorited)
      }
    } catch (error) {
      console.error('Error fetching favorite status:', error)
    }
  }

  const toggleLike = async () => {
    if (!session?.user?.id) {
      alert('Please sign in to like beats')
      return
    }

    setIsTogglingLike(true)
    try {
      const response = await fetch(`/api/beats/${beatId}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.isLiked)
        setLikesCount(data.likesCount)
      } else {
        const error = await response.json()
        console.error('Like toggle error:', error)
        alert(error.error || 'Failed to toggle like')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      alert('Failed to toggle like')
    } finally {
      setIsTogglingLike(false)
    }
  }

  const toggleFavorite = async () => {
    if (!session?.user?.id) {
      alert('Please sign in to favorite beats')
      return
    }

    setIsTogglingFavorite(true)
    try {
      const response = await fetch(`/api/beats/${beatId}/favorite`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setIsFavorited(data.isFavorited)
      } else {
        const error = await response.json()
        console.error('Favorite toggle error:', error)
        alert(error.error || 'Failed to toggle favorite')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert('Failed to toggle favorite')
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  const handleDownload = async () => {
    if (!session?.user?.id) {
      alert('Please sign in to download beats')
      return
    }

    try {
      // Increment download count
      const response = await fetch(`/api/beats/${beatId}/download`, {
        method: 'POST'
      })

      if (response.ok) {
        setDownloadsCount(prev => prev + 1)
        // Here you would typically trigger the actual download
        alert('Download started!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to download beat')
      }
    } catch (error) {
      console.error('Error downloading beat:', error)
      alert('Failed to download beat')
    }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/share/beat/${beatId}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: beatInfo ? `${beatInfo.title} by ${beatInfo.user.name || beatInfo.user.username || 'Producer'}` : 'Check out this beat on Rap Arena',
          text: beatInfo?.description || beatInfo?.title || 'Check out this beat on Rap Arena',
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

  const buttonSize = size === "sm" ? "sm" : size === "lg" ? "lg" : "default"
  const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"

  return (
    <div className="flex items-center gap-2">
      {/* Like Button */}
      <Button
        variant="ghost"
        size={buttonSize}
        onClick={toggleLike}
        disabled={isTogglingLike}
        className={`flex items-center gap-1 ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
      >
        <Heart className={`${iconSize} ${isLiked ? 'fill-current' : ''}`} />
        {showCounts && <span>{likesCount}</span>}
      </Button>

      {/* Favorite Button */}
      <Button
        variant="ghost"
        size={buttonSize}
        onClick={toggleFavorite}
        disabled={isTogglingFavorite}
        className={`flex items-center gap-1 ${isFavorited ? 'text-yellow-500 hover:text-yellow-600' : 'text-muted-foreground hover:text-foreground'}`}
      >
        <Star className={`${iconSize} ${isFavorited ? 'fill-current' : ''}`} />
      </Button>

      {/* Download Button */}
      <Button
        variant="ghost"
        size={buttonSize}
        onClick={handleDownload}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
      >
        <Download className={iconSize} />
        {showCounts && <span>{downloadsCount}</span>}
      </Button>

      {/* Share Button */}
      <Button
        variant="ghost"
        size={buttonSize}
        onClick={handleShare}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
      >
        <Share2 className={iconSize} />
        <span>Share</span>
      </Button>
    </div>
  )
}
