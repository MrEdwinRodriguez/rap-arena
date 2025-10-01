"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Heart, Share2, MoreHorizontal, Clock, Image, Smile, Send, Trash2 } from "lucide-react"
import { PostInteractions } from "@/components/post-interactions"
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

interface Post {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  likesCount: number
  commentsCount: number
  sharesCount: number
  type: string
  recordingId?: string
  user: {
    id: string
    name?: string
    username?: string
    image?: string
    tier: number
  }
  recording?: {
    id: string
    title: string
    isPublic: boolean
  }
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
  isOwnProfile?: boolean
}

export function UserPosts({ userId, user, isOwnProfile = false }: UserPostsProps) {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [postContent, setPostContent] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [showPostInput, setShowPostInput] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [userId])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/user/${userId}/posts`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
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
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  const getTierColor = (tier: number) => {
    const colors = ["bg-gray-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500"]
    return colors[tier - 1] || "bg-gray-500"
  }

  const handleDeletePost = async () => {
    if (!postToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/posts/${postToDelete}/delete`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove the deleted post from the list
        setPosts(prev => prev.filter(post => post.id !== postToDelete))
        setPostToDelete(null)
      } else {
        const error = await response.json()
        console.error('Failed to delete post:', error)
        alert('Failed to delete post. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post. Please try again.')
    } finally {
      setIsDeleting(false)
    }
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

   const handleCreatePost = async () => {
     if (!postContent.trim() || !session?.user?.id) return

     setIsPosting(true)
     try {
       const response = await fetch('/api/posts', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           content: postContent.trim(),
           type: 'text'
         })
       })

       if (response.ok) {
         const data = await response.json()
         // Add the new post to the beginning of the list
         setPosts([data.post, ...posts])
         setPostContent("")
         setShowPostInput(false)
       } else {
         const errorData = await response.json()
         console.error('Failed to create post:', errorData.error)
         alert(errorData.error || 'Failed to create post')
       }
     } catch (error) {
       console.error('Error creating post:', error)
       alert('Failed to create post')
     } finally {
       setIsPosting(false)
     }
   }

     const handleInputClick = () => {
    if (isOwnProfile || session?.user?.id === userId) {
      setShowPostInput(true)
             }
  }

 return (
    <div className="space-y-4">
		<div className="flex items-center justify-between">
			<h2 className="text-xl font-semibold">Posts</h2>
			<span className="text-sm text-muted-foreground">{posts.length} posts</span>
		</div>
      {/* Post Creation - only show if user is viewing their own profile or is logged in as the profile owner */}
      {(isOwnProfile || session?.user?.id === userId) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name || user.username || ""} />
                <AvatarFallback>
                  {(user.name || user.username || 'U').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div id='post-input' className="flex-1">
                {!showPostInput ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start text-muted-foreground h-12 bg-muted/30 hover:bg-muted/50"
                    onClick={handleInputClick}
                  >
                    What's on your mind?
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="What's on your mind?"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="min-h-[80px] resize-none"
                      autoFocus
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <Image className="h-4 w-4 mr-1" />
                          Photo
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <Smile className="h-4 w-4 mr-1" />
                          Feeling
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setShowPostInput(false)
                            setPostContent("")
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleCreatePost}
                          disabled={!postContent.trim() || isPosting}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {isPosting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Send className="h-4 w-4 mr-1" />
                          )}
                          {isPosting ? "Posting..." : "Post"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No posts yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow profile-post">
              <CardContent className="p-4">
                {/* Post Header */}
                                 <div className="flex items-start gap-3 mb-3">
                   <Avatar className="h-10 w-10">
                     <AvatarImage src={post.user.image || "/placeholder.svg"} alt={post.user.name || post.user.username} />
                     <AvatarFallback>
                       {(post.user.name || post.user.username || 'U').slice(0, 2).toUpperCase()}
                     </AvatarFallback>
                   </Avatar>
                   
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-1">
                       <h4 className="font-semibold text-sm">{post.user.name || post.user.username}</h4>
                       <Badge className={`${getTierColor(post.user.tier)} text-white text-xs`}>
                         T{post.user.tier}
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

                  {isOwnProfile && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setPostToDelete(post.id)}
                          className="text-red-600 focus:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Post Content */}
                <div className="mb-3">
                  <p className="text-sm leading-relaxed">{post.content}</p>
                  
                  {/* Recording Share Preview */}
                  {post.type === 'recording_share' && post.recording && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm font-medium">{post.recording.title}</span>
                        <Badge variant="outline" className="text-xs">New Track</Badge>
                      </div>
                    </div>
                  )}
                </div>

                                 {/* Post Actions */}
                 <div className="pt-2 border-t">
                   <PostInteractions
                     postId={post.id}
                     initialLikesCount={post.likesCount}
                     initialCommentsCount={post.commentsCount}
                     size="sm"
                     postInfo={{
                       id: post.id,
                       content: post.content,
                       user: post.user,
                       createdAt: post.createdAt,
                       type: post.type,
                       recording: post.recording
                     }}
                   />
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
              All comments and likes will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
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