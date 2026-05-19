import fs from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, "public", "course-detail-scenes")
const WIDTH = 1600
const HEIGHT = 900

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=")
    return [key, value]
  }),
)

const only = args.get("only")

const scenes = [
  {
    id: 101,
    os: "mac",
    accent: "#ff385c",
    title: "Course Marketplace Build",
    subtitle: "Live coding Next.js, Drizzle and enrollment approval",
    wallpaper: ["#f8fbff", "#ffe8ee", "#edf7ff"],
    windows: [
      { type: "vscode", x: 54, y: 92, w: 640, h: 530, title: "lingoost-web - Visual Studio Code", file: "src/app/[locale]/course/[id]/page.tsx", active: "course detail", code: ["const lecture = await db.query.lectures.findFirst({", "  where: eq(lectures.id, lectureId),", "  with: { curriculums: true, instructor: true },", "})", "", "return <CourseDetailPage initialDetail={detail} />"] },
      { type: "browser", x: 642, y: 118, w: 900, h: 494, title: "Safari - lingoost.com/ko/course/101", heading: "Next.js로 강의 거래소 만들기", subheading: "상품, 수강신청, 계좌입금 승인, SEO까지 웹 플랫폼의 뼈대를 완성합니다.", chips: ["OPEN", "27/40 seats", "₩70,000", "SEO Ready"], layout: "course" },
      { type: "terminal", x: 108, y: 646, w: 640, h: 180, title: "Terminal - build check", lines: ["pnpm lint", "0 errors, 66 existing warnings", "pnpm build", "✓ Next.js production build completed"] },
      { type: "database", x: 780, y: 646, w: 690, h: 180, title: "Neon SQL Editor - lectures", columns: ["id", "title", "status", "seats"], rows: [["101", "Marketplace", "OPEN", "27/40"], ["102", "HLS Ops", "FULL", "24/24"], ["108", "First Launch", "WAITING", "0/45"]] },
    ],
  },
  {
    id: 102,
    os: "windows",
    accent: "#22d3ee",
    title: "HLS Video Operations",
    subtitle: "Encoding, captions and playback QA on a local workstation",
    wallpaper: ["#07111f", "#11263f", "#0c6475"],
    windows: [
      { type: "video", x: 64, y: 96, w: 760, h: 456, title: "Course Preview Player", heading: "Master playlist QA", subheading: "1080p / 720p / 480p variants", dark: true },
      { type: "terminal", x: 850, y: 96, w: 680, h: 456, title: "Windows Terminal - ffmpeg", lines: ["ffmpeg -i input.mp4 -filter:v scale=1920:1080", "variant 1080p  5.4Mbps  segment: 6s", "variant 720p   2.8Mbps  segment: 6s", "variant 480p   1.2Mbps  segment: 6s", "writing master.m3u8 ... done"] },
      { type: "files", x: 86, y: 584, w: 600, h: 210, title: "File Explorer - hls-output", files: ["master.m3u8", "1080p/index.m3u8", "720p/index.m3u8", "480p/index.m3u8", "captions/ko.vtt"] },
      { type: "qa", x: 720, y: 584, w: 760, h: 210, title: "Playback QA Checklist", items: ["Safari native HLS", "Chrome hls.js fallback", "Caption track toggle", "CORS and MIME types", "Seek test passed"] },
    ],
  },
  {
    id: 103,
    os: "mac",
    accent: "#8b5cf6",
    title: "AI-Era Course Planning",
    subtitle: "Positioning, curriculum and conversion copy review",
    wallpaper: ["#fbf7ff", "#efe7ff", "#fff6e7"],
    windows: [
      { type: "board", x: 58, y: 96, w: 850, h: 548, title: "Notion - Course Offer Canvas", columns: [["Problem", "Who is stuck?", "What job is urgent?", "What proof is credible?"], ["Promise", "Build one landing page", "Launch one paid cohort", "Get real feedback"], ["Lessons", "Research", "Offer", "Outline", "Sales page", "Launch"]] },
      { type: "assistant", x: 936, y: 116, w: 554, h: 392, title: "AI Draft Review", notes: ["Audience: first-time creators", "Outcome: publish a paid course", "Risk: too broad", "Next step: narrow the promise"] },
      { type: "search", x: 936, y: 536, w: 554, h: 276, title: "Search intent notes", query: "온라인 강의 판매 시작", results: ["First course launch checklist", "Course pricing examples", "How to structure curriculum"] },
    ],
  },
  {
    id: 104,
    os: "windows",
    accent: "#ffb703",
    title: "Retention Editing Timeline",
    subtitle: "Chapter markers, audio cleanup and thumbnail selection",
    wallpaper: ["#0d1117", "#1a1a2e", "#3b2f18"],
    windows: [
      { type: "editor", x: 60, y: 96, w: 1480, h: 632, title: "DaVinci Resolve - lesson-retention-edit", dark: true },
      { type: "qa", x: 94, y: 748, w: 720, h: 92, title: "Edit notes", items: ["Cut silence before demo", "Zoom on code at 02:18", "Normalize voice -16 LUFS"] },
      { type: "files", x: 846, y: 748, w: 604, h: 92, title: "Export queue", files: ["lesson-03-clean.mp4", "thumbnail-frame-02.png", "captions-ko.vtt"] },
    ],
  },
  {
    id: 105,
    os: "mac",
    accent: "#1a73e8",
    title: "Course Detail SEO Control Room",
    subtitle: "Search Console, Tag Manager and GA4 checks for a published course",
    wallpaper: ["#f8fbff", "#eef4ff", "#fffaf0"],
    showRecording: false,
    titleY: 64,
    subtitleY: 91,
    windows: [
      { type: "gsc", x: 56, y: 120, w: 730, h: 416, title: "Chrome - Google Search Console", property: "https://www.lingoost.com/", query: "강의 상세 SEO 최적화", pages: ["/ko/course/105", "/ko/course/108", "/ko"], clicks: "1.42K", impressions: "38.6K", ctr: "3.7%", position: "8.4" },
      { type: "gtm", x: 822, y: 120, w: 690, h: 430, title: "Chrome - Google Tag Manager", container: "GTM-LINGOOST", tags: ["GA4 Config", "course_detail_view", "preview_image_view", "enrollment_click"] },
      { type: "ga4", x: 118, y: 568, w: 1364, h: 258, title: "Chrome - Google Analytics", report: "GA4 · Course detail acquisition", events: [["course_detail_view", "8,924"], ["enrollment_request", "416"], ["preview_image_view", "2,188"], ["scroll_90_percent", "1,052"]] },
    ],
  },
  {
    id: 106,
    os: "mac",
    accent: "#a78bfa",
    title: "Dubbing QA Console",
    subtitle: "Voice tracks, subtitle sync and approval review",
    wallpaper: ["#111827", "#211b36", "#2b224a"],
    windows: [
      { type: "video", x: 70, y: 100, w: 600, h: 384, title: "Course Video - localization preview", heading: "Voice track preview", subheading: "Original + English dub", dark: true },
      { type: "audio", x: 700, y: 100, w: 820, h: 384, title: "Logic Pro - dubbing tracks", tracks: ["Original KO", "English Dub", "Japanese Draft", "Room Tone"] },
      { type: "captions", x: 82, y: 518, w: 588, h: 284, title: "Subtitle timing", rows: ["00:01:12  Intro synced", "00:03:48  Needs review", "00:05:20  Term fixed", "00:08:04  Approved"] },
      { type: "qa", x: 700, y: 518, w: 820, h: 284, title: "Localization QA", items: ["Pronunciation", "Timing", "Tone", "Technical terms", "Final approval"] },
    ],
  },
  {
    id: 107,
    os: "windows",
    accent: "#ff385c",
    title: "Instructor Ledger Review",
    subtitle: "Bank transfer approval and payout readiness",
    wallpaper: ["#f7f7f7", "#fff0f3", "#e7f0ff"],
    windows: [
      { type: "browser", x: 70, y: 96, w: 1450, h: 218, title: "Lingoost Master - Operations Summary", heading: "수강 승인 대기", subheading: "입금 확인 후 수강 권한을 부여합니다.", chips: ["18 waiting", "126 approved", "₩3.24M payout", "fee 0%"], layout: "metrics" },
      { type: "database", x: 70, y: 344, w: 940, h: 456, title: "Enrollment Requests", columns: ["student", "course", "amount", "status"], rows: [["minji@...", "Ledger Ops", "₩35,000", "Waiting"], ["hyun@...", "HLS Ops", "₩129,000", "Approved"], ["seo@...", "First Launch", "₩49,000", "Waiting"], ["jin@...", "Marketplace", "₩70,000", "Approved"]] },
      { type: "modal", x: 1042, y: 344, w: 478, h: 456, title: "Confirm Deposit", rows: ["Bank: Toss Bank", "Holder: Lingoost Studio", "Amount: ₩49,000", "Grant course access after approval"] },
    ],
  },
  {
    id: 108,
    os: "mac",
    accent: "#3b82f6",
    title: "First Course Launch Room",
    subtitle: "A real instructor workspace for publishing the first cohort",
    wallpaper: ["#eef6ff", "#fff7ed", "#edf2ff"],
    titleY: 64,
    subtitleY: 91,
    windows: [
      { type: "browser", x: 58, y: 120, w: 760, h: 504, title: "Safari - lingoost.com/ko/admin/courses/new", heading: "새 강의 만들기", subheading: "초보 판매자용 첫 강의 출시", chips: ["비공개 저장", "모집 예정", "₩49,000", "SEO draft"], layout: "admin" },
      { type: "form", x: 850, y: 120, w: 650, h: 352, title: "Course Setup Form", fields: ["Course title", "Short description", "Preview image", "Enrollment period", "Bank account"] },
      { type: "calendar", x: 850, y: 500, w: 650, h: 304, title: "Cohort launch calendar", steps: ["Outline", "Preview", "Publish", "Enroll", "First class"] },
      { type: "files", x: 108, y: 652, w: 690, h: 168, title: "Finder - first-course-assets", files: ["intro-lesson.mp4", "preview-image.png", "curriculum-outline.pdf", "launch-checklist.xlsx"] },
    ],
  },
]

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function text(x, y, content, options = {}) {
  const size = options.size ?? 20
  const weight = options.weight ?? 600
  const fill = options.fill ?? "#222222"
  const anchor = options.anchor ? ` text-anchor="${options.anchor}"` : ""
  return `<text x="${x}" y="${y}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}"${anchor}>${escapeXml(content)}</text>`
}

function rect(x, y, w, h, options = {}) {
  const rx = options.rx ?? 16
  const fill = options.fill ?? "none"
  const stroke = options.stroke ? ` stroke="${options.stroke}"` : ""
  const sw = options.strokeWidth ? ` stroke-width="${options.strokeWidth}"` : ""
  const opacity = options.opacity == null ? "" : ` opacity="${options.opacity}"`
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${stroke}${sw}${opacity}/>`
}

function line(x1, y1, x2, y2, options = {}) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${options.stroke ?? "#dddddd"}" stroke-width="${options.width ?? 2}" stroke-linecap="round" opacity="${options.opacity ?? 1}"/>`
}

function colors(scene) {
  const dark = ["windows"].includes(scene.os) && scene.wallpaper[0].startsWith("#0") || scene.id === 106
  return {
    dark,
    accent: scene.accent,
    ink: dark ? "#f7f7f7" : "#222222",
    body: dark ? "#cbd5e1" : "#3f3f3f",
    muted: dark ? "#94a3b8" : "#6a6a6a",
    surface: dark ? "#151b27" : "#ffffff",
    soft: dark ? "#202938" : "#f7f7f7",
    border: dark ? "#334155" : "#dddddd",
    chrome: dark ? "#0f172a" : "#f5f5f7",
    code: "#0b1020",
  }
}

function menuBar(scene, c) {
  if (scene.os === "windows") {
    return [
      rect(0, HEIGHT - 54, WIDTH, 54, { rx: 0, fill: "rgba(15,23,42,0.92)" }),
      rect(18, HEIGHT - 42, 30, 30, { rx: 6, fill: "#2563eb" }),
      text(70, HEIGHT - 20, "Search", { size: 15, weight: 500, fill: "#cbd5e1" }),
      ...["Code", "Browser", "Terminal", "Files"].map((item, i) => {
        const x = 170 + i * 106
        return `${rect(x, HEIGHT - 42, 88, 30, { rx: 8, fill: i === 1 ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.08)" })}${text(x + 44, HEIGHT - 21, item, { size: 13, weight: 700, fill: "#e5e7eb", anchor: "middle" })}`
      }).join(""),
      text(WIDTH - 160, HEIGHT - 22, "Tue 10:24 AM", { size: 14, weight: 600, fill: "#e5e7eb" }),
    ].join("")
  }

  return [
    rect(0, 0, WIDTH, 34, { rx: 0, fill: "rgba(255,255,255,0.74)" }),
    text(24, 23, "●", { size: 16, weight: 900, fill: c.ink }),
    text(54, 23, "Lingoost Studio", { size: 15, weight: 800, fill: c.ink }),
    text(188, 23, "File", { size: 14, weight: 600, fill: c.body }),
    text(238, 23, "Edit", { size: 14, weight: 600, fill: c.body }),
    text(290, 23, "View", { size: 14, weight: 600, fill: c.body }),
    text(344, 23, "Window", { size: 14, weight: 600, fill: c.body }),
    text(WIDTH - 178, 23, "Tue 10:24 AM", { size: 14, weight: 700, fill: c.body }),
  ].join("")
}

function dock(scene) {
  if (scene.os === "windows") return ""
  const apps = ["#0ea5e9", "#111827", "#ff385c", "#10b981", "#f59e0b", "#8b5cf6"]
  return [
    rect(560, 828, 480, 54, { rx: 22, fill: "rgba(255,255,255,0.62)", stroke: "rgba(255,255,255,0.7)" }),
    ...apps.map((fill, i) => `<rect x="${586 + i * 72}" y="840" width="34" height="34" rx="10" fill="${fill}"/>`).join(""),
  ].join("")
}

function recordingBadge(scene) {
  return [
    rect(WIDTH - 324, 48, 268, 44, { rx: 22, fill: "rgba(17,24,39,0.82)" }),
    `<circle cx="${WIDTH - 292}" cy="70" r="8" fill="#ef4444"/>`,
    text(WIDTH - 274, 76, "REC 00:18:42  ·  Lingoost class", { size: 15, weight: 800, fill: "#ffffff" }),
  ].join("")
}

function windowChrome(w, scene, c, content) {
  const clip = `clip-${scene.id}-${w.x}-${w.y}`
  const darkWindow = w.dark || c.dark || ["vscode", "terminal", "editor", "audio"].includes(w.type)
  const surface = darkWindow ? "#111827" : "#ffffff"
  const chrome = darkWindow ? "#0b1020" : "#f7f7f7"
  return `
  <g filter="url(#windowShadow)">
    ${rect(w.x, w.y, w.w, w.h, { rx: 18, fill: surface, stroke: darkWindow ? "#334155" : "#d6d6d6" })}
  </g>
  <clipPath id="${clip}"><rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" rx="18"/></clipPath>
  <g clip-path="url(#${clip})">
    ${rect(w.x, w.y, w.w, 42, { rx: 18, fill: chrome })}
    ${line(w.x, w.y + 42, w.x + w.w, w.y + 42, { stroke: darkWindow ? "#243044" : "#e5e5e5", width: 1 })}
    ${scene.os === "mac"
      ? `<circle cx="${w.x + 24}" cy="${w.y + 21}" r="6" fill="#ff5f57"/><circle cx="${w.x + 44}" cy="${w.y + 21}" r="6" fill="#ffbd2e"/><circle cx="${w.x + 64}" cy="${w.y + 21}" r="6" fill="#28c840"/>`
      : `<rect x="${w.x + w.w - 102}" y="${w.y + 12}" width="12" height="12" fill="none" stroke="${darkWindow ? "#94a3b8" : "#6a6a6a"}"/><line x1="${w.x + w.w - 58}" y1="${w.y + 18}" x2="${w.x + w.w - 42}" y2="${w.y + 18}" stroke="${darkWindow ? "#94a3b8" : "#6a6a6a"}" stroke-width="2"/><line x1="${w.x + w.w - 24}" y1="${w.y + 14}" x2="${w.x + w.w - 12}" y2="${w.y + 26}" stroke="#ef4444" stroke-width="2"/><line x1="${w.x + w.w - 12}" y1="${w.y + 14}" x2="${w.x + w.w - 24}" y2="${w.y + 26}" stroke="#ef4444" stroke-width="2"/>`
    }
    ${text(w.x + 88, w.y + 27, w.title, { size: 14, weight: 700, fill: darkWindow ? "#cbd5e1" : "#3f3f3f" })}
    ${content}
  </g>`
}

function renderVscode(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  const fileY = y + 36
  const rows = w.code ?? []
  const lines = rows.map((row, i) => {
    const ty = fileY + 62 + i * 34
    const fill = row.includes("const") || row.includes("return") ? "#7dd3fc" : row.includes("where") || row.includes("with") ? "#f9a8d4" : "#d1d5db"
    return `${text(x + 212, ty, String(i + 12).padStart(2, " "), { size: 16, weight: 700, fill: "#64748b", anchor: "end" })}${text(x + 232, ty, row, { size: 18, weight: 600, fill })}`
  }).join("")
  return windowChrome(w, scene, c, `
    ${rect(x, y, 64, w.h - 42, { rx: 0, fill: "#0f172a" })}
    ${rect(x + 64, y, 166, w.h - 42, { rx: 0, fill: "#111827" })}
    ${text(x + 84, y + 32, "EXPLORER", { size: 12, weight: 900, fill: "#94a3b8" })}
    ${["app", "components", "db", "lib", "page.tsx"].map((item, i) => text(x + 88, y + 70 + i * 28, item, { size: 14, weight: i === 4 ? 850 : 600, fill: i === 4 ? scene.accent : "#cbd5e1" })).join("")}
    ${rect(x + 230, y, w.w - 230, w.h - 42, { rx: 0, fill: "#0b1020" })}
    ${rect(x + 230, y, 260, 36, { rx: 0, fill: "#111827" })}
    ${text(x + 250, y + 24, w.file, { size: 13, weight: 700, fill: "#cbd5e1" })}
    ${lines}
    ${rect(x + w.w - 216, y + w.h - 118, 176, 42, { rx: 21, fill: scene.accent })}
    ${text(x + w.w - 128, y + w.h - 91, "Live coding", { size: 15, weight: 900, fill: "#ffffff", anchor: "middle" })}
  `)
}

function renderBrowser(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  const soft = "#f7f7f7"
  const chipW = Math.max(108, Math.floor((w.w - 88) / Math.max(1, w.chips.length)) - 12)
  const content = [
    rect(x + 26, y + 18, w.w - 52, 32, { rx: 16, fill: "#f1f5f9" }),
    text(x + 48, y + 40, w.title.replace(/^Safari - /, ""), { size: 13, weight: 700, fill: "#64748b" }),
    rect(x + 32, y + 74, w.w - 64, w.h - 138, { rx: 22, fill: "#ffffff", stroke: "#e5e7eb" }),
  ]

  if (w.layout === "serp") {
    content.push(
      text(x + 70, y + 138, w.heading, { size: 24, weight: 850, fill: "#1a0dab" }),
      text(x + 70, y + 174, "https://www.lingoost.com/ko/course/105", { size: 15, weight: 700, fill: "#188038" }),
      text(x + 70, y + 218, w.subheading, { size: 17, weight: 550, fill: "#3f3f3f" }),
      rect(x + 70, y + 258, 126, 34, { rx: 17, fill: scene.accent }),
      text(x + 133, y + 281, "Indexable", { size: 14, weight: 900, fill: "#ffffff", anchor: "middle" }),
    )
  } else if (w.layout === "metrics") {
    content.push(
      text(x + 64, y + 130, w.heading, { size: 30, weight: 900, fill: "#222222" }),
      text(x + 64, y + 164, w.subheading, { size: 18, weight: 550, fill: "#6a6a6a" }),
      ...w.chips.map((chip, i) => {
        const cx = x + 64 + i * 318
        return `${rect(cx, y + 196, 280, 74, { rx: 20, fill: i === 0 ? "#fff0f3" : soft, stroke: "#e5e7eb" })}${text(cx + 24, y + 225, chip.split(" ")[0], { size: 18, weight: 850, fill: i === 0 ? scene.accent : "#222222" })}${text(cx + 24, y + 253, chip.replace(chip.split(" ")[0], "").trim() || "today", { size: 15, weight: 650, fill: "#6a6a6a" })}`
      }),
    )
  } else if (w.layout === "admin") {
    content.push(
      text(x + 64, y + 126, w.heading, { size: 30, weight: 900, fill: "#222222" }),
      rect(x + 64, y + 154, w.w - 128, 46, { rx: 12, fill: "#ffffff", stroke: "#dddddd" }),
      text(x + 82, y + 184, w.subheading, { size: 18, weight: 700, fill: "#222222" }),
      ...w.chips.map((chip, i) => `${rect(x + 64 + i * 162, y + 224, 142, 40, { rx: 20, fill: i === 0 ? "#fff0f3" : "#f7f7f7", stroke: "#e5e7eb" })}${text(x + 135 + i * 162, y + 250, chip, { size: 14, weight: 850, fill: i === 0 ? scene.accent : "#3f3f3f", anchor: "middle" })}`).join(""),
      rect(x + 64, y + 296, w.w - 128, 114, { rx: 18, fill: "#f7f7f7" }),
      text(x + 88, y + 330, "Curriculum", { size: 18, weight: 900, fill: "#222222" }),
      ...["Intro lesson", "Preview image", "Enrollment guide"].map((item, i) => `${rect(x + 90, y + 350 + i * 28, 22, 22, { rx: 11, fill: scene.accent })}${text(x + 124, y + 367 + i * 28, item, { size: 15, weight: 650, fill: "#3f3f3f" })}`).join(""),
    )
  } else {
    content.push(
      rect(x + 64, y + 98, w.w - 128, 116, { rx: 24, fill: "#111827" }),
      text(x + 94, y + 146, w.heading, { size: 30, weight: 900, fill: "#ffffff" }),
      text(x + 94, y + 184, w.subheading, { size: 17, weight: 550, fill: "#cbd5e1" }),
      ...w.chips.map((chip, i) => `${rect(x + 64 + i * (chipW + 12), y + 248, chipW, 72, { rx: 18, fill: i === 0 ? scene.accent : soft, stroke: "#e5e7eb" })}${text(x + 64 + i * (chipW + 12) + chipW / 2, y + 291, chip, { size: 15, weight: 850, fill: i === 0 ? "#ffffff" : "#222222", anchor: "middle" })}`).join(""),
      rect(x + 64, y + 354, w.w - 128, 22, { rx: 11, fill: "#e5e7eb" }),
      rect(x + 64, y + 354, (w.w - 128) * 0.58, 22, { rx: 11, fill: scene.accent }),
    )
  }
  return windowChrome(w, scene, c, content.join(""))
}

function renderTerminal(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  return windowChrome(w, scene, c, `
    ${rect(x + 22, y + 22, w.w - 44, w.h - 70, { rx: 14, fill: "#020617" })}
    ${(w.lines ?? []).map((lineText, i) => text(x + 44, y + 58 + i * 32, `$ ${lineText}`, { size: 16, weight: 700, fill: i === (w.lines?.length ?? 0) - 1 ? "#86efac" : "#d1d5db" })).join("")}
  `)
}

function renderDatabase(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  const colW = (w.w - 70) / w.columns.length
  return windowChrome(w, scene, c, `
    ${rect(x + 22, y + 24, w.w - 44, 42, { rx: 12, fill: "#f8fafc" })}
    ${w.columns.map((col, i) => text(x + 40 + i * colW, y + 52, col, { size: 14, weight: 900, fill: "#64748b" })).join("")}
    ${w.rows.map((row, ri) => {
      const yy = y + 94 + ri * 42
      return `${line(x + 28, yy - 26, x + w.w - 28, yy - 26, { stroke: "#e5e7eb", width: 1 })}${row.map((cell, ci) => text(x + 40 + ci * colW, yy, cell, { size: 16, weight: ci === 0 ? 850 : 650, fill: ci === row.length - 1 ? scene.accent : "#222222" })).join("")}`
    }).join("")}
  `)
}

function renderFiles(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  return windowChrome(w, scene, c, `
    ${rect(x + 22, y + 22, 128, w.h - 68, { rx: 12, fill: c.dark ? "#111827" : "#f8fafc" })}
    ${["Recent", "Desktop", "Projects"].map((item, i) => text(x + 42, y + 58 + i * 30, item, { size: 14, weight: 700, fill: c.dark ? "#cbd5e1" : "#64748b" })).join("")}
    ${(w.files ?? []).map((file, i) => {
      const fx = x + 180 + (i % 3) * 150
      const fy = y + 34 + Math.floor(i / 3) * 66
      return `${rect(fx, fy, 126, 48, { rx: 12, fill: c.dark ? "#1f2937" : "#ffffff", stroke: c.dark ? "#334155" : "#e5e7eb" })}${text(fx + 12, fy + 30, file, { size: 12, weight: 800, fill: c.dark ? "#e5e7eb" : "#222222" })}`
    }).join("")}
  `)
}

function renderQa(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  return windowChrome(w, scene, c, `
    ${(w.items ?? []).map((item, i) => {
      const yy = y + 48 + i * Math.min(42, (w.h - 86) / Math.max(1, w.items.length))
      return `<circle cx="${x + 48}" cy="${yy - 7}" r="11" fill="${scene.accent}"/>${text(x + 48, yy - 2, "✓", { size: 13, weight: 900, fill: "#ffffff", anchor: "middle" })}${text(x + 74, yy, item, { size: 17, weight: 750, fill: c.dark ? "#f8fafc" : "#222222" })}`
    }).join("")}
  `)
}

function renderVideo(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  const cx = x + w.w / 2
  const cy = y + (w.h - 42) / 2
  return windowChrome(w, scene, c, `
    <defs><linearGradient id="video-${scene.id}-${x}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f172a"/><stop offset="1" stop-color="${scene.accent}"/></linearGradient></defs>
    ${rect(x + 22, y + 22, w.w - 44, w.h - 104, { rx: 18, fill: `url(#video-${scene.id}-${x})` })}
    <circle cx="${cx}" cy="${cy - 18}" r="54" fill="rgba(255,255,255,0.92)"/>
    <path d="M${cx - 16} ${cy - 42} L${cx + 28} ${cy - 18} L${cx - 16} ${cy + 6} Z" fill="${scene.accent}"/>
    ${text(x + 54, y + w.h - 102, w.heading, { size: 24, weight: 900, fill: c.dark ? "#f8fafc" : "#222222" })}
    ${text(x + 54, y + w.h - 68, w.subheading, { size: 17, weight: 600, fill: c.dark ? "#cbd5e1" : "#6a6a6a" })}
    ${rect(x + 54, y + w.h - 42, w.w - 108, 10, { rx: 5, fill: c.dark ? "#334155" : "#e5e7eb" })}
    ${rect(x + 54, y + w.h - 42, (w.w - 108) * 0.42, 10, { rx: 5, fill: scene.accent })}
  `)
}

function renderBoard(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  const colW = (w.w - 88) / w.columns.length
  return windowChrome(w, scene, c, `
    ${w.columns.map((col, ci) => {
      const cx = x + 28 + ci * (colW + 16)
      return `${rect(cx, y + 28, colW, w.h - 96, { rx: 18, fill: "#f8fafc", stroke: "#e5e7eb" })}${text(cx + 20, y + 64, col[0], { size: 18, weight: 900, fill: "#222222" })}${col.slice(1).map((item, i) => `${rect(cx + 16, y + 88 + i * 82, colW - 32, 56, { rx: 14, fill: ci === 1 ? scene.accent : "#ffffff", stroke: ci === 1 ? scene.accent : "#e5e7eb" })}${text(cx + 32, y + 122 + i * 82, item, { size: 15, weight: 800, fill: ci === 1 ? "#ffffff" : "#222222" })}`).join("")}`
    }).join("")}
  `)
}

function renderAssistant(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  return windowChrome(w, scene, c, `
    ${rect(x + 28, y + 28, w.w - 56, 86, { rx: 18, fill: scene.accent })}
    ${text(x + 54, y + 64, "Reviewing course positioning", { size: 21, weight: 900, fill: "#ffffff" })}
    ${text(x + 54, y + 94, "Draft notes are ready for editing.", { size: 15, weight: 600, fill: "rgba(255,255,255,0.86)" })}
    ${(w.notes ?? []).map((note, i) => `${rect(x + 30, y + 146 + i * 52, w.w - 60, 36, { rx: 10, fill: "#ffffff", stroke: "#e5e7eb" })}${text(x + 48, y + 170 + i * 52, note, { size: 15, weight: 750, fill: "#222222" })}`).join("")}
  `)
}

function renderSearch(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  return windowChrome(w, scene, c, `
    ${rect(x + 28, y + 28, w.w - 56, 44, { rx: 22, fill: "#f1f5f9" })}
    ${text(x + 52, y + 57, w.query, { size: 16, weight: 750, fill: "#222222" })}
    ${(w.results ?? []).map((item, i) => `${text(x + 42, y + 116 + i * 58, item, { size: 19, weight: 850, fill: "#1a0dab" })}${text(x + 42, y + 140 + i * 58, "www.lingoost.com/resources", { size: 13, weight: 650, fill: "#188038" })}`).join("")}
  `)
}

function renderEditor(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  const trackNames = ["Video A", "Video B", "Voice", "Captions", "Markers"]
  return windowChrome(w, scene, c, `
    ${rect(x + 24, y + 24, 560, 320, { rx: 18, fill: "#0f172a" })}
    <defs><linearGradient id="edit-preview-${scene.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1f2937"/><stop offset="1" stop-color="${scene.accent}"/></linearGradient></defs>
    ${rect(x + 42, y + 42, 524, 254, { rx: 14, fill: `url(#edit-preview-${scene.id})` })}
    <circle cx="${x + 304}" cy="${y + 168}" r="46" fill="rgba(255,255,255,0.88)"/><path d="M${x + 292} ${y + 147} L${x + 328} ${y + 168} L${x + 292} ${y + 189} Z" fill="${scene.accent}"/>
    ${rect(x + 616, y + 24, w.w - 650, 320, { rx: 18, fill: "#111827", stroke: "#334155" })}
    ${["Cut silence before demo", "Add zoom at 02:18", "Normalize voice -16 LUFS", "Export preview frame"].map((item, i) => `${rect(x + 642, y + 56 + i * 62, w.w - 704, 42, { rx: 12, fill: "#1f2937" })}${text(x + 662, y + 83 + i * 62, item, { size: 18, weight: 750, fill: "#e5e7eb" })}`).join("")}
    ${trackNames.map((track, i) => {
      const yy = y + 390 + i * 42
      return `${text(x + 46, yy + 22, track, { size: 14, weight: 800, fill: "#cbd5e1" })}${rect(x + 150, yy, w.w - 200, 26, { rx: 8, fill: "#0f172a" })}${[0,1,2,3,4,5].map((j) => rect(x + 170 + j * 190 + (i % 2) * 34, yy + 4, 98 + ((j + i) % 3) * 38, 18, { rx: 7, fill: j % 2 ? scene.accent : "#475569" })).join("")}`
    }).join("")}
    ${line(x + 650, y + 370, x + 650, y + 590, { stroke: scene.accent, width: 3 })}
  `)
}

function renderForm(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  return windowChrome(w, scene, c, `
    ${(w.fields ?? []).map((field, i) => {
      const yy = y + 42 + i * Math.min(58, (w.h - 110) / Math.max(1, w.fields.length))
      return `${text(x + 42, yy, field, { size: 14, weight: 900, fill: "#64748b" })}${rect(x + 42, yy + 12, w.w - 84, 34, { rx: 10, fill: "#f8fafc", stroke: "#e5e7eb" })}${rect(x + 60, yy + 24, (w.w - 150) * (0.35 + (i % 3) * 0.16), 9, { rx: 5, fill: "#94a3b8", opacity: 0.55 })}`
    }).join("")}
    ${rect(x + w.w - 190, y + w.h - 94, 148, 44, { rx: 22, fill: scene.accent })}
    ${text(x + w.w - 116, y + w.h - 66, "Save draft", { size: 15, weight: 900, fill: "#ffffff", anchor: "middle" })}
  `)
}

function renderSitemap(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  const cx = x + w.w / 2
  const cy = y + (w.h - 42) / 2
  const nodes = ["Home", "Category", "Course", "FAQ", "Reviews"]
  return windowChrome(w, scene, c, `
    ${nodes.map((node, i) => {
      const angle = (-120 + i * 60) * Math.PI / 180
      const nx = cx + Math.cos(angle) * 210
      const ny = cy + Math.sin(angle) * 78
      return `${line(cx, cy, nx, ny, { stroke: "#cbd5e1", width: 2 })}${rect(nx - 58, ny - 22, 116, 44, { rx: 22, fill: i === 2 ? scene.accent : "#ffffff", stroke: "#e5e7eb" })}${text(nx, ny + 7, node, { size: 14, weight: 850, fill: i === 2 ? "#ffffff" : "#222222", anchor: "middle" })}`
    }).join("")}
    <circle cx="${cx}" cy="${cy}" r="38" fill="${scene.accent}"/>${text(cx, cy + 7, "XML", { size: 18, weight: 900, fill: "#ffffff", anchor: "middle" })}
  `)
}

function renderAnalytics(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  return windowChrome(w, scene, c, `
    ${(w.bars ?? []).map(([label, value], i) => {
      const yy = y + 50 + i * 42
      return `${text(x + 42, yy + 8, label, { size: 16, weight: 800, fill: "#222222" })}${rect(x + 212, yy - 10, w.w - 272, 22, { rx: 11, fill: "#e5e7eb" })}${rect(x + 212, yy - 10, (w.w - 272) * value, 22, { rx: 11, fill: scene.accent })}`
    }).join("")}
    <polyline points="${x + 42},${y + w.h - 70} ${x + 162},${y + w.h - 108} ${x + 292},${y + w.h - 88} ${x + 430},${y + w.h - 130} ${x + 598},${y + w.h - 98}" fill="none" stroke="${scene.accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  `)
}

function renderGoogleSearchConsole(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  const metrics = [
    ["Total clicks", w.clicks, "#1a73e8"],
    ["Impressions", w.impressions, "#7e57c2"],
    ["Average CTR", w.ctr, "#00897b"],
    ["Position", w.position, "#f9ab00"],
  ]
  const chartPoints = [
    [x + 210, y + 302],
    [x + 272, y + 282],
    [x + 334, y + 296],
    [x + 398, y + 254],
    [x + 462, y + 266],
    [x + 526, y + 236],
    [x + 592, y + 248],
    [x + 662, y + 222],
  ].map((point) => point.join(",")).join(" ")

  return windowChrome(w, scene, c, `
    ${rect(x, y, 154, w.h - 42, { rx: 0, fill: "#f8fafd" })}
    ${text(x + 24, y + 40, "Search", { size: 18, weight: 850, fill: "#3c4043" })}
    ${text(x + 24, y + 64, "Console", { size: 18, weight: 850, fill: "#3c4043" })}
    ${["Overview", "Performance", "URL inspection", "Pages", "Sitemaps"].map((item, i) => {
      const active = i === 1
      return `${active ? rect(x + 16, y + 94 + i * 42, 122, 32, { rx: 16, fill: "#e8f0fe" }) : ""}${text(x + 30, y + 116 + i * 42, item, { size: 13, weight: active ? 850 : 650, fill: active ? "#1a73e8" : "#5f6368" })}`
    }).join("")}
    ${rect(x + 180, y + 24, w.w - 210, 36, { rx: 18, fill: "#f1f3f4" })}
    ${text(x + 204, y + 48, w.property, { size: 14, weight: 700, fill: "#3c4043" })}
    ${text(x + 180, y + 94, "Performance on Search results", { size: 21, weight: 850, fill: "#202124" })}
    ${text(x + 180, y + 120, `Query: ${w.query}`, { size: 13, weight: 650, fill: "#5f6368" })}
    ${metrics.map(([label, value, fill], i) => {
      const mx = x + 180 + i * 130
      return `${rect(mx, y + 144, 116, 72, { rx: 14, fill: i === 0 ? "#e8f0fe" : "#ffffff", stroke: "#dadce0" })}${text(mx + 14, y + 170, label, { size: 11, weight: 800, fill: "#5f6368" })}${text(mx + 14, y + 202, value, { size: 24, weight: 900, fill })}`
    }).join("")}
    ${line(x + 184, y + 320, x + w.w - 36, y + 320, { stroke: "#e0e3e7", width: 1 })}
    ${line(x + 184, y + 274, x + w.w - 36, y + 274, { stroke: "#e0e3e7", width: 1 })}
    ${line(x + 184, y + 228, x + w.w - 36, y + 228, { stroke: "#e0e3e7", width: 1 })}
    <polyline points="${chartPoints}" fill="none" stroke="#1a73e8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="${chartPoints.replaceAll(String(y + 302), String(y + 314)).replaceAll(String(y + 282), String(y + 292)).replaceAll(String(y + 296), String(y + 306)).replaceAll(String(y + 254), String(y + 272)).replaceAll(String(y + 266), String(y + 278)).replaceAll(String(y + 236), String(y + 260)).replaceAll(String(y + 248), String(y + 266)).replaceAll(String(y + 222), String(y + 250))}" fill="none" stroke="#7e57c2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.78"/>
    ${rect(x + 180, y + 320, w.w - 214, 52, { rx: 14, fill: "#ffffff", stroke: "#dadce0" })}
    ${text(x + 204, y + 352, "Submitted sitemap: /sitemap.xml", { size: 14, weight: 850, fill: "#188038" })}
    ${text(x + w.w - 236, y + 352, "Indexed pages: 214", { size: 14, weight: 800, fill: "#3c4043" })}
  `)
}

function renderGoogleTagManager(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  return windowChrome(w, scene, c, `
    ${rect(x, y, w.w, 58, { rx: 0, fill: "#f8fafd" })}
    ${text(x + 32, y + 37, "Tag Manager", { size: 20, weight: 850, fill: "#3c4043" })}
    ${rect(x + w.w - 210, y + 15, 164, 30, { rx: 15, fill: "#e8f0fe" })}
    ${text(x + w.w - 128, y + 36, w.container, { size: 13, weight: 900, fill: "#1a73e8", anchor: "middle" })}
    ${text(x + 32, y + 92, "Workspace changes", { size: 20, weight: 850, fill: "#202124" })}
    ${text(x + 32, y + 118, "Course SEO events are ready to publish.", { size: 13, weight: 650, fill: "#5f6368" })}
    ${rect(x + 32, y + 142, 178, 78, { rx: 16, fill: "#e8f0fe", stroke: "#d2e3fc" })}
    ${text(x + 54, y + 172, "Tags", { size: 13, weight: 850, fill: "#1a73e8" })}
    ${text(x + 54, y + 204, "4 ready", { size: 25, weight: 900, fill: "#202124" })}
    ${rect(x + 230, y + 142, 178, 78, { rx: 16, fill: "#fff7e0", stroke: "#fde293" })}
    ${text(x + 252, y + 172, "Triggers", { size: 13, weight: 850, fill: "#b06000" })}
    ${text(x + 252, y + 204, "3 active", { size: 25, weight: 900, fill: "#202124" })}
    ${rect(x + 428, y + 142, 196, 78, { rx: 16, fill: "#e6f4ea", stroke: "#ceead6" })}
    ${text(x + 450, y + 172, "Preview", { size: 13, weight: 850, fill: "#188038" })}
    ${text(x + 450, y + 204, "Connected", { size: 23, weight: 900, fill: "#202124" })}
    ${rect(x + 32, y + 242, w.w - 64, 40, { rx: 10, fill: "#ffffff", stroke: "#dadce0" })}
    ${text(x + 52, y + 267, "Name", { size: 12, weight: 900, fill: "#5f6368" })}
    ${text(x + 390, y + 267, "Trigger", { size: 12, weight: 900, fill: "#5f6368" })}
    ${(w.tags ?? []).map((tag, i) => {
      const yy = y + 292 + i * 28
      return `${line(x + 34, yy - 19, x + w.w - 34, yy - 19, { stroke: "#edf0f2", width: 1 })}${text(x + 52, yy, tag, { size: 13, weight: 800, fill: "#202124" })}${text(x + 390, yy, i === 0 ? "All pages" : "Course detail page", { size: 13, weight: 650, fill: "#5f6368" })}${rect(x + w.w - 116, yy - 18, 70, 24, { rx: 12, fill: "#e6f4ea" })}${text(x + w.w - 81, yy - 2, "Live", { size: 11, weight: 900, fill: "#188038", anchor: "middle" })}`
    }).join("")}
  `)
}

function renderGoogleAnalytics(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  const chart = [
    [x + 330, y + 174],
    [x + 452, y + 146],
    [x + 574, y + 158],
    [x + 696, y + 108],
    [x + 818, y + 126],
    [x + 940, y + 88],
    [x + 1062, y + 104],
    [x + 1184, y + 72],
  ].map((point) => point.join(",")).join(" ")
  const cards = [
    ["Users", "12.8K", "#1a73e8"],
    ["Organic search", "64.2%", "#34a853"],
    ["Enroll clicks", "416", "#f9ab00"],
  ]

  return windowChrome(w, scene, c, `
    ${rect(x, y, 206, w.h - 42, { rx: 0, fill: "#f8fafd" })}
    ${text(x + 28, y + 38, "Analytics", { size: 21, weight: 850, fill: "#3c4043" })}
    ${["Reports", "Acquisition", "Engagement", "Conversions"].map((item, i) => `${i === 1 ? rect(x + 18, y + 68 + i * 38, 166, 30, { rx: 15, fill: "#fef7e0" }) : ""}${text(x + 34, y + 89 + i * 38, item, { size: 13, weight: i === 1 ? 850 : 650, fill: i === 1 ? "#b06000" : "#5f6368" })}`).join("")}
    ${text(x + 236, y + 44, w.report, { size: 22, weight: 900, fill: "#202124" })}
    ${cards.map(([label, value, fill], i) => {
      const cx = x + 236 + i * 160
      return `${rect(cx, y + 70, 138, 72, { rx: 16, fill: "#ffffff", stroke: "#dadce0" })}${text(cx + 18, y + 98, label, { size: 12, weight: 850, fill: "#5f6368" })}${text(cx + 18, y + 130, value, { size: 25, weight: 900, fill })}`
    }).join("")}
    ${line(x + 236, y + 198, x + w.w - 420, y + 198, { stroke: "#e0e3e7", width: 1 })}
    ${line(x + 236, y + 152, x + w.w - 420, y + 152, { stroke: "#e0e3e7", width: 1 })}
    ${line(x + 236, y + 106, x + w.w - 420, y + 106, { stroke: "#e0e3e7", width: 1 })}
    <polyline points="${chart}" fill="none" stroke="#f9ab00" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="${chart.replaceAll(String(y + 174), String(y + 190)).replaceAll(String(y + 146), String(y + 164)).replaceAll(String(y + 158), String(y + 176)).replaceAll(String(y + 108), String(y + 132)).replaceAll(String(y + 126), String(y + 145)).replaceAll(String(y + 88), String(y + 120)).replaceAll(String(y + 104), String(y + 136)).replaceAll(String(y + 72), String(y + 104))}" fill="none" stroke="#1a73e8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.75"/>
    ${rect(x + w.w - 382, y + 64, 330, 148, { rx: 18, fill: "#ffffff", stroke: "#dadce0" })}
    ${text(x + w.w - 354, y + 96, "Key events", { size: 17, weight: 900, fill: "#202124" })}
    ${(w.events ?? []).map(([event, value], i) => `${text(x + w.w - 354, y + 126 + i * 25, event, { size: 13, weight: 750, fill: "#3c4043" })}${text(x + w.w - 76, y + 126 + i * 25, value, { size: 13, weight: 900, fill: "#202124", anchor: "end" })}`).join("")}
  `)
}

function renderAudio(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  return windowChrome(w, scene, c, `
    ${(w.tracks ?? []).map((track, i) => {
      const yy = y + 64 + i * 74
      const bars = Array.from({ length: 46 }, (_, j) => {
        const h = 12 + ((j * 19 + i * 29) % 52)
        return rect(x + 192 + j * 12, yy - h / 2, 7, h, { rx: 3, fill: j % 4 ? scene.accent : "#64748b", opacity: j % 4 ? 0.95 : 0.8 })
      }).join("")
      return `${text(x + 42, yy + 7, track, { size: 17, weight: 850, fill: "#e5e7eb" })}${bars}`
    }).join("")}
  `)
}

function renderCaptions(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  return windowChrome(w, scene, c, `
    ${(w.rows ?? []).map((row, i) => `${rect(x + 28, y + 34 + i * 50, w.w - 56, 34, { rx: 10, fill: i % 2 ? "#111827" : "#1f2937", stroke: "#334155" })}${text(x + 48, y + 57 + i * 50, row, { size: 16, weight: 750, fill: "#e5e7eb" })}`).join("")}
  `)
}

function renderModal(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  return windowChrome(w, scene, c, `
    ${rect(x + 52, y + 44, w.w - 104, w.h - 118, { rx: 24, fill: "#ffffff", stroke: "#e5e7eb" })}
    ${text(x + w.w / 2, y + 100, w.title, { size: 28, weight: 900, fill: "#222222", anchor: "middle" })}
    ${(w.rows ?? []).map((row, i) => text(x + 86, y + 158 + i * 46, row, { size: 18, weight: 650, fill: "#3f3f3f" })).join("")}
    ${rect(x + 86, y + w.h - 98, 132, 44, { rx: 22, fill: "#f7f7f7", stroke: "#dddddd" })}
    ${text(x + 152, y + w.h - 70, "Cancel", { size: 16, weight: 850, fill: "#222222", anchor: "middle" })}
    ${rect(x + w.w - 218, y + w.h - 98, 132, 44, { rx: 22, fill: scene.accent })}
    ${text(x + w.w - 152, y + w.h - 70, "Approve", { size: 16, weight: 900, fill: "#ffffff", anchor: "middle" })}
  `)
}

function renderCalendar(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  const steps = w.steps ?? []
  return windowChrome(w, scene, c, `
    ${steps.map((step, i) => {
      const sx = x + 52 + i * ((w.w - 104) / Math.max(1, steps.length - 1))
      return `${i > 0 ? line(x + 52 + (i - 1) * ((w.w - 104) / Math.max(1, steps.length - 1)), y + 112, sx, y + 112, { stroke: "#cbd5e1", width: 4 }) : ""}<circle cx="${sx}" cy="${y + 112}" r="18" fill="${i < 3 ? scene.accent : "#ffffff"}" stroke="#cbd5e1" stroke-width="2"/>${text(sx, y + 156, step, { size: 14, weight: 850, fill: "#222222", anchor: "middle" })}`
    }).join("")}
    ${rect(x + 54, y + 190, w.w - 108, 54, { rx: 16, fill: "#f8fafc", stroke: "#e5e7eb" })}
    ${text(x + 76, y + 215, "Next action: record the preview lesson.", { size: 16, weight: 750, fill: "#3f3f3f" })}
    ${text(x + 76, y + 238, "Keep the course private until review.", { size: 15, weight: 650, fill: "#6a6a6a" })}
  `)
}

function renderWindow(w, scene, c) {
  const renderers = {
    vscode: renderVscode,
    browser: renderBrowser,
    terminal: renderTerminal,
    database: renderDatabase,
    files: renderFiles,
    qa: renderQa,
    video: renderVideo,
    board: renderBoard,
    assistant: renderAssistant,
    search: renderSearch,
    editor: renderEditor,
    form: renderForm,
    sitemap: renderSitemap,
    analytics: renderAnalytics,
    gsc: renderGoogleSearchConsole,
    gtm: renderGoogleTagManager,
    ga4: renderGoogleAnalytics,
    audio: renderAudio,
    captions: renderCaptions,
    modal: renderModal,
    calendar: renderCalendar,
  }
  return renderers[w.type](w, scene, c)
}

function wallpaper(scene) {
  return `
    <defs>
      <linearGradient id="wallpaper-${scene.id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${scene.wallpaper[0]}"/>
        <stop offset="0.52" stop-color="${scene.wallpaper[1]}"/>
        <stop offset="1" stop-color="${scene.wallpaper[2]}"/>
      </linearGradient>
      <radialGradient id="glow-${scene.id}" cx="78%" cy="22%" r="62%">
        <stop offset="0" stop-color="${scene.accent}" stop-opacity="0.18"/>
        <stop offset="1" stop-color="${scene.accent}" stop-opacity="0"/>
      </radialGradient>
      <filter id="windowShadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="20" stdDeviation="26" flood-color="#000000" flood-opacity="0.24"/>
      </filter>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#wallpaper-${scene.id})"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow-${scene.id})"/>
  `
}

function sceneSvg(scene) {
  const c = colors(scene)
  const titleY = scene.titleY ?? (scene.os === "mac" ? 72 : 58)
  const subtitleY = scene.subtitleY ?? (scene.os === "mac" ? 101 : 87)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  ${wallpaper(scene)}
  ${menuBar(scene, c)}
  ${scene.showRecording === false ? "" : recordingBadge(scene)}
  ${text(56, titleY, scene.title, { size: 28, weight: 900, fill: c.ink })}
  ${text(56, subtitleY, scene.subtitle, { size: 17, weight: 650, fill: c.body })}
  ${scene.windows.map((w) => renderWindow(w, scene, c)).join("")}
  ${dock(scene)}
</svg>`
}

await fs.mkdir(OUT_DIR, { recursive: true })

for (const scene of scenes.filter((scene) => !only || String(scene.id) === String(only))) {
  const outputPath = path.join(OUT_DIR, `course-${scene.id}-workshop.png`)
  console.log(`[render-desktop] ${scene.id} ${scene.title}`)
  await sharp(Buffer.from(sceneSvg(scene)))
    .resize(WIDTH, HEIGHT, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(outputPath)
  const metadata = await sharp(outputPath).metadata()
  console.log(`[done] ${path.relative(ROOT, outputPath)} ${metadata.width}x${metadata.height}`)
}
