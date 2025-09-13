"use client"

import axios from "axios"

export type UploadOptions = {
  pathPrefix?: string // 버킷 하위 경로 prefix (기본: 'lectures')
  quality?: number // webp 압축률 0~1 (기본: 0.8)
  maxWidth?: number // 픽셀 기준 리사이즈 폭 (옵션)
  maxHeight?: number // 픽셀 기준 리사이즈 높이 (옵션)
}

export type UploadResult = {
  key: string
  cdnUrl: string
}

function dataURLToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(",")
  const mimeMatch = arr[0].match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : "image/webp"
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) u8arr[n] = bstr.charCodeAt(n)
  return new Blob([u8arr], { type: mime })
}

export async function compressToWebp(file: File, quality = 0.8, maxWidth?: number, maxHeight?: number): Promise<Blob> {
  const img = document.createElement("img")
  const url = URL.createObjectURL(file)
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = (e) => reject(e)
      img.src = url
    })
    const canvas = document.createElement("canvas")
    let { width, height } = img
    if (maxWidth || maxHeight) {
      const ratio = Math.min(
        maxWidth ? maxWidth / width : 1,
        maxHeight ? maxHeight / height : 1
      )
      if (ratio < 1) {
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }
    }
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(img, 0, 0, width, height)
    const dataUrl = canvas.toDataURL("image/webp", quality)
    return dataURLToBlob(dataUrl)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function uploadImageWebp(file: File, options: UploadOptions = {}): Promise<UploadResult> {
  const quality = options.quality ?? 0.8
  const pathPrefix = options.pathPrefix ?? "lectures"

  // 1) webp 압축(선택 리사이즈 포함)
  const webpBlob = await compressToWebp(file, quality, options.maxWidth, options.maxHeight)

  // 2) presign 요청 (경로 prefix 지정)
  const { data: presign } = await axios.post("/api/admin/files/presign", {
    contentType: "image/webp",
    pathPrefix,
  })

  // 3) 업로드 (유저 리소스 사용, 클라이언트에서 직접 PUT)
  await fetch(presign.url, {
    method: "PUT",
    headers: { "Content-Type": "image/webp" },
    body: webpBlob,
  })

  const cdnBase = process.env.NEXT_PUBLIC_CDN_URL ?? "https://storage.lingoost.com"
  return { key: presign.key as string, cdnUrl: `${cdnBase}/${presign.key}` }
}
