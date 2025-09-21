import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prismaClient'
import { getAuthUserFromRequest } from '@/lib/auth/get-auth-user'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const likes = await prisma.like.findMany({
      where: {
        userId: user.id
      },
      include: {
        Lecture: {
          include: {
            instructor: {
              select: {
                id: true,
                nickname: true,
                email: true,
                profileImageUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      likes: likes.map(like => ({
        id: like.id,
        createdAt: like.createdAt,
        lecture: like.Lecture ? {
          id: like.Lecture.id,
          title: like.Lecture.title,
          description: like.Lecture.description,
          price: like.Lecture.price,
          discountPrice: like.Lecture.discountPrice,
          imageUrl: like.Lecture.imageUrl,
          instructor: like.Lecture.instructor
        } : null
      }))
    })
  } catch (error) {
    console.error('Error fetching likes:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { lectureId } = await request.json()
    if (!lectureId) {
      return NextResponse.json({ error: 'Lecture ID is required' }, { status: 400 })
    }

    // Check if the lecture exists
    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId }
    })
    if (!lecture) {
      return NextResponse.json({ error: 'Lecture not found' }, { status: 404 })
    }

    // Check if already liked
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: user.id,
        lectureId: lectureId
      }
    })

    if (existingLike) {
      return NextResponse.json({ error: 'Already liked' }, { status: 400 })
    }

    // Create like
    const like = await prisma.like.create({
      data: {
        userId: user.id,
        lectureId: lectureId
      }
    })

    return NextResponse.json({ like })
  } catch (error) {
    console.error('Error creating like:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const lectureId = searchParams.get('lectureId')

    if (!lectureId) {
      return NextResponse.json({ error: 'Lecture ID is required' }, { status: 400 })
    }

    // Find and delete the like
    const like = await prisma.like.deleteMany({
      where: {
        userId: user.id,
        lectureId: parseInt(lectureId)
      }
    })

    if (like.count === 0) {
      return NextResponse.json({ error: 'Like not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting like:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}