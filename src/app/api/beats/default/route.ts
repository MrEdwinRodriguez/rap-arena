import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('API: Fetching default beats...')
    
    const { searchParams } = new URL(request.url)
    const genre = searchParams.get('genre')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('API: Parameters:', { genre, limit, offset })
    
    // Return fallback data (always use fallback for now)
    const fallbackBeats = [
      {
        id: "fallback-trap",
        title: "Trap Beat",
        description: "Hard-hitting trap instrumental with heavy 808s and dark melodies",
        fileUrl: "/beats/default/trap.mp3",
        filePath: "/beats/default/trap.mp3",
        genre: "Trap",
        bpm: 140,
        key: "C# Minor",
        mood: "Dark",
        tags: ["trap", "808", "dark", "hard"],
        duration: 180,
        downloads: 0,
        likesCount: 0,
        createdAt: new Date().toISOString(),
        user: {
          id: "system",
          name: "Rap Arena",
          username: "raparena",
          image: "/rap-arena-square-logo.png",
          tier: 5
        }
      },
      {
        id: "fallback-trap-bball",
        title: "Trap Basketball",
        description: "Basketball-themed trap beat with energetic vibes",
        fileUrl: "/beats/default/trap-bball.mp3",
        filePath: "/beats/default/trap-bball.mp3",
        genre: "Trap",
        bpm: 135,
        key: "F# Minor",
        mood: "Energetic",
        tags: ["trap", "basketball", "sports", "energy"],
        duration: 180,
        downloads: 0,
        likesCount: 0,
        createdAt: new Date().toISOString(),
        user: {
          id: "system",
          name: "Rap Arena",
          username: "raparena",
          image: "/rap-arena-square-logo.png",
          tier: 5
        }
      },
      {
        id: "fallback-hip-hop-bball",
        title: "Hip Hop Basketball",
        description: "Classic hip hop beat perfect for basketball highlights",
        fileUrl: "/beats/default/hip-hop-bball.mp3",
        filePath: "/beats/default/hip-hop-bball.mp3",
        genre: "Hip Hop",
        bpm: 90,
        key: "C Major",
        mood: "Motivational",
        tags: ["hip-hop", "basketball", "classic", "motivational"],
        duration: 180,
        downloads: 0,
        likesCount: 0,
        createdAt: new Date().toISOString(),
        user: {
          id: "system",
          name: "Rap Arena",
          username: "raparena",
          image: "/rap-arena-square-logo.png",
          tier: 5
        }
      },
      {
        id: "fallback-street-bars",
        title: "Street Bars",
        description: "Underground street rap beat with gritty vibes",
        fileUrl: "/beats/default/street-bars.mp3",
        filePath: "/beats/default/street-bars.mp3",
        genre: "Hip Hop",
        bpm: 85,
        key: "A Minor",
        mood: "Gritty",
        tags: ["hip-hop", "street", "underground", "gritty"],
        duration: 180,
        downloads: 0,
        likesCount: 0,
        createdAt: new Date().toISOString(),
        user: {
          id: "system",
          name: "Rap Arena",
          username: "raparena",
          image: "/rap-arena-square-logo.png",
          tier: 5
        }
      },
      {
        id: "fallback-bulletproof",
        title: "Bulletproof",
        description: "Aggressive trap beat with bulletproof confidence",
        fileUrl: "/beats/default/bullettproof.mp3",
        filePath: "/beats/default/bullettproof.mp3",
        genre: "Trap",
        bpm: 145,
        key: "D# Minor",
        mood: "Aggressive",
        tags: ["trap", "aggressive", "confident", "hard"],
        duration: 180,
        downloads: 0,
        likesCount: 0,
        createdAt: new Date().toISOString(),
        user: {
          id: "system",
          name: "Rap Arena",
          username: "raparena",
          image: "/rap-arena-square-logo.png",
          tier: 5
        }
      }
    ]

    // Filter by genre if specified
    let filteredBeats = fallbackBeats
    if (genre) {
      filteredBeats = fallbackBeats.filter(beat => beat.genre === genre)
    }

    // Apply pagination
    const paginatedBeats = filteredBeats.slice(offset, offset + limit)

    console.log('API: Returning beats:', paginatedBeats.length)

    return NextResponse.json({
      beats: paginatedBeats,
      totalCount: filteredBeats.length,
      hasMore: offset + paginatedBeats.length < filteredBeats.length
    })

  } catch (error) {
    console.error('Error fetching default beats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch default beats' },
      { status: 500 }
    )
  }
}