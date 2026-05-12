import { and, asc, eq } from "drizzle-orm"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { db, dubTracks, videos } from "@/db"
import { createDubbedAudio, type DubbingLanguageCode } from "./elevenlabs"
import { extractOriginAudio, normalizeAudio, packageAudioHls, packageVideoHls } from "./ffmpeg"
import { writeMasterPlaylist, type AudioEntry } from "./hls-master"
import { cdnUrlForKey, downloadVideoSourceToFile, objectExistsInStorage, uploadDirToStorage } from "./s3"

export function canRunLocalEncoding() {
  return process.env.LOCAL_ENCODING_ENABLED === "true" || process.env.NODE_ENV !== "production"
}

export async function runLocalEncoding(params: {
  curriculumSectionId: number
  targetLanguages: DubbingLanguageCode[]
  force?: boolean
}) {
  if (!canRunLocalEncoding()) {
    throw new Error("Local encoding is disabled in this environment")
  }

  const video = await db.query.videos.findFirst({
    where: eq(videos.curriculumSectionId, params.curriculumSectionId),
    with: { dubTracks: true },
  })
  if (!video) throw new Error("No video found for this curriculum section")

  const sectionId = params.curriculumSectionId
  const basePrefix = `assets/curriculumsection/${sectionId}/`
  const masterKey = `${basePrefix}master.m3u8`
  const tmpRoot = path.join(os.tmpdir(), `baksal-encode-${sectionId}-${Date.now()}`)
  const outputRoot = path.join(tmpRoot, "output")
  const sourcePath = path.join(tmpRoot, "source.mp4")

  try {
    await db
      .update(videos)
      .set({ hlsStatus: "PROCESSING", hlsError: null, updatedAt: new Date() })
      .where(eq(videos.id, video.id))

    await downloadVideoSourceToFile(video.videoUrl, sourcePath)

    const videoPlaylistExists = await objectExistsInStorage(`${basePrefix}video/video.m3u8`)
    if (params.force || !videoPlaylistExists) {
      await packageVideoHls(sourcePath, path.join(outputRoot, "video"))
    }

    await ensureOriginTrack({ videoId: video.id, sourceUrl: cdnUrlForKey(`${basePrefix}audio/origin/audio.m3u8`) })

    const originPlaylistExists = await objectExistsInStorage(`${basePrefix}audio/origin/audio.m3u8`)
    if (params.force || !originPlaylistExists) {
      const originDir = path.join(outputRoot, "audio", "origin")
      const originWav = path.join(originDir, "source.wav")
      const aligned = path.join(originDir, "aligned.wav")
      await extractOriginAudio(sourcePath, originWav)
      await normalizeAudio(originWav, aligned)
      await packageAudioHls(aligned, originDir)
    }

    const existingReadyLangs = new Set(video.dubTracks.filter((track) => track.status === "ready").map((track) => track.lang))
    const processed: string[] = []
    const skipped: string[] = []

    for (const lang of params.targetLanguages) {
      const audioPlaylistKey = `${basePrefix}audio/${lang}/audio.m3u8`
      const audioPlaylistUrl = cdnUrlForKey(audioPlaylistKey)
      const alreadyEncoded = await objectExistsInStorage(audioPlaylistKey)

      if (!params.force && existingReadyLangs.has(lang) && alreadyEncoded) {
        skipped.push(lang)
        continue
      }

      await db
        .insert(dubTracks)
        .values({ videoId: video.id, lang, status: "processing", url: audioPlaylistUrl, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: [dubTracks.videoId, dubTracks.lang],
          set: { status: "processing", url: audioPlaylistUrl, updatedAt: new Date() },
        })

      const audioDir = path.join(outputRoot, "audio", lang)
      const dubbed = await createDubbedAudio({
        inputVideoPath: sourcePath,
        targetLanguage: lang,
        outputDir: path.join(tmpRoot, "dubbed", lang),
      })
      const aligned = path.join(audioDir, "aligned.wav")
      await normalizeAudio(dubbed.audioPath, aligned)
      await packageAudioHls(aligned, audioDir)

      await db
        .insert(dubTracks)
        .values({ videoId: video.id, lang, status: "ready", url: audioPlaylistUrl, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: [dubTracks.videoId, dubTracks.lang],
          set: { status: "ready", url: audioPlaylistUrl, updatedAt: new Date() },
        })

      processed.push(lang)
    }

    const finalTracks = await db
      .select()
      .from(dubTracks)
      .where(and(eq(dubTracks.videoId, video.id), eq(dubTracks.status, "ready")))
      .orderBy(asc(dubTracks.lang))

    const finalAudioEntries = finalTracks
      .sort((a, b) => {
        if (a.lang === "origin") return -1
        if (b.lang === "origin") return 1
        return a.lang.localeCompare(b.lang)
      })
      .map<AudioEntry>((track) => ({
        lang: track.lang,
        name: track.lang === "origin" ? "ORIGIN" : track.lang,
        uri: `audio/${track.lang}/audio.m3u8`,
        groupId: "aud",
        defaultFlag: track.lang === "origin",
      }))

    await writeMasterPlaylist({
      masterPath: path.join(outputRoot, "master.m3u8"),
      videoM3u8Rel: "video/video.m3u8",
      audioEntries: finalAudioEntries,
    })

    for (const entry of finalAudioEntries) {
      await writeMasterPlaylist({
        masterPath: path.join(outputRoot, `master_${entry.lang}.m3u8`),
        videoM3u8Rel: "video/video.m3u8",
        audioEntries: [{ ...entry, defaultFlag: true }],
      })
    }

    await uploadDirToStorage(outputRoot, basePrefix)

    await db
      .update(videos)
      .set({ masterKey, hlsStatus: "READY", hlsError: null, updatedAt: new Date() })
      .where(eq(videos.id, video.id))

    return {
      ok: true,
      videoId: video.id,
      masterUrl: cdnUrlForKey(masterKey),
      processed,
      skipped,
      tracks: finalAudioEntries.map((entry) => entry.lang),
    }
  } catch (error) {
    await db
      .update(videos)
      .set({
        hlsStatus: "FAILED",
        hlsError: error instanceof Error ? error.message : "unknown encoding error",
        updatedAt: new Date(),
      })
      .where(eq(videos.id, video.id))
    throw error
  } finally {
    await fs.rm(tmpRoot, { recursive: true, force: true }).catch(() => {})
  }
}

async function ensureOriginTrack(params: { videoId: number; sourceUrl: string }) {
  await db
    .insert(dubTracks)
    .values({
      videoId: params.videoId,
      lang: "origin",
      status: "ready",
      url: params.sourceUrl,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [dubTracks.videoId, dubTracks.lang],
      set: { status: "ready", url: params.sourceUrl, updatedAt: new Date() },
    })
}
