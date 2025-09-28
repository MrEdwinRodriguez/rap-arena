import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if user is updating their own profile
    if (session.user.id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

            const { name, username, bio, birthday, city, cityNickname, hideLocation, hideCityNickname, countryId, stateId, stateProvince } = await request.json()

    // Validate username uniqueness if provided
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: username.trim(),
          NOT: {
            id: session.user.id
          }
        }
      })

      if (existingUser) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
      }
    }

            // Update user profile
        const updatedUser = await prisma.user.update({
          where: { id: session.user.id },
          data: {
            name: name?.trim() || null,
            username: username?.trim() || null,
            bio: bio?.trim() || null,
            birthday: birthday ? new Date(birthday) : null,
            city: city?.trim() || null,
            cityNickname: cityNickname?.trim() || null,
            hideLocation: hideLocation ?? false,
            hideCityNickname: hideCityNickname ?? false,
            countryId: countryId || null,
            stateId: stateId || null,
            stateProvince: stateProvince?.trim() || null,
          },
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
          }
        })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
} 