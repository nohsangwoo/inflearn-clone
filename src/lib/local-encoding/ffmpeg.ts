import { execa } from "execa"
import fs from "node:fs"
import path from "node:path"
import ffmpegStatic from "ffmpeg-static"

export function getFfmpegPath() {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH
  if (ffmpegStatic && fs.existsSync(ffmpegStatic)) return ffmpegStatic
  return "ffmpeg"
}

export async function packageVideoHls(inputVideoPath: string, videoDir: string) {
  await fs.promises.mkdir(videoDir, { recursive: true })
  await execa(
    getFfmpegPath(),
    [
      "-y",
      "-i",
      inputVideoPath,
      "-map",
      "0:v:0",
      "-c:v",
      "libx264",
      "-profile:v",
      "main",
      "-level",
      "4.1",
      "-preset",
      "veryfast",
      "-crf",
      "23",
      "-x264-params",
      "keyint=48:min-keyint=48:scenecut=0",
      "-start_number",
      "0",
      "-hls_time",
      "4",
      "-hls_playlist_type",
      "vod",
      "-hls_segment_type",
      "fmp4",
      "-hls_fmp4_init_filename",
      "init.mp4",
      "-hls_flags",
      "independent_segments",
      "-hls_segment_filename",
      "v_%03d.m4s",
      "video.m3u8",
    ],
    { cwd: videoDir, stdio: "inherit" },
  )
}

export async function extractOriginAudio(inputVideoPath: string, outputPath: string) {
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true })
  await execa(
    getFfmpegPath(),
    ["-y", "-i", inputVideoPath, "-vn", "-acodec", "pcm_s16le", "-ar", "48000", "-ac", "2", outputPath],
    { stdio: "inherit" },
  )
}

export async function normalizeAudio(inputAudioPath: string, outputPath: string) {
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true })
  await execa(
    getFfmpegPath(),
    [
      "-y",
      "-i",
      inputAudioPath,
      "-af",
      "loudnorm=I=-16:LRA=11:TP=-1.5",
      "-ar",
      "48000",
      "-ac",
      "2",
      outputPath,
    ],
    { stdio: "inherit" },
  )
}

export async function packageAudioHls(inputAudioPath: string, audioDir: string) {
  await fs.promises.mkdir(audioDir, { recursive: true })
  await execa(
    getFfmpegPath(),
    [
      "-y",
      "-i",
      inputAudioPath,
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-ar",
      "48000",
      "-start_number",
      "0",
      "-hls_time",
      "4",
      "-hls_playlist_type",
      "vod",
      "-hls_segment_type",
      "fmp4",
      "-hls_fmp4_init_filename",
      "init.mp4",
      "-hls_flags",
      "independent_segments",
      "-hls_segment_filename",
      "a_%03d.m4s",
      "audio.m3u8",
    ],
    { cwd: audioDir, stdio: "inherit" },
  )
}
