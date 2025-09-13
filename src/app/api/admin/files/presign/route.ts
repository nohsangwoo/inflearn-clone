import { NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

const bucket = process.env.AWS_BUCKET_NAME as string
const region = process.env.AWS_REGION as string
const accessKeyId = process.env.AWS_ACCESS_KEY as string
const secretAccessKey = process.env.AWS_SECRET_KEY as string

const s3 = new S3Client({
  region,
  credentials: { accessKeyId, secretAccessKey },
})

export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    return NextResponse.json({ message: "aws_env_missing" }, { status: 500 })
  }

  const body = await req.json().catch(() => ({}))
  const contentType: string = body?.contentType ?? "image/jpeg"
  const pathPrefixInput: string | undefined = body?.pathPrefix
  const pathPrefix = (pathPrefixInput ?? 'uploads').replace(/^\/+|\/+$/g, '')
  const ext = contentType.split("/")[1] || "jpg"
  const key = `${pathPrefix}/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType })
  const url = await getSignedUrl(s3, cmd, { expiresIn: 60 })
  return NextResponse.json({ url, key })
}


