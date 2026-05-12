import { NextRequest, NextResponse } from 'next/server'
import { and, desc, eq } from 'drizzle-orm'
import { db, lectures, likes, users } from '@/db'
import { getAuthUserFromRequest } from '@/lib/auth/get-auth-user'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rows = await db
      .select({
        id: likes.id,
        createdAt: likes.createdAt,
        lectureId: lectures.id,
        lectureTitle: lectures.title,
        lectureDescription: lectures.description,
        lecturePrice: lectures.price,
        lectureDiscountPrice: lectures.discountPrice,
        lectureImageUrl: lectures.imageUrl,
        instructorId: users.id,
        instructorNickname: users.nickname,
        instructorEmail: users.email,
        instructorProfileImageUrl: users.profileImageUrl,
      })
      .from(likes)
      .leftJoin(lectures, eq(likes.lectureId, lectures.id))
      .leftJoin(users, eq(lectures.instructorId, users.id))
      .where(eq(likes.userId, user.id))
      .orderBy(desc(likes.createdAt))

    return NextResponse.json({
      likes: rows.map(like => ({
        id: like.id,
        createdAt: like.createdAt,
        lecture: like.lectureId ? {
          id: like.lectureId,
          title: like.lectureTitle,
          description: like.lectureDescription,
          price: like.lecturePrice,
          discountPrice: like.lectureDiscountPrice,
          imageUrl: like.lectureImageUrl,
          instructor: like.instructorId ? {
            id: like.instructorId,
            nickname: like.instructorNickname,
            email: like.instructorEmail,
            profileImageUrl: like.instructorProfileImageUrl,
          } : null,
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
    const lecture = await db.query.lectures.findFirst({ where: eq(lectures.id, lectureId) })
    if (!lecture) {
      return NextResponse.json({ error: 'Lecture not found' }, { status: 404 })
    }

    // Check if already liked
    const existingLike = await db.query.likes.findFirst({
      where: and(eq(likes.userId, user.id), eq(likes.lectureId, lectureId)),
    })

    if (existingLike) {
      return NextResponse.json({ error: 'Already liked' }, { status: 400 })
    }

    // Create like
    const [like] = await db.insert(likes).values({
        userId: user.id,
        lectureId: lectureId
      }).returning()

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
    const deleted = await db
      .delete(likes)
      .where(and(eq(likes.userId, user.id), eq(likes.lectureId, parseInt(lectureId))))
      .returning({ id: likes.id })

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Like not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting like:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
