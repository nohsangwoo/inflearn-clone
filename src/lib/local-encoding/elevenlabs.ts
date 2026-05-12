import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"
import fs from "node:fs/promises"
import path from "node:path"
import { getFfmpegPath } from "./ffmpeg"
import { execa } from "execa"
import { saveUnknownToFile } from "./save"

export const DUBBING_LANGUAGE_CODES = [
  "ar",
  "bg",
  "cs",
  "da",
  "de",
  "el",
  "en",
  "es",
  "fi",
  "fr",
  "he",
  "hi",
  "hu",
  "id",
  "it",
  "ja",
  "ko",
  "ms",
  "nl",
  "no",
  "pl",
  "pt",
  "ro",
  "ru",
  "sk",
  "sv",
  "th",
  "tr",
  "uk",
  "vi",
  "zh",
  "fil",
] as const

export type DubbingLanguageCode = (typeof DUBBING_LANGUAGE_CODES)[number]

export async function createDubbedAudio(params: {
  inputVideoPath: string
  targetLanguage: DubbingLanguageCode
  outputDir: string
}) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is required")

  await fs.mkdir(params.outputDir, { recursive: true })
  const extractedAudioPath = path.join(params.outputDir, `source.${params.targetLanguage}.m4a`)

  await execa(
    getFfmpegPath(),
    ["-y", "-i", params.inputVideoPath, "-vn", "-c:a", "aac", "-b:a", "192k", extractedAudioPath],
    { stdio: "inherit" },
  )

  const audioBuffer = await fs.readFile(extractedAudioPath)
  const arrayBuffer = audioBuffer.buffer.slice(
    audioBuffer.byteOffset,
    audioBuffer.byteOffset + audioBuffer.byteLength,
  ) as ArrayBuffer
  const client = new ElevenLabsClient({ apiKey })
  const created = await client.dubbing.create({
    file: new Blob([arrayBuffer], { type: "audio/mp4" }),
    targetLang: params.targetLanguage,
  })
  const dubbingId =
    (created as { dubbingId?: string; data?: { dubbingId?: string } }).dubbingId ??
    (created as { data?: { dubbingId?: string } }).data?.dubbingId

  if (!dubbingId) throw new Error("ElevenLabs dubbingId was not returned")

  while (true) {
    const meta = await client.dubbing.get(dubbingId)
    const status =
      (meta as { status?: string; data?: { status?: string } }).status ??
      (meta as { data?: { status?: string } }).data?.status
    if (status === "dubbed") break
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

  const audioResponse = await (
    client as unknown as {
      dubbing: { audio: { get: (id: string, lang: string) => Promise<unknown> } }
    }
  ).dubbing.audio.get(dubbingId, params.targetLanguage)
  const audioDownload = (audioResponse as { data?: unknown }).data ?? audioResponse
  const dubbedAudioPath = path.join(params.outputDir, `dubbed.${params.targetLanguage}.mp3`)
  await saveUnknownToFile(audioDownload as Parameters<typeof saveUnknownToFile>[0], dubbedAudioPath)

  return { dubbingId, audioPath: dubbedAudioPath }
}
