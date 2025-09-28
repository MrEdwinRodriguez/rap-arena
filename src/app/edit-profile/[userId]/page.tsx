import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/header'
import { EditProfileForm } from '@/components/edit-profile-form'

interface EditProfilePageProps {
  params: Promise<{
    userId: string
  }>
}

async function getUser(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
                select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
            bio: true,
            birthday: true,
            city: true,
            cityNickname: true,
            hideLocation: true,
            hideCityNickname: true,
            countryId: true,
            stateId: true,
            stateProvince: true,
            tier: true,
            totalVotes: true,
            createdAt: true
          }
    })

    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  const session = await getServerSession(authOptions)
  
  // Check if user is authenticated
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const { userId } = await params

  // Check if user is trying to edit their own profile
  if (session.user.id !== userId) {
    redirect('/dashboard') // Redirect to dashboard if trying to edit someone else's profile
  }

  const user = await getUser(userId)

  if (!user) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">Update your profile information and settings</p>
        </div>
        
        <EditProfileForm user={user} />
      </div>
    </div>
  )
} 