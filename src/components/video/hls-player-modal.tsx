"use client"

// This file now re-exports ShakaPlayerModal for better multi-language support
// The old HLS.js implementation is backed up in hls-player-modal.old.tsx
// Using Shaka Player for better HLS and DASH support

export { default } from "./shaka-player-modal"