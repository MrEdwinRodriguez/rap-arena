import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/header'
import { UserProfile } from '@/components/user-profile'

interface ProfilePageProps {
  params: {
    userId: string
  }
}

async function getUser(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        tier: true,
        bio: true,
        totalVotes: true,
        createdAt: true,
        _count: {
          select: {
            recordings: {
              where: { isPublic: true }
            }
          }
        }
      }
    })

    if (!user) {
      return null
    }

    const publicRecordings = await prisma.recording.findMany({
      where: {
        userId: userId,
        isPublic: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            tier: true
          }
        },
        beat: {
          select: {
            id: true,
            title: true,
            genre: true,
            bpm: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return {
      user,
      recordings: publicRecordings
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const data = await getUser(params.userId)

  if (!data) {
    notFound()
  }

  const { user, recordings } = data

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <UserProfile user={user} recordings={recordings} />
      </div>
    </div>
  )
} 