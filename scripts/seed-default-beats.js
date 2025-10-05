const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function seedDefaultBeats() {
  try {
    console.log('🎵 Seeding default beats...')
    
    // Define your default beats with metadata
    const defaultBeats = [
      {
        title: "Trap Beat",
        description: "Hard-hitting trap instrumental with heavy 808s and dark melodies",
        genre: "Trap",
        bpm: 140,
        key: "C# Minor",
        mood: "Dark",
        tags: ["trap", "808", "dark", "hard"],
        fileUrl: "/beats/default/trap.mp3",
        filePath: "/beats/default/trap.mp3",
        isDefault: true
      },
      {
        title: "Trap Basketball", 
        description: "Basketball-themed trap beat with energetic vibes",
        genre: "Trap",
        bpm: 135,
        key: "F# Minor",
        mood: "Energetic",
        tags: ["trap", "basketball", "sports", "energy"],
        fileUrl: "/beats/default/trap-bball.mp3",
        filePath: "/beats/default/trap-bball.mp3",
        isDefault: true
      },
      {
        title: "Hip Hop Basketball",
        description: "Classic hip hop beat perfect for basketball highlights",
        genre: "Hip Hop",
        bpm: 90,
        key: "C Major",
        mood: "Motivational",
        tags: ["hip-hop", "basketball", "classic", "motivational"],
        fileUrl: "/beats/default/hip-hop-bball.mp3",
        filePath: "/beats/default/hip-hop-bball.mp3",
        isDefault: true
      },
      {
        title: "Street Bars",
        description: "Underground street rap beat with gritty vibes",
        genre: "Hip Hop",
        bpm: 85,
        key: "A Minor",
        mood: "Gritty",
        tags: ["hip-hop", "street", "underground", "gritty"],
        fileUrl: "/beats/default/street-bars.mp3",
        filePath: "/beats/default/street-bars.mp3",
        isDefault: true
      },
      {
        title: "Bulletproof",
        description: "Aggressive trap beat with bulletproof confidence",
        genre: "Trap",
        bpm: 145,
        key: "D# Minor",
        mood: "Aggressive",
        tags: ["trap", "aggressive", "confident", "hard"],
        fileUrl: "/beats/default/bullettproof.mp3",
        filePath: "/beats/default/bullettproof.mp3",
        isDefault: true
      }
    ]

    // Create a system user for default beats (if it doesn't exist)
    let systemUser = await prisma.user.findUnique({
      where: { email: 'system@raparena.com' }
    })

    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          email: 'system@raparena.com',
          name: 'Rap Arena',
          username: 'raparena',
          image: '/rap-arena-square-logo.png',
          tier: 5
        }
      })
    }

    // Add beats to database
    for (const beatData of defaultBeats) {
      const existingBeat = await prisma.beat.findFirst({
        where: { 
          title: beatData.title,
          userId: systemUser.id
        }
      })

      if (!existingBeat) {
        await prisma.beat.create({
          data: {
            ...beatData,
            userId: systemUser.id,
            downloads: 0,
            likesCount: 0
          }
        })
        console.log(`✅ Added: ${beatData.title}`)
      } else {
        console.log(`⏭️  Skipped: ${beatData.title} (already exists)`)
      }
    }

    console.log('🎉 Default beats seeded successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding default beats:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDefaultBeats()
