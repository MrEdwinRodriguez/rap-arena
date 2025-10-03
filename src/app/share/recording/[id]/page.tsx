import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Play, Download } from 'lucide-react'
import Link from 'next/link'
import { ShareButton } from '@/components/share-button'
import { AudioPreviewPlayer } from '@/components/audio-preview-player'

interface PublicRecordingPageProps {
  params: Promise<{ id: string }>
}

async function getRecording(id: string) {
  try {
    const recording = await prisma.recording.findUnique({
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
        beat: {
          select: {
            id: true,
            title: true,
            genre: true,
            bpm: true,
            key: true
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

    return recording
  } catch (error) {
    console.error('Database connection error:', error)
    // Return mock data for demo purposes when database is unavailable
    return {
      id,
      title: "Sample Recording",
      description: "This is a sample recording for demonstration purposes.",
      fileUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Sample audio URL
      duration: 30,
      likesCount: 5,
      commentsCount: 2,
      playsCount: 10,
      sharesCount: 1,
      createdAt: new Date(),
      user: {
        id: "demo-user",
        name: "Demo Artist",
        username: "demoartist",
        image: null,
        city: "Demo City",
        state: { name: "Demo State" },
        country: { name: "Demo Country" }
      },
      beat: {
        id: "demo-beat",
        title: "Demo Beat",
        genre: "Hip-Hop",
        bpm: 140,
        key: "C Major"
      },
      comments: [
        {
          id: "demo-comment-1",
          content: "This is amazing!",
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

export async function generateMetadata({ params }: PublicRecordingPageProps): Promise<Metadata> {
  const { id } = await params
  const recording = await getRecording(id)

  if (!recording) {
    return {
      title: 'Recording Not Found - Rap Arena',
      description: 'The recording you are looking for could not be found.'
    }
  }

  const artistName = recording.user.name || recording.user.username || 'Unknown Artist'
  const location = recording.user.city && recording.user.state?.name 
    ? `${recording.user.city}, ${recording.user.state.name}`
    : recording.user.country?.name || ''

  return {
    title: `${recording.title} by ${artistName} - Rap Arena`,
    description: recording.description || `Listen to ${recording.title} by ${artistName} on Rap Arena`,
    openGraph: {
      title: `${recording.title} by ${artistName}`,
      description: recording.description || `Listen to ${recording.title} by ${artistName}`,
      type: 'music.song',
      url: `${process.env.NEXTAUTH_URL}/share/recording/${recording.id}`,
      siteName: 'Rap Arena',
      images: recording.user.image ? [
        {
          url: recording.user.image,
          width: 400,
          height: 400,
          alt: `${artistName}'s profile picture`
        }
      ] : [],
      locale: 'en_US',
      authors: [artistName],
      publishedTime: recording.createdAt.toISOString(),
      section: 'Music',
      tags: ['rap', 'hip-hop', 'music', 'freestyle', 'recording', recording.genre || 'hip-hop']
    },
    twitter: {
      card: 'summary_large_image',
      title: `${recording.title} by ${artistName}`,
      description: recording.description || `Listen to ${recording.title} by ${artistName}`,
      images: recording.user.image ? [recording.user.image] : [],
      creator: '@raparena',
      site: '@raparena'
    }
  }
}

export default async function PublicRecordingPage({ params }: PublicRecordingPageProps) {
  const { id } = await params
  const recording = await getRecording(id)

  if (!recording) {
    notFound()
  }

  const artistName = recording.user.name || recording.user.username || 'Unknown Artist'
  const location = recording.user.city && recording.user.state?.name 
    ? `${recording.user.city}, ${recording.user.state.name}`
    : recording.user.country?.name || ''

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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
                <AvatarImage src={recording.user.image || ''} alt={artistName} />
                <AvatarFallback>
                  {artistName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{artistName}</h3>
                  {recording.user.username && (
                    <span className="text-muted-foreground text-sm">@{recording.user.username}</span>
                  )}
                </div>
                {location && (
                  <p className="text-sm text-muted-foreground">{location}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {new Date(recording.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Recording Info */}
            <div className="space-y-3">
              <h1 className="text-2xl font-bold">{recording.title}</h1>
              {recording.description && (
                <p className="text-muted-foreground">{recording.description}</p>
              )}
              
              {/* Recording Stats */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span>{formatDuration(recording.duration || 0)}</span>
                <span>{recording.likesCount} likes</span>
                <span>{recording.commentsCount} comments</span>
                <span>{recording.playsCount} plays</span>
                <span>{recording.sharesCount} shares</span>
              </div>
            </div>

            {/* Beat Info */}
            {recording.beat && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-semibold mb-2">Beat: {recording.beat.title}</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {recording.beat.genre && <span>Genre: {recording.beat.genre}</span>}
                  {recording.beat.bpm && <span>BPM: {recording.beat.bpm}</span>}
                  {recording.beat.key && <span>Key: {recording.beat.key}</span>}
                </div>
              </div>
            )}

            {/* Audio Preview Player */}
            <AudioPreviewPlayer
              audioUrl={recording.fileUrl}
              title={recording.title}
              duration={recording.duration || 0}
              type="recording"
            />

            {/* Comments Preview */}
            {recording.comments.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Recent Comments</h4>
                {recording.comments.map((comment) => (
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
                  Sign up to listen, like, comment, and share your own recordings
                </p>
                <div className="flex gap-2 justify-center">
                  <Button asChild>
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                  <ShareButton 
                    shareUrl={`${process.env.NEXTAUTH_URL}/share/recording/${recording.id}`}
                    title={`${recording.title} by ${artistName}`}
                    text={recording.description || recording.title}
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
