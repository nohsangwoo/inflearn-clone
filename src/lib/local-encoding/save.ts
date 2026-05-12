import fs from "node:fs"
import path from "node:path"
import type { Readable } from "node:stream"

export type DownloadInput =
  | string
  | URL
  | Response
  | Blob
  | ArrayBuffer
  | Uint8Array
  | ReadableStream<Uint8Array>
  | Readable
  | { url: string }

function isNodeReadable(value: unknown): value is Readable {
  return typeof (value as { pipe?: unknown })?.pipe === "function"
}

function isWebReadableStream(value: unknown): value is ReadableStream<Uint8Array> {
  return typeof (value as { getReader?: unknown })?.getReader === "function"
}

export async function saveUnknownToFile(input: DownloadInput, destPath: string): Promise<void> {
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true })

  if (isNodeReadable(input)) {
    await new Promise<void>((resolve, reject) => {
      const write = fs.createWriteStream(destPath)
      input
        .on("error", reject)
        .pipe(write)
        .on("finish", resolve)
        .on("error", reject)
    })
    return
  }

  if (isWebReadableStream(input)) {
    const reader = input.getReader()
    const write = fs.createWriteStream(destPath)
    await new Promise<void>((resolve, reject) => {
      write.on("error", reject)
      ;(async () => {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            if (value) write.write(Buffer.from(value))
          }
          write.end(resolve)
        } catch (error) {
          reject(error)
        }
      })()
    })
    return
  }

  if (typeof input === "string" || input instanceof URL) {
    const res = await fetch(input)
    if (!res.ok) throw new Error(`Failed to download from url: ${input}`)
    await fs.promises.writeFile(destPath, Buffer.from(await res.arrayBuffer()))
    return
  }

  if (typeof (input as { url?: unknown })?.url === "string") {
    const url = (input as { url: string }).url
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to download from url: ${url}`)
    await fs.promises.writeFile(destPath, Buffer.from(await res.arrayBuffer()))
    return
  }

  if (input instanceof Response) {
    await fs.promises.writeFile(destPath, Buffer.from(await input.arrayBuffer()))
    return
  }

  if (input instanceof Blob) {
    await fs.promises.writeFile(destPath, Buffer.from(await input.arrayBuffer()))
    return
  }

  if (input instanceof Uint8Array || input instanceof ArrayBuffer) {
    await fs.promises.writeFile(destPath, input instanceof ArrayBuffer ? Buffer.from(input) : Buffer.from(input))
    return
  }

  throw new Error("Unsupported download result type")
}
