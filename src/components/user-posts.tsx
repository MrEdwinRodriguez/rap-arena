"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Heart, Share2, MoreHorizontal, Clock } from "lucide-react"

interface Post {
  id: string
  content: string
  createdAt: string
  likesCount: number
  commentsCount: number
  sharesCount: number
  type: 'text' | 'recording_share' | 'achievement'
  recordingId?: string
  recordingTitle?: string
}

interface UserPostsProps {
  userId: string
  user: {
    id: string
    name?: string
    username?: string
    image?: string
    tier: number
  }
}

// Mock posts data - in a real app, this would come from an API
const mockPosts: Post[] = [
  {
    id: "1",
    content: "Just dropped a new track! Been working on this one for weeks. Let me know what you think! 🔥",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    likesCount: 24,
    commentsCount: 8,
    sharesCount: 3,
    type: 'recording_share',
    recordingId: "rec1",
    recordingTitle: "Late Night Vibes"
  },
  {
    id: "2",
    content: "Reached Tier 3! Thanks to everyone who's been supporting my music journey. This community is amazing! 🙏",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    likesCount: 45,
    commentsCount: 12,
    sharesCount: 5,
    type: 'achievement'
  },
  {
    id: "3",
    content: "Working on some new material in the studio today. The creative process never stops! What's your favorite time to create music?",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    likesCount: 18,
    commentsCount: 6,
    sharesCount: 1,
    type: 'text'
  }
]

export function UserPosts({ userId, user }: UserPostsProps) {
  const [posts] = useState<Post[]>(mockPosts)

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const then = new Date(dateString)
    const diffInHours = (now.getTime() - then.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  const getTierColor = (tier: number) => {
    const colors = ["bg-gray-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500"]
    return colors[tier - 1] || "bg-gray-500"
  }

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'recording_share':
        return '🎵'
      case 'achievement':
        return '🏆'
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Posts</h2>
        <span className="text-sm text-muted-foreground">{posts.length} posts</span>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No posts yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {/* Post Header */}
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name || user.username} />
                    <AvatarFallback>
                      {(user.name || user.username || 'U').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{user.name || user.username}</h4>
                      <Badge className={`${getTierColor(user.tier)} text-white text-xs`}>
                        T{user.tier}
                      </Badge>
                      {getPostTypeIcon(post.type) && (
                        <span className="text-sm">{getPostTypeIcon(post.type)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(post.createdAt)}</span>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Post Content */}
                <div className="mb-3">
                  <p className="text-sm leading-relaxed">{post.content}</p>
                  
                  {/* Recording Share Preview */}
                  {post.type === 'recording_share' && post.recordingTitle && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm font-medium">{post.recordingTitle}</span>
                        <Badge variant="outline" className="text-xs">New Track</Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-red-500">
                      <Heart className="w-4 h-4 mr-1" />
                      <span className="text-xs">{post.likesCount}</span>
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-blue-500">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      <span className="text-xs">{post.commentsCount}</span>
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-green-500">
                      <Share2 className="w-4 h-4 mr-1" />
                      <span className="text-xs">{post.sharesCount}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 