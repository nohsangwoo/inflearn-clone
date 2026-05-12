import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import fs from "node:fs/promises"
import path from "node:path"

type StorageConfig = {
  bucket: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  cdnBase: string
}

let cachedClient: S3Client | undefined

function getStorageConfig(): StorageConfig {
  const bucket = process.env.AWS_BUCKET_NAME
  const region = process.env.AWS_REGION
  const accessKeyId = process.env.AWS_ACCESS_KEY
  const secretAccessKey = process.env.AWS_SECRET_KEY
  const cdnBase = process.env.NEXT_PUBLIC_CDN_URL ?? "https://storage.lingoost.com"

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    throw new Error("AWS_BUCKET_NAME, AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY are required for local encoding")
  }

  return { bucket, region, accessKeyId, secretAccessKey, cdnBase: cdnBase.replace(/\/$/, "") }
}

function getS3Client() {
  if (!cachedClient) {
    const config = getStorageConfig()
    cachedClient = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })
  }

  return cachedClient
}

export function cdnUrlForKey(key: string) {
  const config = getStorageConfig()
  return `${config.cdnBase}/${key.replace(/^\//, "")}`
}

export function isHttpUrl(value: string) {
  return /^https?:\/\//.test(value)
}

export async function downloadVideoSourceToFile(source: string, filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })

  if (isHttpUrl(source)) {
    const response = await fetch(source)
    if (!response.ok) throw new Error(`Failed to download source video: ${response.status}`)
    await fs.writeFile(filePath, Buffer.from(await response.arrayBuffer()))
    return
  }

  const config = getStorageConfig()
  const response = await getS3Client().send(
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: source.replace(/^\//, ""),
    }),
  )

  if (!response.Body) throw new Error(`No S3 body for ${source}`)
  const chunks: Uint8Array[] = []
  const reader = response.Body.transformToWebStream().getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) chunks.push(value)
  }
  await fs.writeFile(filePath, Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))))
}

export async function objectExistsInStorage(key: string) {
  const config = getStorageConfig()
  try {
    await getS3Client().send(new HeadObjectCommand({ Bucket: config.bucket, Key: key.replace(/^\//, "") }))
    return true
  } catch {
    return false
  }
}

export async function uploadDirToStorage(localDir: string, prefix: string) {
  const files = await walk(localDir)
  const config = getStorageConfig()

  await Promise.all(
    files.map(async (filePath) => {
      const relativePath = path.relative(localDir, filePath)
      const key = `${prefix.replace(/\/?$/, "/")}${relativePath}`.split(path.sep).join("/")
      const body = await fs.readFile(filePath)
      await getS3Client().send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: key,
          Body: body,
          ContentType: mimeFor(key),
          CacheControl: cacheFor(key),
        }),
      )
    }),
  )
}

async function walk(dir: string, acc: string[] = []) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(filePath, acc)
    } else {
      acc.push(filePath)
    }
  }
  return acc
}

function mimeFor(key: string) {
  const lower = key.toLowerCase()
  if (lower.endsWith(".m3u8")) return "application/vnd.apple.mpegurl"
  if (lower.endsWith(".m4s")) return "video/iso.segment"
  if (lower.endsWith(".mp4")) return "video/mp4"
  if (lower.endsWith(".mp3")) return "audio/mpeg"
  if (lower.endsWith(".wav")) return "audio/wav"
  if (lower.endsWith(".vtt")) return "text/vtt"
  return undefined
}

function cacheFor(key: string) {
  const lower = key.toLowerCase()
  if (lower.endsWith(".m3u8")) return "public, max-age=60"
  if (lower.endsWith(".m4s")) return "public, max-age=31536000, immutable"
  if (lower.endsWith(".mp4")) return "public, max-age=31536000, immutable"
  if (lower.endsWith(".mp3")) return "public, max-age=31536000, immutable"
  return undefined
}
