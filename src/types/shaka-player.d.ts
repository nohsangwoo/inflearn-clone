declare module 'shaka-player/dist/shaka-player.ui.js' {
  const shaka: ShakaNamespace
  export default shaka
}

export interface ShakaPlayer {
  destroy(): Promise<void>
  load(url: string): Promise<void>
  configure(config: Record<string, unknown>): void
  addEventListener(event: string, callback: (event: ShakaEvent) => void): void
  getAudioTracks(): ShakaAudioTrack[]
  selectAudioTrack(id: number): void
  getVariantTracks(): unknown[]
  getStats(): unknown
  getConfiguration(): unknown
}

export interface ShakaAudioTrack {
  id: number
  language: string
  label?: string
  active: boolean
  roles: string[]
}

export interface ShakaEvent {
  detail?: {
    message?: string
    code?: string
  }
  buffering?: boolean
}

export interface ShakaNamespace {
  Player: {
    new (video: HTMLVideoElement): ShakaPlayer
    isBrowserSupported(): boolean
  }
}

declare global {
  interface Window {
    shaka?: ShakaNamespace
  }
}