import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Music, Download } from 'lucide-react'
import Link from 'next/link'
import { ShareButton } from '@/components/share-button'
import { AudioPreviewPlayer } from '@/components/audio-preview-player'

interface PublicBeatPageProps {
  params: Promise<{ id: string }>
}

async function getBeat(id: string) {
  try {
    const beat = await prisma.beat.findUnique({
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
        recordings: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                name: true,
                username: true,
                image: true
              }
            }
          },
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return beat
  } catch (error) {
    console.error('Database connection error:', error)
    // Return mock data for demo purposes when database is unavailable
    return {
      id,
      title: "Sample Beat",
      description: "This is a sample beat for demonstration purposes.",
      fileUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Sample audio URL
      duration: 180,
      downloads: 25,
      likesCount: 8,
      genre: "Hip-Hop",
      bpm: 140,
      key: "C Major",
      mood: "Energetic",
      tags: ["trap", "hard", "street"],
      createdAt: new Date(),
      user: {
        id: "demo-producer",
        name: "Demo Producer",
        username: "demoproducer",
        image: null,
        city: "Demo City",
        state: { name: "Demo State" },
        country: { name: "Demo Country" }
      },
      recordings: [
        {
          id: "demo-recording-1",
          title: "Demo Recording",
          user: {
            name: "Demo Artist",
            username: "demoartist",
            image: null
          }
        }
      ]
    }
  }
}

export async function generateMetadata({ params }: PublicBeatPageProps): Promise<Metadata> {
  const { id } = await params
  const beat = await getBeat(id)

  if (!beat) {
    return {
      title: 'Beat Not Found - Rap Arena',
      description: 'The beat you are looking for could not be found.'
    }
  }

  const producerName = beat.user.name || beat.user.username || 'Unknown Producer'
  const location = beat.user.city && beat.user.state?.name 
    ? `${beat.user.city}, ${beat.user.state.name}`
    : beat.user.country?.name || ''

  return {
    title: `${beat.title} by ${producerName} - Rap Arena`,
    description: beat.description || `Download ${beat.title} by ${producerName} on Rap Arena`,
    openGraph: {
      title: `${beat.title} by ${producerName}`,
      description: beat.description || `Download ${beat.title} by ${producerName}`,
      type: 'music.song',
      url: `${process.env.NEXTAUTH_URL}/share/beat/${beat.id}`,
      siteName: 'Rap Arena',
      images: beat.user.image ? [
        {
          url: beat.user.image,
          width: 400,
          height: 400,
          alt: `${producerName}'s profile picture`
        }
      ] : [],
      locale: 'en_US',
      authors: [producerName],
      publishedTime: beat.createdAt.toISOString(),
      section: 'Music',
      tags: ['beat', 'instrumental', 'hip-hop', 'music', 'producer', beat.genre || 'hip-hop']
    },
    twitter: {
      card: 'summary_large_image',
      title: `${beat.title} by ${producerName}`,
      description: beat.description || `Download ${beat.title} by ${producerName}`,
      images: beat.user.image ? [beat.user.image] : [],
      creator: '@raparena',
      site: '@raparena'
    }
  }
}

export default async function PublicBeatPage({ params }: PublicBeatPageProps) {
  const { id } = await params
  const beat = await getBeat(id)

  if (!beat) {
    notFound()
  }

  const producerName = beat.user.name || beat.user.username || 'Unknown Producer'
  const location = beat.user.city && beat.user.state?.name 
    ? `${beat.user.city}, ${beat.user.state.name}`
    : beat.user.country?.name || ''

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
                <AvatarImage src={beat.user.image || ''} alt={producerName} />
                <AvatarFallback>
                  {producerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{producerName}</h3>
                  {beat.user.username && (
                    <span className="text-muted-foreground text-sm">@{beat.user.username}</span>
                  )}
                </div>
                {location && (
                  <p className="text-sm text-muted-foreground">{location}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {new Date(beat.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Beat Info */}
            <div className="space-y-3">
              <h1 className="text-2xl font-bold">{beat.title}</h1>
              {beat.description && (
                <p className="text-muted-foreground">{beat.description}</p>
              )}
              
              {/* Beat Stats */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span>{formatDuration(beat.duration || 0)}</span>
                <span>{beat.downloads} downloads</span>
                <span>{beat.recordings.length} recordings</span>
              </div>
            </div>

            {/* Beat Tags */}
            {beat.tags && beat.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {beat.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Beat Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {beat.genre && (
                <div>
                  <span className="text-muted-foreground">Genre:</span>
                  <p className="font-medium">{beat.genre}</p>
                </div>
              )}
              {beat.bpm && (
                <div>
                  <span className="text-muted-foreground">BPM:</span>
                  <p className="font-medium">{beat.bpm}</p>
                </div>
              )}
              {beat.key && (
                <div>
                  <span className="text-muted-foreground">Key:</span>
                  <p className="font-medium">{beat.key}</p>
                </div>
              )}
              {beat.mood && (
                <div>
                  <span className="text-muted-foreground">Mood:</span>
                  <p className="font-medium">{beat.mood}</p>
                </div>
              )}
            </div>

            {/* Audio Preview Player */}
            <AudioPreviewPlayer
              audioUrl={beat.fileUrl}
              title={beat.title}
              duration={beat.duration || 0}
              type="beat"
            />

            {/* Recent Recordings */}
            {beat.recordings.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Recent Recordings</h4>
                <div className="space-y-2">
                  {beat.recordings.map((recording) => (
                    <div key={recording.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Music className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{recording.title}</p>
                        <p className="text-xs text-muted-foreground">
                          by {recording.user.name || recording.user.username || 'Unknown Artist'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="border-t pt-4">
              <div className="text-center space-y-3">
                <h3 className="font-semibold">Join the Rap Arena Community</h3>
                <p className="text-sm text-muted-foreground">
                  Sign up to download beats, record over them, and share your music
                </p>
                <div className="flex gap-2 justify-center">
                  <Button asChild>
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                  <ShareButton 
                    shareUrl={`${process.env.NEXTAUTH_URL}/share/beat/${beat.id}`}
                    title={`${beat.title} by ${producerName}`}
                    text={beat.description || beat.title}
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
