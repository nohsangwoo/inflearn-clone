"use client"

import axios from "axios"

export type UploadBinaryOptions = {
  pathPrefix?: string
  contentType?: string
}

export type UploadBinaryResult = {
  key: string
  cdnUrl: string
}

export async function uploadBinary(file: File | Blob, options: UploadBinaryOptions = {}): Promise<UploadBinaryResult> {
  const contentType = options.contentType ?? (file instanceof File ? file.type : "application/octet-stream")
  const pathPrefix = options.pathPrefix ?? "uploads"

  const { data: presign } = await axios.post("/api/admin/files/presign", {
    contentType: contentType || "application/octet-stream",
    pathPrefix,
  })

  await fetch(presign.url, {
    method: "PUT",
    headers: { "Content-Type": contentType || "application/octet-stream" },
    body: file,
  })

  const cdnBase = process.env.NEXT_PUBLIC_CDN_URL ?? "https://storage.lingoost.com"
  return { key: presign.key as string, cdnUrl: `${cdnBase}/${presign.key}` }
}


