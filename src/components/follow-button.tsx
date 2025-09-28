"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserMinus, Loader2 } from "lucide-react"

interface FollowButtonProps {
  userId: string
  initialIsFollowing?: boolean
  initialFollowersCount?: number
  onFollowChange?: (isFollowing: boolean, followersCount: number) => void
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

export function FollowButton({
  userId,
  initialIsFollowing = false,
  initialFollowersCount = 0,
  onFollowChange,
  variant = "default",
  size = "default"
}: FollowButtonProps) {
  const { data: session } = useSession()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followersCount, setFollowersCount] = useState(initialFollowersCount)
  const [loading, setLoading] = useState(false)
  const [canFollow, setCanFollow] = useState(true)

  // Fetch follow status when component mounts or user changes
  useEffect(() => {
    if (session?.user?.id && userId) {
      fetchFollowStatus()
    }
  }, [session?.user?.id, userId])

  const fetchFollowStatus = async () => {
    try {
      const response = await fetch(`/api/user/${userId}/follow-status`)
      if (response.ok) {
        const data = await response.json()
        setIsFollowing(data.isFollowing)
        setFollowersCount(data.followersCount)
        setCanFollow(data.canFollow)
      }
    } catch (error) {
      console.error('Error fetching follow status:', error)
    }
  }

  const handleFollowToggle = async () => {
    if (!session?.user?.id || !canFollow) {
      return
    }

    setLoading(true)
    try {
      const method = isFollowing ? 'DELETE' : 'POST'
      const response = await fetch(`/api/user/${userId}/follow`, {
        method
      })

      if (response.ok) {
        const data = await response.json()
        const newIsFollowing = data.isFollowing
        const newFollowersCount = isFollowing 
          ? followersCount - 1 
          : followersCount + 1

        setIsFollowing(newIsFollowing)
        setFollowersCount(newFollowersCount)

        // Notify parent component of the change
        onFollowChange?.(newIsFollowing, newFollowersCount)
      } else {
        const errorData = await response.json()
        console.error('Follow action failed:', errorData.error)
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setLoading(false)
    }
  }

  // Don't show button if user is not logged in
  if (!session?.user?.id) {
    return null
  }

  // Don't show button if user can't follow (themselves or deactivated user)
  if (!canFollow) {
    return null
  }

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={loading}
      variant={isFollowing ? "outline" : variant}
      size={size}
      className={`transition-all duration-200 ${
        isFollowing 
          ? "hover:bg-destructive hover:text-destructive-foreground hover:border-destructive" 
          : ""
      }`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : isFollowing ? (
        <UserMinus className="h-4 w-4 mr-2" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      {loading ? "..." : isFollowing ? "Unfollow" : "Follow"}
    </Button>
  )
} 