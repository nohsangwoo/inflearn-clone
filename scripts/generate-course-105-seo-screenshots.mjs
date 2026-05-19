import "dotenv/config"
import fs from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, "public", "course-detail-scenes")
const MODEL = "gpt-image-2"
const WIDTH = 1600
const MODEL_HEIGHT = 912
const FINAL_HEIGHT = 900
const quality = "high"

const scenes = [
  {
    slug: "search-console",
    file: "course-105-search-console.png",
    prompt: [
      "Create a high fidelity screenshot-style image of Google Search Console open in a Chrome browser on a Mac desktop.",
      "The page is the Performance on Search results report for the property https://www.lingoost.com/.",
      "It should look like a real working dashboard, not a vector mockup or illustration.",
      "Include the actual Search Console information architecture: top app bar with Search Console name, URL inspection search box, property selector, left navigation with Overview, Performance, URL inspection, Indexing, Pages, Sitemaps, Removals, Experience, Core Web Vitals, Enhancements.",
      "Main content: title Performance on Search results, filter chips for 3 months, Search type Web, Query filter for course SEO terms, metric cards for Total clicks, Total impressions, Average CTR, Average position, a realistic blue and purple line chart, and a dense bottom table with tabs Queries, Pages, Countries, Devices, Search appearance, Dates.",
      "Use plausible Korean course SEO query data for Lingoost, but keep it visually like a real Google Search Console screenshot.",
      "Crisp 16:9 composition, realistic antialiased UI, subtle browser chrome, white and light gray Google dashboard surfaces, readable interface text where possible.",
      "No fantasy art, no marketing poster, no cartoon, no giant title overlay, no watermarks.",
    ].join(" "),
  },
  {
    slug: "tag-manager",
    file: "course-105-tag-manager.png",
    prompt: [
      "Create a high fidelity screenshot-style image of Google Tag Manager open in a Chrome browser on a Mac desktop.",
      "The container is GTM-LINGOOST for a Lingoost course platform.",
      "It must look like a real GTM workspace screen, not a generic analytics dashboard.",
      "Include the actual GTM layout: top header with Tag Manager, tabs Workspace, Versions, Admin, top right Preview and Submit buttons, left sidebar with Current workspace, Overview, Tags, Triggers, Variables, Folders, Templates.",
      "Main content: Default Workspace heading, Workspace Changes card, Container Quality card, Tag Assistant / Preview connected card, and a dense Tags table.",
      "The tags should include GA4 Config, course_detail_view, preview_image_view, enrollment_click, scroll_90_percent, each with GA4 Event or GA4 Configuration type and firing triggers like All Pages or Course detail page.",
      "Use clean Google Material Design style, realistic spacing, tiny table text, light gray dividers, blue action buttons, and actual software-dashboard fidelity.",
      "Crisp 16:9 composition, realistic browser screenshot, readable enough to feel like a real operations lecture.",
      "No fantasy art, no marketing poster, no cartoon, no giant title overlay, no watermarks.",
    ].join(" "),
  },
  {
    slug: "analytics",
    file: "course-105-analytics.png",
    prompt: [
      "Create a high fidelity screenshot-style image of Google Analytics 4 open in a Chrome browser on a Mac desktop.",
      "The screen should look like a real GA4 Reports snapshot or Traffic acquisition report for the property Lingoost Web.",
      "It should be materially more realistic than a hand-drawn vector mockup.",
      "Include the actual GA4 visual language: left navigation rail with Home, Reports, Explore, Advertising, Configure; top search bar; report title; date range; multiple report cards.",
      "Main content should include a Reports snapshot or Traffic acquisition dashboard with cards for Users, New users, Sessions, Average engagement time, a blue line chart over dates, realtime users in last 30 minutes, channel table, users by country map, event count by event name, conversions/key events, and traffic acquisition table.",
      "Use plausible course platform metrics, organic search, direct, referral, paid search, course_detail_view and enrollment_request events.",
      "The image should resemble a genuine Google Analytics screenshot taken during a lecture: lots of tiny but realistic UI text, charts, grids, tables, and white Google dashboard cards.",
      "Crisp 16:9 composition, realistic antialiased UI, no over-simplified shapes, no decorative illustration.",
      "No fantasy art, no marketing poster, no cartoon, no giant title overlay, no watermarks.",
    ].join(" "),
  },
]

async function generate(scene) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing in .env")
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      prompt: scene.prompt,
      size: `${WIDTH}x${MODEL_HEIGHT}`,
      quality,
      output_format: "png",
      moderation: "auto",
    }),
    signal: AbortSignal.timeout(240_000),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI image generation failed for ${scene.slug}: ${response.status} ${error}`)
  }

  const json = await response.json()
  const base64 = json?.data?.[0]?.b64_json
  if (!base64) throw new Error(`No image payload returned for ${scene.slug}`)
  return Buffer.from(base64, "base64")
}

async function writeImage(scene, bytes) {
  const outputPath = path.join(OUT_DIR, scene.file)
  await sharp(bytes)
    .resize(WIDTH, MODEL_HEIGHT, { fit: "cover" })
    .extract({
      left: 0,
      top: Math.floor((MODEL_HEIGHT - FINAL_HEIGHT) / 2),
      width: WIDTH,
      height: FINAL_HEIGHT,
    })
    .png({ compressionLevel: 9 })
    .toFile(outputPath)

  const metadata = await sharp(outputPath).metadata()
  console.log(`[done] ${path.relative(ROOT, outputPath)} ${metadata.width}x${metadata.height}`)
}

await fs.mkdir(OUT_DIR, { recursive: true })

for (const scene of scenes) {
  console.log(`[gpt-image-2] generating ${scene.slug}`)
  const bytes = await generate(scene)
  await writeImage(scene, bytes)
}
