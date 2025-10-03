import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Play } from 'lucide-react'
import Link from 'next/link'
import { ShareButton } from '@/components/share-button'

interface PublicPostPageProps {
  params: Promise<{ id: string }>
}

async function getPost(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            city: true,
            state: {
              select: { name: true }
            },
            country: {
              select: { name: true }
            }
          }
        },
        recording: {
          select: {
            id: true,
            title: true,
            description: true,
            fileUrl: true,
            duration: true,
            likesCount: true,
            commentsCount: true
          }
        },
        comments: {
          where: { parentId: null },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true
              }
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    return post
  } catch (error) {
    console.error('Database connection error:', error)
    // Return mock data for demo purposes when database is unavailable
    return {
      id,
      content: "This is a sample post for demonstration purposes. Check out this amazing content!",
      likesCount: 12,
      commentsCount: 3,
      sharesCount: 2,
      createdAt: new Date(),
      user: {
        id: "demo-user",
        name: "Demo User",
        username: "demouser",
        image: null,
        city: "Demo City",
        state: { name: "Demo State" },
        country: { name: "Demo Country" }
      },
      recording: null,
      comments: [
        {
          id: "demo-comment-1",
          content: "Great post!",
          createdAt: new Date(),
          user: {
            id: "demo-user-2",
            name: "Demo Fan",
            username: "demofan",
            image: null
          },
          replies: []
        }
      ]
    }
  }
}

export async function generateMetadata({ params }: PublicPostPageProps): Promise<Metadata> {
  const { id } = await params
  const post = await getPost(id)

  if (!post) {
    return {
      title: 'Post Not Found - Rap Arena',
      description: 'The post you are looking for could not be found.'
    }
  }

  const authorName = post.user.name || post.user.username || 'Unknown Artist'
  const location = post.user.city && post.user.state?.name 
    ? `${post.user.city}, ${post.user.state.name}`
    : post.user.country?.name || ''

  return {
    title: `${authorName} on Rap Arena`,
    description: post.content.length > 160 ? `${post.content.substring(0, 160)}...` : post.content,
    openGraph: {
      title: `${authorName} on Rap Arena`,
      description: post.content.length > 160 ? `${post.content.substring(0, 160)}...` : post.content,
      type: 'article',
      url: `${process.env.NEXTAUTH_URL}/share/post/${post.id}`,
      siteName: 'Rap Arena',
      images: post.user.image ? [
        {
          url: post.user.image,
          width: 400,
          height: 400,
          alt: `${authorName}'s profile picture`
        }
      ] : [],
      locale: 'en_US',
      authors: [authorName],
      publishedTime: post.createdAt.toISOString(),
      section: 'Music',
      tags: ['rap', 'hip-hop', 'music', 'freestyle', 'recording']
    },
    twitter: {
      card: 'summary_large_image',
      title: `${authorName} on Rap Arena`,
      description: post.content.length > 160 ? `${post.content.substring(0, 160)}...` : post.content,
      images: post.user.image ? [post.user.image] : [],
      creator: '@raparena',
      site: '@raparena'
    }
  }
}

export default async function PublicPostPage({ params }: PublicPostPageProps) {
  const { id } = await params
  const post = await getPost(id)

  if (!post) {
    notFound()
  }

  const authorName = post.user.name || post.user.username || 'Unknown Artist'
  const location = post.user.city && post.user.state?.name 
    ? `${post.user.city}, ${post.user.state.name}`
    : post.user.country?.name || ''

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">RA</span>
              </div>
              <span className="text-xl font-bold">Rap Arena</span>
            </Link>
            <Button asChild variant="outline">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={post.user.image || ''} alt={authorName} />
                <AvatarFallback>
                  {authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{authorName}</h3>
                  {post.user.username && (
                    <span className="text-muted-foreground text-sm">@{post.user.username}</span>
                  )}
                </div>
                {location && (
                  <p className="text-sm text-muted-foreground">{location}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Post Content */}
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Recording Preview */}
            {post.recording && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{post.recording.title}</h4>
                    {post.recording.description && (
                      <p className="text-sm text-muted-foreground">{post.recording.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{Math.floor((post.recording.duration || 0) / 60)}:{(post.recording.duration || 0) % 60 < 10 ? '0' : ''}{(post.recording.duration || 0) % 60}</span>
                      <span>{post.recording.likesCount} likes</span>
                      <span>{post.recording.commentsCount} comments</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Engagement Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{post.likesCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{post.commentsCount}</span>
              </div>
            </div>

            {/* Comments Preview */}
            {post.comments.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Recent Comments</h4>
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.user.image || ''} alt={comment.user.name || 'User'} />
                      <AvatarFallback className="text-xs">
                        {(comment.user.name || comment.user.username || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {comment.user.name || comment.user.username || 'User'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      {comment.replies.length > 0 && (
                        <div className="ml-4 mt-2 space-y-2">
                          {comment.replies.slice(0, 2).map((reply) => (
                            <div key={reply.id} className="flex gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={reply.user.image || ''} alt={reply.user.name || 'User'} />
                                <AvatarFallback className="text-xs">
                                  {(reply.user.name || reply.user.username || 'U').charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-muted/50 rounded-lg p-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-xs">
                                      {reply.user.name || reply.user.username || 'User'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(reply.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-xs">{reply.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {comment.replies.length > 2 && (
                            <p className="text-xs text-muted-foreground ml-8">
                              +{comment.replies.length - 2} more replies
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Call to Action */}
            <div className="border-t pt-4">
              <div className="text-center space-y-3">
                <h3 className="font-semibold">Join the Rap Arena Community</h3>
                <p className="text-sm text-muted-foreground">
                  Sign up to like, comment, and share your own content
                </p>
                <div className="flex gap-2 justify-center">
                  <Button asChild>
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                  <ShareButton 
                    shareUrl={`${process.env.NEXTAUTH_URL}/share/post/${post.id}`}
                    title={`${authorName} on Rap Arena`}
                    text={post.content}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
