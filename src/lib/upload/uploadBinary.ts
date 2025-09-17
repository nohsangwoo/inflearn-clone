"use client"

import axios from "axios"

export type UploadBinaryOptions = {
  pathPrefix?: string
  contentType?: string
  onProgress?: (progress: { loaded: number; total?: number; percent: number }) => void
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

  // 진행률이 필요한 경우 XHR 사용
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", presign.url)
    xhr.setRequestHeader("Content-Type", contentType || "application/octet-stream")
    xhr.upload.onprogress = (evt) => {
      if (!options.onProgress) return
      const total = evt.total || (file instanceof File ? file.size : undefined)
      const loaded = evt.loaded
      const percent = total ? Math.min(99, Math.floor((loaded / total) * 100)) : 0
      options.onProgress({ loaded, total, percent })
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        options.onProgress?.({ loaded: file instanceof File ? file.size : 0, total: file instanceof File ? file.size : undefined, percent: 100 })
        resolve()
      } else {
        reject(new Error(`upload failed: ${xhr.status}`))
      }
    }
    xhr.onerror = () => reject(new Error("upload error"))
    xhr.send(file)
  })

  const cdnBase = process.env.NEXT_PUBLIC_CDN_URL ?? "https://storage.lingoost.com"
  return { key: presign.key as string, cdnUrl: `${cdnBase}/${presign.key}` }
}


