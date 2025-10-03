"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Play, 
  Pause, 
  Music, 
  Mic, 
  Send, 
  Users,
  Clock,
  Trophy,
  Download,
  MoreHorizontal,
  Trash2
} from "lucide-react"
import PostInteractions from "@/components/post-interactions"
import RecordingInteractions from "@/components/recording-interactions"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"

interface FeedUser {
  id: string
  name?: string
  username?: string
  image?: string
  tier: number
}

interface FeedPost {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  likesCount: number
  commentsCount: number
  sharesCount: number
  type: string
  recordingId?: string
  user: FeedUser
  recording?: {
    id: string
    title: string
    isPublic: boolean
  }
}

interface FeedRecording {
  id: string
  title: string
  description?: string
  fileUrl: string
  duration?: number
  votes: number
  likesCount: number
  commentsCount: number
  playsCount: number
  sharesCount: number
  createdAt: string
  user: FeedUser
  beat?: {
    id: string
    title: string
    genre?: string
    bpm?: number
  }
}

interface FeedBeat {
  id: string
  title: string
  description?: string
  fileUrl: string
  genre?: string
  bpm?: number
  isPublic: boolean
  createdAt: string
  user: FeedUser
}

type FeedItem = (FeedPost & { type: 'post' }) | 
                (FeedRecording & { type: 'recording' }) | 
                (FeedBeat & { type: 'beat' })

export function SocialFeed() {
  const { data: session } = useSession()
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [postContent, setPostContent] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({})
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'post' | 'recording' | 'beat' } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchFeed()
    }
  }, [session?.user?.id])

  const fetchFeed = async (pageNum = 1) => {
    try {
      setLoading(pageNum === 1)
      const response = await fetch(`/api/feed?page=${pageNum}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        if (pageNum === 1) {
          setFeedItems(data.items)
        } else {
          setFeedItems(prev => [...prev, ...data.items])
        }
        setHasMore(data.pagination.hasNext)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Error fetching feed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!postContent.trim() || isPosting) return

    setIsPosting(true)
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: postContent.trim(),
          type: 'text'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPostContent("")
        // Add the new post to the top of the feed
        setFeedItems(prev => [{
          ...data.post,
          type: 'post' as const
        }, ...prev])
      }
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsPosting(false)
    }
  }

  const handleDeleteItem = async () => {
    if (!itemToDelete) return

    setIsDeleting(true)
    try {
      const endpoint = itemToDelete.type === 'post' 
        ? `/api/posts/${itemToDelete.id}/delete`
        : itemToDelete.type === 'recording'
        ? `/api/recordings/${itemToDelete.id}/delete`
        : `/api/beats/${itemToDelete.id}/delete`

      const response = await fetch(endpoint, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove the deleted item from the feed
        setFeedItems(prev => prev.filter(item => item.id !== itemToDelete.id))
        setItemToDelete(null)
      } else {
        const error = await response.json()
        console.error('Failed to delete item:', error)
        alert('Failed to delete item. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const playAudio = (item: FeedRecording | FeedBeat) => {
    // Stop any currently playing audio
    if (playingId && audioElements[playingId]) {
      audioElements[playingId].pause()
      audioElements[playingId].currentTime = 0
    }

    if (playingId === item.id) {
      setPlayingId(null)
      return
    }

    // Create or get audio element
    let audio = audioElements[item.id]
    if (!audio) {
      audio = new Audio(item.fileUrl)
      audio.addEventListener('ended', () => setPlayingId(null))
      setAudioElements(prev => ({ ...prev, [item.id]: audio }))
    }

    audio.play()
    setPlayingId(item.id)
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const then = new Date(dateString)
    const diffInHours = (now.getTime() - then.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`
    }
  }

  const getTierColor = (tier: number) => {
    const colors = ["bg-gray-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500"]
    return colors[tier - 1] || "bg-gray-500"
  }

  const renderFeedItem = (item: FeedItem) => {
    const isOwnContent = item.user.id === session?.user?.id

    return (
      <Card key={`${item.type}-${item.id}`} className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${item.user.id}`}>
              <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarImage src={item.user.image || "/placeholder.svg"} alt={item.user.name || item.user.username} />
                <AvatarFallback>
                  {(item.user.name || item.user.username || 'U').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link href={`/profile/${item.user.id}`} className="font-semibold hover:text-primary cursor-pointer">
                  {item.user.name || item.user.username}
                </Link>
                <Badge className={`${getTierColor(item.user.tier)} text-white text-xs`}>
                  <Trophy className="w-3 h-3 mr-1" />
                  T{item.user.tier}
                </Badge>
                {isOwnContent && (
                  <Badge variant="outline" className="text-xs">You</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatTimeAgo(item.createdAt)}</span>
                {item.type === 'post' && <Mic className="w-3 h-3" />}
                {item.type === 'recording' && <Music className="w-3 h-3" />}
                {item.type === 'beat' && <Download className="w-3 h-3" />}
                <span className="capitalize">{item.type}</span>
              </div>
            </div>

            {isOwnContent && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setItemToDelete({ id: item.id, type: item.type as 'post' | 'recording' | 'beat' })}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete {item.type}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {item.type === 'post' && (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed">{item.content}</p>
              {item.recording && (
                <div className="bg-muted rounded-lg p-3 feed">
                  <p className="text-sm text-muted-foreground">Shared a recording:</p>
                  <p className="font-medium">{item.recording.title}</p>
                </div>
              )}
              <PostInteractions 
                postId={item.id}
                initialLikesCount={item.likesCount}
                initialCommentsCount={item.commentsCount}
              />
            </div>
          )}

          {item.type === 'recording' && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    {item.duration && <span>{item.duration}s</span>}
                    {item.beat && (
                      <>
                        <span>•</span>
                        <span>Beat: {item.beat.title}</span>
                        {item.beat.genre && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">{item.beat.genre}</Badge>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => playAudio(item)}
                  className="w-12 h-12 rounded-full bg-transparent flex-shrink-0"
                >
                  {playingId === item.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <RecordingInteractions
                recordingId={item.id}
                initialLikesCount={item.likesCount}
                initialCommentsCount={item.commentsCount}
                recordingInfo={{
                  id: item.id,
                  title: item.title,
                  fileUrl: item.fileUrl,
                  user: item.user,
                  duration: item.duration,
                  likesCount: item.likesCount,
                  commentsCount: item.commentsCount,
                  playsCount: item.playsCount,
                  sharesCount: item.sharesCount,
                  beat: item.beat
                }}
              />
            </div>
          )}

          {item.type === 'beat' && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    {item.genre && <Badge variant="outline" className="text-xs">{item.genre}</Badge>}
                    {item.bpm && (
                      <>
                        <span>•</span>
                        <span>{item.bpm} BPM</span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => playAudio(item)}
                  className="w-12 h-12 rounded-full bg-transparent flex-shrink-0"
                >
                  {playingId === item.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Like
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (!session?.user?.id) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Sign in to see your feed</h3>
        <p className="text-muted-foreground">
          Follow other artists to see their latest posts, recordings, and beats
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Post Creation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={session.user.image || "/placeholder.svg"} alt={session.user.name || "You"} />
              <AvatarFallback>
                {(session.user.name || 'U').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="What's on your mind?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[60px] resize-none border-none bg-muted/50 focus-visible:ring-0"
                maxLength={1000}
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {postContent.length}/1000
                </div>
                <Button
                  onClick={handleCreatePost}
                  disabled={!postContent.trim() || isPosting}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isPosting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed Items */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : feedItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Your feed is empty</h3>
            <p className="text-muted-foreground mb-4">
              Follow other artists to see their latest posts, recordings, and beats
            </p>
            <Link href="/discover">
              <Button>Discover Artists</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {feedItems.map(renderFeedItem)}
          
          {hasMore && (
            <div className="text-center py-6">
              <Button
                variant="outline"
                onClick={() => fetchFeed(page + 1)}
                className="bg-transparent"
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {itemToDelete?.type}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
              {itemToDelete?.type === 'post' && ' All comments and likes will also be deleted.'}
              {itemToDelete?.type === 'recording' && ' All comments, likes, and plays will also be deleted.'}
              {itemToDelete?.type === 'beat' && ' All associated data will also be deleted.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
