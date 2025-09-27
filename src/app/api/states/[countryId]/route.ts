import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ countryId: string }> }
) {
  try {
    const { countryId: countryIdParam } = await params
    const countryId = parseInt(countryIdParam, 10)

    if (isNaN(countryId)) {
      return NextResponse.json({ error: 'Invalid country ID' }, { status: 400 })
    }

    const states = await prisma.state.findMany({
      where: {
        countryId: countryId
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(states)
  } catch (error) {
    console.error('Error fetching states:', error)
    return NextResponse.json(
      { error: 'Failed to fetch states' },
      { status: 500 }
    )
  }
} 