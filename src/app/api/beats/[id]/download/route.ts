import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if beat exists
    const beat = await prisma.beat.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        downloads: true
      }
    })

    if (!beat) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 })
    }

    // Increment download count
    await prisma.beat.update({
      where: { id },
      data: {
        downloads: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ 
      success: true,
      downloadUrl: beat.fileUrl,
      downloadsCount: beat.downloads + 1
    })
  } catch (error) {
    console.error('Error downloading beat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
