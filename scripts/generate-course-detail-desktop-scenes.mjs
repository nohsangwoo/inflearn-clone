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

const course105Screenshots = [
  {
    slug: "search-console",
    accent: "#1a73e8",
    wallpaper: ["#f8fbff", "#eef4ff", "#ffffff"],
    window: {
      type: "gsc",
      x: 36,
      y: 58,
      w: 1528,
      h: 806,
      title: "Chrome - Google Search Console",
      property: "https://www.lingoost.com/",
      query: "강의 상세 SEO 최적화",
      clicks: "1.42K",
      impressions: "38.6K",
      ctr: "3.7%",
      position: "8.4",
    },
  },
  {
    slug: "tag-manager",
    accent: "#1a73e8",
    wallpaper: ["#f8fbff", "#eef4ff", "#ffffff"],
    window: {
      type: "gtm",
      x: 36,
      y: 58,
      w: 1528,
      h: 806,
      title: "Chrome - Google Tag Manager",
      container: "GTM-LINGOOST",
      tags: ["GA4 Config", "course_detail_view", "preview_image_view", "enrollment_click"],
    },
  },
  {
    slug: "analytics",
    accent: "#f9ab00",
    wallpaper: ["#fffdf7", "#f8fbff", "#ffffff"],
    window: {
      type: "ga4",
      x: 36,
      y: 58,
      w: 1528,
      h: 806,
      title: "Chrome - Google Analytics",
      report: "GA4 · Course detail acquisition",
      events: [["course_detail_view", "8,924"], ["enrollment_request", "416"], ["preview_image_view", "2,188"], ["scroll_90_percent", "1,052"]],
    },
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
  const navW = 236
  const topH = 64
  const mainX = x + navW
  const mainY = y + topH
  const mainW = w.w - navW
  const contentX = mainX + 34
  const contentW = mainW - 68
  const cardGap = 12
  const cardW = (contentW - cardGap * 3) / 4
  const chartTop = mainY + 188
  const chartBottom = mainY + 366
  const chartH = chartBottom - chartTop
  const metrics = [
    ["Total clicks", w.clicks, "#1a73e8", "#ffffff"],
    ["Total impressions", w.impressions, "#673ab7", "#ffffff"],
    ["Average CTR", w.ctr, "#ffffff", "#188038"],
    ["Average position", w.position, "#ffffff", "#b06000"],
  ]
  const chartValues = [0.76, 0.64, 0.71, 0.46, 0.5, 0.29, 0.35, 0.18, 0.27, 0.08]
  const secondaryValues = [0.9, 0.79, 0.82, 0.62, 0.66, 0.48, 0.54, 0.38, 0.45, 0.24]
  const chartPoints = chartValues.map((value, i) => {
    const px = contentX + 24 + ((contentW - 48) * i) / (chartValues.length - 1)
    const py = chartTop + chartH * value
    return `${px},${py}`
  }).join(" ")
  const secondaryPoints = secondaryValues.map((value, i) => {
    const px = contentX + 24 + ((contentW - 48) * i) / (secondaryValues.length - 1)
    const py = chartTop + chartH * value
    return `${px},${py}`
  }).join(" ")
  const navItems = [
    ["Overview", false, 0],
    ["Performance", true, 0],
    ["URL inspection", false, 0],
    ["Indexing", false, 1],
    ["Pages", false, 2],
    ["Sitemaps", false, 2],
    ["Removals", false, 2],
    ["Experience", false, 1],
    ["Core Web Vitals", false, 2],
    ["Enhancements", false, 1],
  ]
  const tableRows = [
    ["seo 강의 상세페이지", "426", "8,912", "4.8%", "6.7"],
    ["강의 판매 사이트 만들기", "312", "7,104", "4.4%", "7.2"],
    ["온라인 강의 플랫폼", "246", "6,330", "3.9%", "8.1"],
    ["강의 seo 최적화", "188", "5,482", "3.4%", "9.6"],
    ["수강 신청 페이지", "104", "3,204", "3.2%", "10.4"],
  ]

  return windowChrome(w, scene, c, `
    ${rect(x, y, w.w, topH, { rx: 0, fill: "#ffffff" })}
    ${line(x, y + topH, x + w.w, y + topH, { stroke: "#e0e3e7", width: 1 })}
    ${text(x + 30, y + 39, "☰", { size: 20, weight: 700, fill: "#5f6368" })}
    ${text(x + 68, y + 40, "Search Console", { size: 19, weight: 800, fill: "#3c4043" })}
    ${rect(x + 314, y + 14, 648, 36, { rx: 18, fill: "#f1f3f4" })}
    ${text(x + 340, y + 38, `Inspect any URL in ${w.property}`, { size: 13, weight: 650, fill: "#5f6368" })}
    ${text(x + w.w - 134, y + 38, "Export  ⚙  ?", { size: 13, weight: 800, fill: "#5f6368" })}
    ${rect(x, mainY, navW, w.h - 42 - topH, { rx: 0, fill: "#ffffff" })}
    ${line(x + navW, mainY, x + navW, y + w.h, { stroke: "#e0e3e7", width: 1 })}
    ${rect(x + 18, mainY + 18, navW - 36, 42, { rx: 8, fill: "#ffffff", stroke: "#dadce0" })}
    ${text(x + 34, mainY + 44, w.property, { size: 12, weight: 800, fill: "#3c4043" })}
    ${navItems.map(([item, active, level], i) => {
      const yy = mainY + 90 + i * 34
      return `${active ? rect(x + 12, yy - 22, navW - 24, 30, { rx: 15, fill: "#e8f0fe" }) : ""}${text(x + 28 + level * 16, yy, item, { size: level === 1 ? 12 : 13, weight: active ? 850 : level === 1 ? 850 : 650, fill: active ? "#1a73e8" : level === 1 ? "#3c4043" : "#5f6368" })}`
    }).join("")}
    ${rect(mainX, mainY, mainW, w.h - 42 - topH, { rx: 0, fill: "#f8fafd" })}
    ${text(contentX, mainY + 42, "Performance on Search results", { size: 22, weight: 850, fill: "#202124" })}
    ${rect(contentX, mainY + 62, 82, 30, { rx: 15, fill: "#ffffff", stroke: "#dadce0" })}
    ${text(contentX + 41, mainY + 82, "24 hours", { size: 12, weight: 800, fill: "#5f6368", anchor: "middle" })}
    ${rect(contentX + 94, mainY + 62, 92, 30, { rx: 15, fill: "#e8f0fe", stroke: "#d2e3fc" })}
    ${text(contentX + 140, mainY + 82, "3 months", { size: 12, weight: 900, fill: "#1a73e8", anchor: "middle" })}
    ${rect(contentX + 198, mainY + 62, 102, 30, { rx: 15, fill: "#ffffff", stroke: "#dadce0" })}
    ${text(contentX + 249, mainY + 82, "Search type", { size: 12, weight: 800, fill: "#5f6368", anchor: "middle" })}
    ${rect(contentX + 312, mainY + 62, 210, 30, { rx: 15, fill: "#ffffff", stroke: "#dadce0" })}
    ${text(contentX + 417, mainY + 82, `Query: ${w.query}`, { size: 12, weight: 800, fill: "#3c4043", anchor: "middle" })}
    ${text(contentX + contentW - 96, mainY + 82, "Last update: 3 hours ago", { size: 12, weight: 700, fill: "#5f6368", anchor: "end" })}
    ${metrics.map(([label, value, fill, valueFill], i) => {
      const mx = contentX + i * (cardW + cardGap)
      const isFilled = i < 2
      return `${rect(mx, mainY + 112, cardW, 72, { rx: 10, fill, stroke: isFilled ? fill : "#dadce0" })}${text(mx + 16, mainY + 137, `☑ ${label}`, { size: 12, weight: 850, fill: isFilled ? "#ffffff" : "#5f6368" })}${text(mx + 16, mainY + 171, value, { size: 26, weight: 900, fill: valueFill })}`
    }).join("")}
    ${rect(contentX, chartTop - 14, contentW, chartH + 54, { rx: 0, fill: "#ffffff", stroke: "#dadce0" })}
    ${[0, 0.25, 0.5, 0.75, 1].map((step) => line(contentX + 24, chartTop + chartH * step, contentX + contentW - 24, chartTop + chartH * step, { stroke: "#eef0f3", width: 1 })).join("")}
    <polyline points="${chartPoints}" fill="none" stroke="#1a73e8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="${secondaryPoints}" fill="none" stroke="#7e57c2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.78"/>
    ${text(contentX + 24, chartTop + chartH + 30, "Apr 20", { size: 11, weight: 700, fill: "#80868b" })}
    ${text(contentX + contentW / 2, chartTop + chartH + 30, "May 05", { size: 11, weight: 700, fill: "#80868b", anchor: "middle" })}
    ${text(contentX + contentW - 24, chartTop + chartH + 30, "May 18", { size: 11, weight: 700, fill: "#80868b", anchor: "end" })}
    ${rect(contentX, mainY + 432, contentW, 238, { rx: 10, fill: "#ffffff", stroke: "#dadce0" })}
    ${["QUERIES", "PAGES", "COUNTRIES", "DEVICES", "SEARCH APPEARANCE", "DATES"].map((tab, i) => {
      const positions = [28, 140, 260, 392, 520, 706]
      return `${text(contentX + positions[i], mainY + 464, tab, { size: 11, weight: i === 0 ? 900 : 750, fill: i === 0 ? "#1a73e8" : "#5f6368" })}${i === 0 ? line(contentX + 28, mainY + 474, contentX + 80, mainY + 474, { stroke: "#1a73e8", width: 3 }) : ""}`
    }).join("")}
    ${line(contentX, mainY + 486, contentX + contentW, mainY + 486, { stroke: "#e0e3e7", width: 1 })}
    ${text(contentX + 28, mainY + 512, "Top queries", { size: 12, weight: 900, fill: "#5f6368" })}
    ${text(contentX + contentW - 330, mainY + 512, "Clicks", { size: 12, weight: 900, fill: "#5f6368", anchor: "end" })}
    ${text(contentX + contentW - 220, mainY + 512, "Impr.", { size: 12, weight: 900, fill: "#5f6368", anchor: "end" })}
    ${text(contentX + contentW - 120, mainY + 512, "CTR", { size: 12, weight: 900, fill: "#5f6368", anchor: "end" })}
    ${text(contentX + contentW - 32, mainY + 512, "Position", { size: 12, weight: 900, fill: "#5f6368", anchor: "end" })}
    ${tableRows.map((row, i) => {
      const yy = mainY + 542 + i * 28
      return `${line(contentX + 20, yy - 20, contentX + contentW - 20, yy - 20, { stroke: "#edf0f2", width: 1 })}${text(contentX + 28, yy, row[0], { size: 12, weight: 750, fill: "#202124" })}${text(contentX + contentW - 330, yy, row[1], { size: 12, weight: 800, fill: "#1a73e8", anchor: "end" })}${text(contentX + contentW - 220, yy, row[2], { size: 12, weight: 800, fill: "#673ab7", anchor: "end" })}${text(contentX + contentW - 120, yy, row[3], { size: 12, weight: 750, fill: "#3c4043", anchor: "end" })}${text(contentX + contentW - 32, yy, row[4], { size: 12, weight: 750, fill: "#3c4043", anchor: "end" })}`
    }).join("")}
  `)
}

function renderGoogleTagManager(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  const topH = 72
  const navW = 226
  const mainX = x + navW
  const mainY = y + topH
  const contentX = mainX + 34
  const contentW = w.w - navW - 68
  const navItems = ["Overview", "Tags", "Triggers", "Variables", "Folders", "Templates"]
  const tagRows = [
    ["GA4 Config", "Google Analytics: GA4 Configuration", "All Pages", "2 hours ago"],
    ["course_detail_view", "Google Analytics: GA4 Event", "Course detail page", "2 hours ago"],
    ["preview_image_view", "Google Analytics: GA4 Event", "Preview image visible", "Yesterday"],
    ["enrollment_click", "Google Analytics: GA4 Event", "Apply button click", "Yesterday"],
    ["scroll_90_percent", "Google Analytics: GA4 Event", "Course page depth", "May 17"],
  ]
  return windowChrome(w, scene, c, `
    ${rect(x, y, w.w, topH, { rx: 0, fill: "#ffffff" })}
    ${line(x, y + topH, x + w.w, y + topH, { stroke: "#e0e3e7", width: 1 })}
    ${text(x + 30, y + 34, "Tag Manager", { size: 20, weight: 850, fill: "#3c4043" })}
    ${text(x + 30, y + 56, "Lingoost / Web container", { size: 12, weight: 700, fill: "#5f6368" })}
    ${["Workspace", "Versions", "Admin"].map((tab, i) => `${text(x + 330 + i * 116, y + 45, tab, { size: 14, weight: i === 0 ? 900 : 750, fill: i === 0 ? "#1a73e8" : "#5f6368" })}${i === 0 ? line(x + 330, y + 68, x + 404, y + 68, { stroke: "#1a73e8", width: 3 }) : ""}`).join("")}
    ${rect(x + w.w - 268, y + 20, 92, 34, { rx: 4, fill: "#ffffff", stroke: "#1a73e8" })}
    ${text(x + w.w - 222, y + 42, "Preview", { size: 13, weight: 850, fill: "#1a73e8", anchor: "middle" })}
    ${rect(x + w.w - 162, y + 20, 94, 34, { rx: 4, fill: "#1a73e8" })}
    ${text(x + w.w - 115, y + 42, "Submit", { size: 13, weight: 900, fill: "#ffffff", anchor: "middle" })}
    ${rect(x, mainY, navW, w.h - 42 - topH, { rx: 0, fill: "#ffffff" })}
    ${line(x + navW, mainY, x + navW, y + w.h, { stroke: "#e0e3e7", width: 1 })}
    ${text(x + 26, mainY + 35, "CURRENT WORKSPACE", { size: 10, weight: 900, fill: "#80868b" })}
    ${rect(x + 20, mainY + 50, navW - 40, 46, { rx: 6, fill: "#f8fafd", stroke: "#dadce0" })}
    ${text(x + 36, mainY + 78, "Default Workspace", { size: 13, weight: 850, fill: "#202124" })}
    ${navItems.map((item, i) => {
      const active = i === 0
      const yy = mainY + 128 + i * 38
      return `${active ? rect(x + 12, yy - 24, navW - 24, 32, { rx: 16, fill: "#e8f0fe" }) : ""}${text(x + 36, yy, item, { size: 13, weight: active ? 900 : 700, fill: active ? "#1a73e8" : "#5f6368" })}`
    }).join("")}
    ${rect(mainX, mainY, w.w - navW, w.h - 42 - topH, { rx: 0, fill: "#f8f9fa" })}
    ${text(contentX, mainY + 42, "Default Workspace", { size: 24, weight: 850, fill: "#202124" })}
    ${text(contentX, mainY + 70, w.container, { size: 12, weight: 800, fill: "#5f6368" })}
    ${rect(contentX, mainY + 100, 292, 150, { rx: 6, fill: "#ffffff", stroke: "#dadce0" })}
    ${text(contentX + 22, mainY + 130, "Workspace Changes", { size: 17, weight: 850, fill: "#202124" })}
    ${text(contentX + 22, mainY + 158, "Modified tags and triggers", { size: 12, weight: 700, fill: "#5f6368" })}
    ${[["Modified", "5"], ["Added", "2"], ["Deleted", "0"]].map(([label, value], i) => `${text(contentX + 34 + i * 86, mainY + 202, value, { size: 26, weight: 900, fill: i === 2 ? "#5f6368" : "#1a73e8", anchor: "middle" })}${text(contentX + 34 + i * 86, mainY + 224, label, { size: 11, weight: 800, fill: "#5f6368", anchor: "middle" })}`).join("")}
    ${rect(contentX + 318, mainY + 100, 292, 150, { rx: 6, fill: "#ffffff", stroke: "#dadce0" })}
    ${text(contentX + 340, mainY + 130, "Container Quality", { size: 17, weight: 850, fill: "#202124" })}
    ${text(contentX + 340, mainY + 160, "No critical issues detected", { size: 12, weight: 700, fill: "#188038" })}
    ${rect(contentX + 340, mainY + 184, 228, 18, { rx: 9, fill: "#e6f4ea" })}
    ${rect(contentX + 340, mainY + 184, 190, 18, { rx: 9, fill: "#34a853" })}
    ${text(contentX + 340, mainY + 228, "Consent mode · GA4 · click events", { size: 12, weight: 700, fill: "#5f6368" })}
    ${rect(contentX + 636, mainY + 100, Math.max(240, contentW - 636), 150, { rx: 6, fill: "#ffffff", stroke: "#dadce0" })}
    ${text(contentX + 660, mainY + 130, "Tag Assistant", { size: 17, weight: 850, fill: "#202124" })}
    ${text(contentX + 660, mainY + 160, "Connected to https://www.lingoost.com/ko/course/105", { size: 12, weight: 700, fill: "#3c4043" })}
    ${text(contentX + 660, mainY + 190, "Events received: page_view, view_item, select_content", { size: 12, weight: 700, fill: "#5f6368" })}
    ${rect(contentX + 660, mainY + 210, 102, 24, { rx: 12, fill: "#e6f4ea" })}
    ${text(contentX + 711, mainY + 226, "Connected", { size: 11, weight: 900, fill: "#188038", anchor: "middle" })}
    ${rect(contentX, mainY + 278, contentW, 318, { rx: 6, fill: "#ffffff", stroke: "#dadce0" })}
    ${text(contentX + 24, mainY + 312, "Tags", { size: 18, weight: 850, fill: "#202124" })}
    ${rect(contentX + contentW - 122, mainY + 292, 92, 30, { rx: 4, fill: "#1a73e8" })}
    ${text(contentX + contentW - 76, mainY + 312, "New", { size: 12, weight: 900, fill: "#ffffff", anchor: "middle" })}
    ${line(contentX, mainY + 336, contentX + contentW, mainY + 336, { stroke: "#e0e3e7", width: 1 })}
    ${text(contentX + 24, mainY + 362, "Name", { size: 11, weight: 900, fill: "#5f6368" })}
    ${text(contentX + 348, mainY + 362, "Type", { size: 11, weight: 900, fill: "#5f6368" })}
    ${text(contentX + 632, mainY + 362, "Firing Triggers", { size: 11, weight: 900, fill: "#5f6368" })}
    ${text(contentX + contentW - 42, mainY + 362, "Last edited", { size: 11, weight: 900, fill: "#5f6368", anchor: "end" })}
    ${tagRows.map((row, i) => {
      const yy = mainY + 396 + i * 42
      return `${line(contentX + 20, yy - 24, contentX + contentW - 20, yy - 24, { stroke: "#edf0f2", width: 1 })}${text(contentX + 24, yy, row[0], { size: 13, weight: 850, fill: "#202124" })}${text(contentX + 348, yy, row[1], { size: 12, weight: 650, fill: "#5f6368" })}${text(contentX + 632, yy, row[2], { size: 12, weight: 750, fill: "#3c4043" })}${text(contentX + contentW - 42, yy, row[3], { size: 12, weight: 650, fill: "#5f6368", anchor: "end" })}`
    }).join("")}
  `)
}

function renderGoogleAnalytics(w, scene, c) {
  const x = w.x
  const y = w.y + 42
  const navW = 244
  const topH = 58
  const mainX = x + navW
  const mainY = y + topH
  const contentX = mainX + 32
  const contentW = w.w - navW - 64
  const chartAreaX = contentX
  const chartAreaY = mainY + 120
  const chartAreaW = contentW - 280
  const chartAreaH = 178
  const chart = [0.82, 0.72, 0.78, 0.55, 0.62, 0.4, 0.48, 0.25, 0.33, 0.18].map((value, i) => {
    const px = chartAreaX + 18 + ((chartAreaW - 36) * i) / 9
    const py = chartAreaY + 22 + chartAreaH * value
    return `${px},${py}`
  }).join(" ")
  const rows = [
    ["Organic Search", "8,221", "12,402", "9,814", "1m 14s", "7.42", "61,482", "416"],
    ["Direct", "2,104", "3,078", "1,892", "0m 46s", "4.18", "12,118", "72"],
    ["Referral", "1,084", "1,642", "1,104", "0m 58s", "5.06", "7,410", "38"],
    ["Organic Social", "671", "844", "526", "0m 39s", "3.88", "3,020", "19"],
    ["Email", "430", "512", "398", "1m 03s", "6.14", "2,441", "14"],
    ["Unassigned", "188", "244", "102", "0m 21s", "2.11", "642", "4"],
  ]
  const bars = [
    ["Organic Search", 0.92, "#f9ab00"],
    ["Direct", 0.38, "#1a73e8"],
    ["Referral", 0.23, "#34a853"],
    ["Organic Social", 0.15, "#a142f4"],
    ["Email", 0.09, "#00acc1"],
  ]

  return windowChrome(w, scene, c, `
    ${rect(x, y, w.w, topH, { rx: 0, fill: "#ffffff" })}
    ${line(x, y + topH, x + w.w, y + topH, { stroke: "#e0e3e7", width: 1 })}
    ${text(x + 28, y + 36, "Analytics", { size: 20, weight: 850, fill: "#3c4043" })}
    ${rect(x + 244, y + 12, 540, 34, { rx: 17, fill: "#f1f3f4" })}
    ${text(x + 268, y + 35, "Try searching \"organic course detail traffic\"", { size: 12, weight: 650, fill: "#5f6368" })}
    ${text(x + w.w - 112, y + 35, "Lingoost Web", { size: 12, weight: 850, fill: "#3c4043", anchor: "end" })}
    ${rect(x, mainY, navW, w.h - 42 - topH, { rx: 0, fill: "#ffffff" })}
    ${line(x + navW, mainY, x + navW, y + w.h, { stroke: "#e0e3e7", width: 1 })}
    ${["Home", "Reports", "Acquisition", "Traffic acquisition", "Engagement", "Monetization", "Retention"].map((item, i) => {
      const active = item === "Traffic acquisition"
      const yy = mainY + 36 + i * 34
      return `${active ? rect(x + 18, yy - 22, navW - 36, 30, { rx: 15, fill: "#fef7e0" }) : ""}${text(x + (i === 3 ? 46 : 30), yy, item, { size: i === 2 ? 12 : 13, weight: active ? 900 : i === 2 ? 850 : 650, fill: active ? "#b06000" : i === 2 ? "#3c4043" : "#5f6368" })}`
    }).join("")}
    ${rect(mainX, mainY, w.w - navW, w.h - 42 - topH, { rx: 0, fill: "#ffffff" })}
    ${text(contentX, mainY + 40, "Traffic acquisition: Session default channel group", { size: 22, weight: 850, fill: "#202124" })}
    ${text(contentX, mainY + 68, "Last 28 days · May 20, 2026", { size: 12, weight: 700, fill: "#5f6368" })}
    ${rect(contentX, mainY + 88, 120, 28, { rx: 14, fill: "#ffffff", stroke: "#dadce0" })}
    ${text(contentX + 60, mainY + 107, "Add filter", { size: 12, weight: 850, fill: "#5f6368", anchor: "middle" })}
    ${rect(contentX, chartAreaY, chartAreaW, chartAreaH + 44, { rx: 8, fill: "#ffffff", stroke: "#dadce0" })}
    ${text(chartAreaX + 20, chartAreaY + 28, "Users by Session default channel group over time", { size: 13, weight: 850, fill: "#202124" })}
    ${[0.25, 0.5, 0.75, 1].map((step) => line(chartAreaX + 20, chartAreaY + 38 + chartAreaH * step, chartAreaX + chartAreaW - 20, chartAreaY + 38 + chartAreaH * step, { stroke: "#eef0f3", width: 1 })).join("")}
    <polyline points="${chart}" fill="none" stroke="#f9ab00" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    ${text(chartAreaX + 20, chartAreaY + chartAreaH + 64, "Apr 23", { size: 10, weight: 700, fill: "#80868b" })}
    ${text(chartAreaX + chartAreaW / 2, chartAreaY + chartAreaH + 64, "May 06", { size: 10, weight: 700, fill: "#80868b", anchor: "middle" })}
    ${text(chartAreaX + chartAreaW - 24, chartAreaY + chartAreaH + 64, "May 19", { size: 10, weight: 700, fill: "#80868b", anchor: "end" })}
    ${rect(contentX + contentW - 254, chartAreaY, 254, chartAreaH + 44, { rx: 8, fill: "#ffffff", stroke: "#dadce0" })}
    ${text(contentX + contentW - 230, chartAreaY + 28, "Users by channel", { size: 13, weight: 850, fill: "#202124" })}
    ${bars.map(([label, value, fill], i) => {
      const yy = chartAreaY + 62 + i * 31
      return `${text(contentX + contentW - 230, yy, label, { size: 11, weight: 750, fill: "#3c4043" })}${rect(contentX + contentW - 230, yy + 7, 168, 9, { rx: 5, fill: "#eef0f3" })}${rect(contentX + contentW - 230, yy + 7, 168 * value, 9, { rx: 5, fill })}`
    }).join("")}
    ${rect(contentX, mainY + 382, contentW, 310, { rx: 8, fill: "#ffffff", stroke: "#dadce0" })}
    ${text(contentX + 22, mainY + 416, "Session default channel group", { size: 12, weight: 900, fill: "#5f6368" })}
    ${text(contentX + 324, mainY + 416, "Users", { size: 11, weight: 900, fill: "#5f6368", anchor: "end" })}
    ${text(contentX + 422, mainY + 416, "Sessions", { size: 11, weight: 900, fill: "#5f6368", anchor: "end" })}
    ${text(contentX + 548, mainY + 416, "Engaged sessions", { size: 11, weight: 900, fill: "#5f6368", anchor: "end" })}
    ${text(contentX + 708, mainY + 416, "Avg engagement", { size: 11, weight: 900, fill: "#5f6368", anchor: "end" })}
    ${text(contentX + 826, mainY + 416, "Events/session", { size: 11, weight: 900, fill: "#5f6368", anchor: "end" })}
    ${text(contentX + 952, mainY + 416, "Event count", { size: 11, weight: 900, fill: "#5f6368", anchor: "end" })}
    ${text(contentX + contentW - 34, mainY + 416, "Key events", { size: 11, weight: 900, fill: "#5f6368", anchor: "end" })}
    ${rows.map((row, i) => {
      const yy = mainY + 452 + i * 38
      return `${line(contentX + 18, yy - 24, contentX + contentW - 18, yy - 24, { stroke: "#edf0f2", width: 1 })}${text(contentX + 22, yy, `${i + 1}  ${row[0]}`, { size: 12, weight: i === 0 ? 900 : 750, fill: "#202124" })}${text(contentX + 324, yy, row[1], { size: 12, weight: 750, fill: "#3c4043", anchor: "end" })}${text(contentX + 422, yy, row[2], { size: 12, weight: 750, fill: "#3c4043", anchor: "end" })}${text(contentX + 548, yy, row[3], { size: 12, weight: 750, fill: "#3c4043", anchor: "end" })}${text(contentX + 708, yy, row[4], { size: 12, weight: 750, fill: "#3c4043", anchor: "end" })}${text(contentX + 826, yy, row[5], { size: 12, weight: 750, fill: "#3c4043", anchor: "end" })}${text(contentX + 952, yy, row[6], { size: 12, weight: 750, fill: "#3c4043", anchor: "end" })}${text(contentX + contentW - 34, yy, row[7], { size: 12, weight: 900, fill: i === 0 ? "#b06000" : "#3c4043", anchor: "end" })}`
    }).join("")}
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

function course105ScreenshotSvg(config) {
  const scene = {
    id: `105-${config.slug}`,
    os: "mac",
    accent: config.accent,
    wallpaper: config.wallpaper,
    showRecording: false,
  }
  const c = colors(scene)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  ${wallpaper(scene)}
  ${menuBar(scene, c)}
  ${renderWindow(config.window, scene, c)}
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

if (!only || String(only) === "105") {
  for (const screenshot of course105Screenshots) {
    const outputPath = path.join(OUT_DIR, `course-105-${screenshot.slug}.png`)
    console.log(`[render-screenshot] 105 ${screenshot.slug}`)
    await sharp(Buffer.from(course105ScreenshotSvg(screenshot)))
      .resize(WIDTH, HEIGHT, { fit: "cover" })
      .png({ compressionLevel: 9 })
      .toFile(outputPath)
    const metadata = await sharp(outputPath).metadata()
    console.log(`[done] ${path.relative(ROOT, outputPath)} ${metadata.width}x${metadata.height}`)
  }
}
