import fs from "node:fs/promises"
import path from "node:path"

export type AudioEntry = {
  lang: string
  name: string
  uri: string
  groupId: string
  defaultFlag?: boolean
}

export async function writeMasterPlaylist(params: {
  masterPath: string
  videoM3u8Rel: string
  audioEntries: AudioEntry[]
}) {
  let output = "#EXTM3U\n"
  output += "#EXT-X-VERSION:7\n"
  output += "#EXT-X-INDEPENDENT-SEGMENTS\n"

  for (const audio of params.audioEntries) {
    output += mediaLine(audio) + "\n"
  }

  output += '#EXT-X-STREAM-INF:BANDWIDTH=2500000,CODECS="avc1.4d401f,mp4a.40.2",RESOLUTION=1920x1080,AUDIO="aud"\n'
  output += params.videoM3u8Rel + "\n"

  await fs.mkdir(path.dirname(params.masterPath), { recursive: true })
  await fs.writeFile(params.masterPath, output, "utf8")
}

function mediaLine(audio: AudioEntry) {
  const defaultFlag = audio.defaultFlag ? "YES" : "NO"
  return `#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="${audio.groupId}",NAME="${audio.name}",LANGUAGE="${audio.lang}",AUTOSELECT=YES,DEFAULT=${defaultFlag},URI="${audio.uri}"`
}
