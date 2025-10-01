import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'recordings', 'beats', 'posts', or null for all

    if (type === 'recordings') {
      const favorites = await prisma.favoriteRecording.findMany({
        where: { userId },
        include: {
          recording: {
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
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({
        recordings: favorites.map(f => f.recording)
      })
    }

    if (type === 'beats') {
      const favorites = await prisma.favoriteBeat.findMany({
        where: { userId },
        include: {
          beat: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                  tier: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({
        beats: favorites.map(f => f.beat)
      })
    }

    if (type === 'posts') {
      const favorites = await prisma.favoritePost.findMany({
        where: { userId },
        include: {
          post: {
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
              recording: {
                select: {
                  id: true,
                  title: true,
                  isPublic: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({
        posts: favorites.map(f => f.post)
      })
    }

    // Get all favorites
    const [recordings, beats, posts] = await Promise.all([
      prisma.favoriteRecording.findMany({
        where: { userId },
        include: {
          recording: {
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
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.favoriteBeat.findMany({
        where: { userId },
        include: {
          beat: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                  tier: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.favoritePost.findMany({
        where: { userId },
        include: {
          post: {
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
              recording: {
                select: {
                  id: true,
                  title: true,
                  isPublic: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    return NextResponse.json({
      recordings: recordings.map(f => f.recording),
      beats: beats.map(f => f.beat),
      posts: posts.map(f => f.post),
      counts: {
        recordings: recordings.length,
        beats: beats.length,
        posts: posts.length
      }
    })

  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
} 