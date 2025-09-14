import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import ffmpeg from 'fluent-ffmpeg'
// @ts-ignore - types may not include default export typing
import ffmpegStatic from 'ffmpeg-static'

// ElevenLabs 더빙 지원 언어 코드 (추정: ISO 639-1 표준 코드)
export const DUBBING_LANGUAGE_CODES = [
  'ar', // Arabic
  'bg', // Bulgarian
  'cs', // Czech
  'da', // Danish
  'de', // German
  'el', // Greek
  'en', // English
  'es', // Spanish
  'fi', // Finnish
  'fr', // French
  'he', // Hebrew
  'hi', // Hindi
  'hu', // Hungarian
  'id', // Indonesian
  'it', // Italian
  'ja', // Japanese
  'ko', // Korean
  'ms', // Malay
  'nl', // Dutch
  'no', // Norwegian
  'pl', // Polish
  'pt', // Portuguese
  'ro', // Romanian
  'ru', // Russian
  'sk', // Slovak
  'sv', // Swedish
  'th', // Thai
  'tr', // Turkish
  'uk', // Ukrainian
  'vi', // Vietnamese
  'zh', // Chinese (Generic)
  'fil', // Filipino
] as const

export type DubbingLanguageCode = typeof DUBBING_LANGUAGE_CODES[number]

// Configure ffmpeg binary path for Windows/Linux/Mac via env or ffmpeg-static; fallback to system PATH
try {
  const envFfmpeg = process.env.FFMPEG_PATH
  if (envFfmpeg && fs.existsSync(envFfmpeg)) {
    ffmpeg.setFfmpegPath(envFfmpeg)
  } else if (ffmpegStatic && fs.existsSync(ffmpegStatic as string)) {
    // @ts-ignore
    ffmpeg.setFfmpegPath(ffmpegStatic as string)
  } else {
    console.warn('[warn] ffmpeg binary not found via env or ffmpeg-static. Falling back to system ffmpeg in PATH')
  }
} catch (e) {
  console.warn('[warn] Unable to configure ffmpeg path; will rely on system PATH')
}

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
})

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function saveUnknownToFile(result: any, destPath: string): Promise<void> {
  // Node Readable Stream
  if (result && typeof (result as any).pipe === 'function') {
    await new Promise<void>((resolve, reject) => {
      const write = fs.createWriteStream(destPath)
      ;(result as any)
        .on('error', (err: any) => reject(err))
        .pipe(write)
        .on('finish', () => resolve())
        .on('error', (err: any) => reject(err))
    })
    return
  }
  // Web ReadableStream<Uint8Array>
  if (result && typeof (result as any).getReader === 'function') {
    const stream: ReadableStream<Uint8Array> = result as ReadableStream<Uint8Array>
    const reader = stream.getReader()
    await new Promise<void>(async (resolve, reject) => {
      const write = fs.createWriteStream(destPath)
      write.on('error', reject)
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          if (value) write.write(Buffer.from(value))
        }
        write.end(() => resolve())
      } catch (err) {
        reject(err)
      }
    })
    return
  }
  // URL string
  if (typeof result === 'string') {
    const res = await fetch(result)
    if (!res.ok) throw new Error(`Failed to download from url: ${result}`)
    const ab = await res.arrayBuffer()
    await fs.promises.writeFile(destPath, Buffer.from(ab))
    return
  }
  // { url: string }
  if (result && typeof result.url === 'string') {
    const res = await fetch(result.url)
    if (!res.ok) throw new Error(`Failed to download from url: ${result.url}`)
    const ab = await res.arrayBuffer()
    await fs.promises.writeFile(destPath, Buffer.from(ab))
    return
  }
  // Fetch Response-like
  if (result && typeof (result as any).arrayBuffer === 'function' && typeof (result as any).ok === 'boolean') {
    const ab = await (result as Response).arrayBuffer()
    await fs.promises.writeFile(destPath, Buffer.from(ab))
    return
  }
  // Web Blob-like
  if (result && typeof (result as any).arrayBuffer === 'function') {
    const arrayBuffer = await (result as Blob).arrayBuffer()
    await fs.promises.writeFile(destPath, Buffer.from(arrayBuffer))
    return
  }
  // Raw Buffer/Uint8Array/ArrayBuffer
  if (result && (result instanceof Uint8Array || result instanceof ArrayBuffer)) {
    const buf = result instanceof ArrayBuffer ? Buffer.from(result) : Buffer.from(result)
    await fs.promises.writeFile(destPath, buf)
    return
  }
  throw new Error('Unsupported download result type for saving to file')
}

async function main() {
  const targetLang: DubbingLanguageCode = 'ja'

  // 1) 로컬 비디오(mp4) 읽기
  const inputVideoPath = path.join(process.cwd(), 'public', 'source', 'test.mp4')
  if (!fs.existsSync(inputVideoPath)) {
    throw new Error(`입력 파일을 찾을 수 없습니다: ${inputVideoPath}`)
  }
  const publicDir = path.join(process.cwd(), 'public')
  // 비디오에서 오디오 추출
  let extractedAudioPath = path.join(publicDir, `extracted-audio.${targetLang}.m4a`)
  let extractedAudioMime = 'audio/mp4'
  console.log('비디오에서 오디오 추출 시작 (-c copy 시도)...')
  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(inputVideoPath)
        .outputOptions(['-vn', '-acodec copy'])
        .on('error', (err: any) => reject(err))
        .on('end', () => resolve())
        .save(extractedAudioPath)
    })
  } catch (e) {
    console.warn('copy 추출 실패, AAC 재인코딩으로 재시도합니다...')
    extractedAudioPath = path.join(publicDir, `extracted-audio-aac.${targetLang}.m4a`)
    extractedAudioMime = 'audio/mp4'
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(inputVideoPath)
        .outputOptions(['-vn', '-c:a aac', '-b:a 192k'])
        .on('error', (err: any) => reject(err))
        .on('end', () => resolve())
        .save(extractedAudioPath)
    })
  }
  console.log(`오디오 추출 완료: ${path.relative(process.cwd(), extractedAudioPath)}`)
  const extractedAudioBuffer = await fs.promises.readFile(extractedAudioPath)
  const extractedArrayBuffer = new ArrayBuffer(extractedAudioBuffer.byteLength)
  const extractedView = new Uint8Array(extractedArrayBuffer)
  extractedView.set(extractedAudioBuffer)
  const inputAudioBlob = new Blob([extractedArrayBuffer], { type: extractedAudioMime })

  console.log('더빙 요청 시작 (audio)...')
  // 2) ElevenLabs 더빙 생성 (추출한 오디오 업로드)
  const created = await elevenlabs.dubbing.create({
    file: inputAudioBlob,
    targetLang,
  })
  const dubbingId = (created as any).dubbingId ?? (created as any).data?.dubbingId
  if (!dubbingId) throw new Error('dubbingId를 가져오지 못했습니다')

  // 3) 상태 폴링
  while (true) {
    const meta = await elevenlabs.dubbing.get(dubbingId)
    const status = (meta as any).status ?? (meta as any).data?.status
    if (status === 'dubbed') break
    console.log('더빙 처리 중... 잠시만 기다려주세요')
    await wait(5000)
  }

  console.log('더빙 완료. 더빙 오디오 다운로드...')
  const outputVideoPath = path.join(publicDir, `dubbed-test.${targetLang}.mp4`)

  // 우선 더빙된 비디오를 직접 받아보는 시도 (SDK가 지원하는 경우)
  let savedViaDirectVideo = false
  try {
    // @ts-ignore - SDK에 video.get이 존재하는 경우 사용 (없으면 catch)
    const dubbedVideoResult = await (elevenlabs as any).dubbing.video.get(
      dubbingId,
      targetLang,
    )
    if (dubbedVideoResult) {
      await saveUnknownToFile(dubbedVideoResult, outputVideoPath)
      console.log(`더빙 비디오 저장 완료: ${path.relative(process.cwd(), outputVideoPath)}`)
      savedViaDirectVideo = true
    }
  } catch {}

  if (!savedViaDirectVideo) {
    // 4) 더빙된 오디오 다운로드 (mp3 등 오디오 트랙)
    const dubbedAudioResp = await (elevenlabs as any).dubbing.audio.get(
      dubbingId,
      targetLang,
    )
    const dubbedAudioPath = path.join(publicDir, `dubbed-audio.${targetLang}.mp3`)
    const audioDownload = (dubbedAudioResp as any).data ?? dubbedAudioResp
    await saveUnknownToFile(audioDownload, dubbedAudioPath)
    console.log(`더빙 오디오 저장 완료: ${path.relative(process.cwd(), dubbedAudioPath)}`)

    // 5) ffmpeg로 원본 비디오 + 더빙 오디오 합치기 → mp4 출력
    console.log('ffmpeg로 비디오/오디오 합성 시작...')
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(inputVideoPath)
        .input(dubbedAudioPath)
        .outputOptions(['-c:v copy', '-c:a aac', '-shortest', '-map 0:v:0', '-map 1:a:0'])
        .on('error', (err: any) => reject(err))
        .on('end', () => resolve())
        .save(outputVideoPath)
    })

    console.log(`합성 완료: ${path.relative(process.cwd(), outputVideoPath)}`)
  }
}

main()
  .then(() => console.log('done'))
  .catch(err => {
    console.error(err)
    process.exitCode = 1
  })
