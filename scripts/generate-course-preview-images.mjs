import "dotenv/config"
import fs from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, "public", "course-previews")
const MODEL = "gpt-image-2"
const CANVAS_WIDTH = 1200
const MODEL_HEIGHT = 784
const FINAL_HEIGHT = 781

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=")
    return [key, value]
  }),
)

const overwrite = args.get("overwrite") === "true"
const fallbackOnly = args.get("fallback") === "true"
const quality = args.get("quality") || "medium"
const only = args.get("only")

const courses = [
  {
    id: 101,
    title: "Build a Course Marketplace",
    subtitle: "Next.js, Drizzle, SEO and enrollment ops",
    label: "WEB PLATFORM",
    discount: "EARLY BIRD 30% OFF",
    palette: ["#171717", "#ff385c", "#f7f7f7", "#4cc9f0"],
    mood:
      "premium product dashboard, code editor panels, marketplace cards, subtle Korean edtech startup energy, clean white and black surfaces, red accent, depth, no readable text",
  },
  {
    id: 102,
    title: "HLS Video Operations",
    subtitle: "Encoding, captions, dubbing and release review",
    label: "VIDEO INFRA",
    discount: null,
    palette: ["#101828", "#00b8a9", "#f7f7f7", "#ff385c"],
    mood:
      "cinematic streaming control room, HLS ladders, waveform arcs, video thumbnails, media server glow, clean technical composition, no readable text",
  },
  {
    id: 103,
    title: "Plan AI-Era Courses",
    subtitle: "Positioning, curriculum and conversion copy",
    label: "CREATOR STRATEGY",
    discount: "COHORT DROP 34% OFF",
    palette: ["#222222", "#ff385c", "#f4f0ff", "#6c5ce7"],
    mood:
      "creative strategy studio, sticky notes, AI graph, course outline board, creator desk, editorial warm lighting, clean consumer marketplace feel, no readable text",
  },
  {
    id: 104,
    title: "Edit Courses People Finish",
    subtitle: "Retention rhythm, chapters and thumbnails",
    label: "COURSE EDITING",
    discount: "SEASON PASS 25% OFF",
    palette: ["#1c1c1c", "#ff385c", "#f7f7f7", "#ffd166"],
    mood:
      "modern video editing timeline, film frames, thumbnail selection wall, soft studio lights, elegant contrast, no readable text",
  },
  {
    id: 105,
    title: "SEO for Course Sellers",
    subtitle: "Tags, metadata, sitemap and search intent",
    label: "SEARCH GROWTH",
    discount: null,
    palette: ["#14213d", "#ff385c", "#ffffff", "#2ec4b6"],
    mood:
      "search analytics workspace, SERP cards, keyword map, sitemap nodes, bright clean marketplace layout, no readable text",
  },
  {
    id: 106,
    title: "AI Dubbing Operations",
    subtitle: "Voice tracks, captions and multilingual QA",
    label: "AI LOCALIZATION",
    discount: "LAUNCH 17% OFF",
    palette: ["#111827", "#ff385c", "#e8f7ff", "#8bd3dd"],
    mood:
      "audio waveform studio, multilingual captions, voice track mixer, AI dubbing console, futuristic but friendly, no readable text",
  },
  {
    id: 107,
    title: "Instructor Ledger Ops",
    subtitle: "Bank transfer approval and payout queues",
    label: "OPERATIONS",
    discount: "FOUNDERS FREE",
    palette: ["#212529", "#ff385c", "#f7fff7", "#2a9d8f"],
    mood:
      "clean financial operations dashboard, ledger rows, bank transfer confirmations, payout queue, trustworthy marketplace admin feel, no readable text",
  },
  {
    id: 108,
    title: "Launch Your First Course",
    subtitle: "From public lesson to paid curriculum",
    label: "FIRST LAUNCH",
    discount: "OPENING 29% OFF",
    palette: ["#202020", "#ff385c", "#fff8e8", "#3a86ff"],
    mood:
      "creator launch desk, checklist, camera, course landing page mockups, optimistic sunrise lighting, premium consumer education feel, no readable text",
  },
]

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function wrapWords(text, maxChars) {
  const words = text.split(" ")
  const lines = []
  let current = ""
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  return lines.slice(0, 3)
}

function overlaySvg(course) {
  const [ink, accent, surface, aux] = course.palette
  const titleLines = wrapWords(course.title, 24)
  const titleTspans = titleLines
    .map((line, index) => `<tspan x="72" dy="${index === 0 ? 0 : 68}">${escapeXml(line)}</tspan>`)
    .join("")
  const hasDiscount = Boolean(course.discount)
  return Buffer.from(`
<svg width="${CANVAS_WIDTH}" height="${FINAL_HEIGHT}" viewBox="0 0 ${CANVAS_WIDTH} ${FINAL_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000000" stop-opacity="0.72"/>
      <stop offset="0.48" stop-color="#000000" stop-opacity="0.34"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.06"/>
    </linearGradient>
    <linearGradient id="hot" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${accent}"/>
      <stop offset="1" stop-color="${aux}"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.24"/>
    </filter>
  </defs>
  <rect width="${CANVAS_WIDTH}" height="${FINAL_HEIGHT}" fill="url(#scrim)"/>
  <rect x="40" y="40" width="1120" height="701" rx="34" fill="none" stroke="rgba(255,255,255,0.42)" stroke-width="2"/>
  <g filter="url(#softShadow)">
    <rect x="72" y="74" width="190" height="42" rx="21" fill="${surface}" fill-opacity="0.92"/>
    <text x="96" y="101" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" fill="${ink}" letter-spacing="1.8">LINGOOST</text>
  </g>
  <rect x="72" y="142" width="${Math.max(190, course.label.length * 12 + 52)}" height="42" rx="21" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.45)"/>
  <text x="96" y="169" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" fill="#ffffff" letter-spacing="1.2">${escapeXml(course.label)}</text>
  <text x="72" y="310" font-family="Inter, Arial, sans-serif" font-size="68" font-weight="900" fill="#ffffff" letter-spacing="-1">${titleTspans}</text>
  <text x="76" y="${titleLines.length > 1 ? 472 : 404}" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="650" fill="rgba(255,255,255,0.88)">${escapeXml(course.subtitle)}</text>
  <g transform="translate(72 ${hasDiscount ? 548 : 520})">
    ${
      hasDiscount
        ? `<rect width="350" height="70" rx="35" fill="url(#hot)"/>
           <text x="30" y="45" font-family="Inter, Arial, sans-serif" font-size="27" font-weight="950" fill="#ffffff" letter-spacing="-0.3">${escapeXml(course.discount)}</text>`
        : `<rect width="265" height="62" rx="31" fill="rgba(255,255,255,0.94)"/>
           <text x="28" y="40" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="900" fill="${ink}">NOW ENROLLING</text>`
    }
  </g>
  <g transform="translate(72 660)">
    <circle cx="15" cy="15" r="15" fill="${accent}"/>
    <circle cx="55" cy="15" r="15" fill="${aux}"/>
    <circle cx="95" cy="15" r="15" fill="${surface}"/>
    <text x="132" y="23" font-family="Inter, Arial, sans-serif" font-size="21" font-weight="750" fill="#ffffff">Spring 2026 Cohort</text>
  </g>
</svg>`)
}

function fallbackSvg(course) {
  const [ink, accent, surface, aux] = course.palette
  return Buffer.from(`
<svg width="${CANVAS_WIDTH}" height="${MODEL_HEIGHT}" viewBox="0 0 ${CANVAS_WIDTH} ${MODEL_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${ink}"/>
      <stop offset="0.58" stop-color="${accent}" stop-opacity="0.88"/>
      <stop offset="1" stop-color="${surface}"/>
    </linearGradient>
    <radialGradient id="glow" cx="72%" cy="40%" r="58%">
      <stop offset="0" stop-color="${aux}" stop-opacity="0.82"/>
      <stop offset="1" stop-color="${ink}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${CANVAS_WIDTH}" height="${MODEL_HEIGHT}" fill="url(#bg)"/>
  <rect width="${CANVAS_WIDTH}" height="${MODEL_HEIGHT}" fill="url(#glow)"/>
  <g opacity="0.32" fill="none" stroke="#ffffff" stroke-width="3">
    <rect x="670" y="120" width="390" height="250" rx="32"/>
    <rect x="740" y="420" width="280" height="110" rx="26"/>
    <path d="M650 610 C780 540 900 690 1110 570"/>
    <path d="M730 172 H1000 M730 232 H970 M730 292 H1034"/>
  </g>
</svg>`)
}

async function generateBackground(course) {
  if (fallbackOnly) return fallbackSvg(course)
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing. Use --fallback to generate local placeholder backgrounds.")
  }
  const prompt = [
    `Create a premium online-course thumbnail background for "${course.title}".`,
    course.mood,
    "No readable words, no logos, no brand names, no subtitles, no watermark.",
    "Leave generous darker negative space on the left for title typography.",
    "Composition should feel like a polished 2026 consumer education marketplace, not a corporate SaaS banner.",
  ].join(" ")

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      size: `${CANVAS_WIDTH}x${MODEL_HEIGHT}`,
      quality,
      output_format: "png",
      moderation: "auto",
    }),
    signal: AbortSignal.timeout(180_000),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`OpenAI image generation failed for ${course.id}: ${response.status} ${text}`)
  }
  const json = await response.json()
  const base64 = json?.data?.[0]?.b64_json
  if (!base64) throw new Error(`No image payload returned for ${course.id}`)
  return Buffer.from(base64, "base64")
}

async function compose(course, backgroundBytes, outputPath) {
  const background = await sharp(backgroundBytes)
    .resize(CANVAS_WIDTH, MODEL_HEIGHT, { fit: "cover" })
    .extract({ left: 0, top: 0, width: CANVAS_WIDTH, height: FINAL_HEIGHT })
    .png()
    .toBuffer()

  await sharp(background)
    .composite([{ input: overlaySvg(course), left: 0, top: 0 }])
    .png({ compressionLevel: 9 })
    .toFile(outputPath)
}

await fs.mkdir(OUT_DIR, { recursive: true })

const selected = courses.filter((course) => !only || String(course.id) === String(only))

for (const course of selected) {
  const outputPath = path.join(OUT_DIR, `course-${course.id}.png`)
  if (!overwrite) {
    try {
      await fs.access(outputPath)
      console.log(`[skip] ${course.id} ${outputPath}`)
      continue
    } catch {
      // continue
    }
  }
  console.log(`[generate] ${course.id} ${course.title}`)
  const backgroundBytes = await generateBackground(course)
  await compose(course, backgroundBytes, outputPath)
  const metadata = await sharp(outputPath).metadata()
  console.log(`[done] ${path.relative(ROOT, outputPath)} ${metadata.width}x${metadata.height}`)
}
