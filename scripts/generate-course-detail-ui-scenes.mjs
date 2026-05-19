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
    eyebrow: "Web Platform Workshop",
    title: "Course Marketplace Build",
    subtitle: "Next.js + Drizzle + enrollment operations",
    theme: "light",
    accent: "#ff385c",
    panels: [
      {
        type: "code",
        x: 72,
        y: 116,
        w: 558,
        h: 390,
        title: "src/app/[locale]/course/[id]/page.tsx",
        rows: [
          "const lecture = await db.query.lectures.findFirst({",
          "  where: eq(lectures.id, lectureId),",
          "  with: { curriculums: true, instructor: true },",
          "})",
          "",
          "return <CourseDetailPage initialDetail={detail} />",
        ],
      },
      {
        type: "browser",
        x: 660,
        y: 116,
        w: 868,
        h: 390,
        title: "localhost:3000/ko/course/101",
        heading: "Next.js로 강의 거래소 만들기",
        subheading: "상품, 수강신청, 계좌입금 승인, SEO까지",
        cards: ["모집 중", "잔여 13석", "입금 확인", "SEO Ready"],
      },
      {
        type: "table",
        x: 72,
        y: 536,
        w: 646,
        h: 270,
        title: "Neon DB / lectures",
        columns: ["id", "title", "status", "seats"],
        rows: [
          ["101", "Marketplace", "OPEN", "27/40"],
          ["102", "HLS Ops", "FULL", "24/24"],
          ["103", "AI Plan", "OPEN", "41/60"],
          ["108", "First Launch", "WAITING", "0/45"],
        ],
      },
      {
        type: "terminal",
        x: 748,
        y: 536,
        w: 780,
        h: 270,
        title: "pnpm db:seed && pnpm build",
        rows: [
          "✓ Drizzle schema checked",
          "✓ Enrollment request API ready",
          "✓ Course SEO metadata generated",
          "✓ Production build completed",
        ],
      },
    ],
  },
  {
    id: 102,
    eyebrow: "Video Infra Workshop",
    title: "HLS Video Operations",
    subtitle: "Encoding ladder, captions and playback QA",
    theme: "dark",
    accent: "#22d3ee",
    panels: [
      {
        type: "player",
        x: 72,
        y: 116,
        w: 770,
        h: 430,
        title: "Preview Player",
        heading: "Master playlist QA",
        subheading: "1080p / 720p / 480p variants",
      },
      {
        type: "terminal",
        x: 872,
        y: 116,
        w: 656,
        h: 430,
        title: "ffmpeg encode job",
        rows: [
          "input.mp4  1920x1080  29.97fps",
          "variant 1080p  5.4Mbps  segment: 6s",
          "variant 720p   2.8Mbps  segment: 6s",
          "variant 480p   1.2Mbps  segment: 6s",
          "writing master.m3u8 ... done",
        ],
      },
      {
        type: "ladder",
        x: 72,
        y: 576,
        w: 770,
        h: 230,
        title: "Adaptive Bitrate Ladder",
        labels: ["1080p", "720p", "480p", "Audio"],
      },
      {
        type: "captions",
        x: 872,
        y: 576,
        w: 656,
        h: 230,
        title: "Caption Tracks",
        rows: ["ko.vtt  synced", "en.vtt  review", "ja.vtt  draft", "burned-in subtitle: off"],
      },
    ],
  },
  {
    id: 103,
    eyebrow: "Creator Strategy Workshop",
    title: "AI-Era Course Planning",
    subtitle: "Positioning, curriculum and conversion copy",
    theme: "light",
    accent: "#8b5cf6",
    panels: [
      {
        type: "board",
        x: 72,
        y: 116,
        w: 872,
        h: 516,
        title: "Curriculum Planning Board",
        columns: [
          ["Problem", "Who is stuck?", "What outcome matters?", "What proof is needed?"],
          ["Promise", "Build a landing page", "Launch one cohort", "Validate demand"],
          ["Lessons", "Intro", "Research", "Offer", "Sales page", "Launch"],
        ],
      },
      {
        type: "assistant",
        x: 974,
        y: 116,
        w: 554,
        h: 516,
        title: "AI Draft Review",
        rows: [
          "Search intent: course selling",
          "Audience: first-time creators",
          "Outcome: publish a paid course",
          "Risk: too broad, narrow the promise",
        ],
      },
      {
        type: "timeline",
        x: 72,
        y: 662,
        w: 1456,
        h: 144,
        title: "Cohort Launch Plan",
        steps: ["Topic", "Outline", "Preview", "Landing", "Enrollment", "Feedback"],
      },
    ],
  },
  {
    id: 104,
    eyebrow: "Course Editing Workshop",
    title: "Retention Editing Timeline",
    subtitle: "Chapters, audio cleanup and thumbnail frames",
    theme: "dark",
    accent: "#ffb703",
    panels: [
      {
        type: "player",
        x: 72,
        y: 116,
        w: 652,
        h: 388,
        title: "Lesson Preview",
        heading: "Chapter 03",
        subheading: "Zoom on the important moment",
      },
      {
        type: "inspector",
        x: 754,
        y: 116,
        w: 774,
        h: 388,
        title: "Retention Notes",
        rows: ["Cut silence before demo", "Add zoom at 02:18", "Normalize voice -16 LUFS", "Export preview frame"],
      },
      {
        type: "editor",
        x: 72,
        y: 534,
        w: 1456,
        h: 272,
        title: "Editing Timeline",
        tracks: ["Video A", "Video B", "Voice", "Captions", "Markers"],
      },
    ],
  },
  {
    id: 105,
    eyebrow: "Search Growth Workshop",
    title: "Course Seller SEO Desk",
    subtitle: "Metadata, sitemap and search intent",
    theme: "light",
    accent: "#10b981",
    panels: [
      {
        type: "serp",
        x: 72,
        y: 116,
        w: 680,
        h: 392,
        title: "Search Preview",
        rows: [
          "강의 판매자를 위한 SEO 실전 | 링구스트",
          "태그, 메타 타이틀, 사이트맵, 검색 의도를 강의 등록 폼에 녹입니다.",
          "www.lingoost.com/ko/course/105",
        ],
      },
      {
        type: "form",
        x: 782,
        y: 116,
        w: 746,
        h: 392,
        title: "Metadata Editor",
        fields: ["Meta title", "Meta description", "SEO keywords", "Canonical URL"],
      },
      {
        type: "sitemap",
        x: 72,
        y: 538,
        w: 680,
        h: 268,
        title: "Sitemap Structure",
        nodes: ["Home", "Category", "Course 105", "Reviews", "FAQ"],
      },
      {
        type: "analytics",
        x: 782,
        y: 538,
        w: 746,
        h: 268,
        title: "Keyword Movement",
        bars: ["course SEO", "online course", "lecture sales", "sitemap"],
      },
    ],
  },
  {
    id: 106,
    eyebrow: "AI Localization Workshop",
    title: "Dubbing QA Console",
    subtitle: "Voice tracks, subtitle sync and approval status",
    theme: "dark",
    accent: "#a78bfa",
    panels: [
      {
        type: "player",
        x: 72,
        y: 116,
        w: 604,
        h: 396,
        title: "Course Video",
        heading: "Voice track preview",
        subheading: "Original + English dub",
      },
      {
        type: "waveform",
        x: 706,
        y: 116,
        w: 822,
        h: 396,
        title: "Audio Tracks",
        tracks: ["Original KO", "English Dub", "Japanese Draft", "Room Tone"],
      },
      {
        type: "captions",
        x: 72,
        y: 542,
        w: 604,
        h: 264,
        title: "Subtitle Timing",
        rows: ["00:01:12  Intro synced", "00:03:48  Needs review", "00:05:20  Term fixed", "00:08:04  Approved"],
      },
      {
        type: "checklist",
        x: 706,
        y: 542,
        w: 822,
        h: 264,
        title: "QA Checklist",
        rows: ["Pronunciation", "Timing", "Tone", "Technical terms", "Final approval"],
      },
    ],
  },
  {
    id: 107,
    eyebrow: "Operations Workshop",
    title: "Instructor Ledger Review",
    subtitle: "Bank transfer approvals and payout readiness",
    theme: "light",
    accent: "#ff385c",
    panels: [
      {
        type: "metrics",
        x: 72,
        y: 116,
        w: 1456,
        h: 160,
        title: "Today's Operations",
        items: [["Awaiting transfer", "18"], ["Approved seats", "126"], ["Payout queue", "₩3.24M"], ["Fee rate", "0%"]],
      },
      {
        type: "table",
        x: 72,
        y: 306,
        w: 922,
        h: 500,
        title: "Enrollment Requests",
        columns: ["student", "course", "amount", "status"],
        rows: [
          ["minji@...", "Ledger Ops", "₩35,000", "Waiting"],
          ["hyun@...", "HLS Ops", "₩129,000", "Approved"],
          ["seo@...", "First Launch", "₩49,000", "Waiting"],
          ["jin@...", "Marketplace", "₩70,000", "Approved"],
        ],
      },
      {
        type: "modal",
        x: 1024,
        y: 306,
        w: 504,
        h: 500,
        title: "Confirm Deposit",
        rows: ["Bank: Toss Bank", "Holder: Lingoost Studio", "Amount: ₩49,000", "Grant course access after approval"],
      },
    ],
  },
  {
    id: 108,
    eyebrow: "First Launch Workshop",
    title: "Course Launch Room",
    subtitle: "Registration, preview lesson and cohort schedule",
    theme: "light",
    accent: "#3b82f6",
    panels: [
      {
        type: "form",
        x: 72,
        y: 116,
        w: 646,
        h: 458,
        title: "Course Setup",
        fields: ["Course title", "Short description", "Enrollment dates", "Price and discount", "Bank account"],
      },
      {
        type: "browser",
        x: 748,
        y: 116,
        w: 780,
        h: 458,
        title: "Landing Page Preview",
        heading: "초보 판매자용 첫 강의 출시",
        subheading: "한 편의 공개 영상에서 첫 유료 커리큘럼까지",
        cards: ["Preview lesson", "Open cohort", "49,000 KRW", "SEO Ready"],
      },
      {
        type: "timeline",
        x: 72,
        y: 604,
        w: 1456,
        h: 202,
        title: "Launch Checklist",
        steps: ["Outline", "Thumbnail", "Preview", "Publish", "Enroll", "Review"],
      },
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

function theme(scene) {
  const dark = scene.theme === "dark"
  return {
    dark,
    bg: dark ? "#0e1117" : "#f7f7f7",
    window: dark ? "#151922" : "#ffffff",
    panel: dark ? "#1b2130" : "#ffffff",
    panelAlt: dark ? "#20283a" : "#f7f7f7",
    border: dark ? "#31394d" : "#dddddd",
    text: dark ? "#f7f7f7" : "#222222",
    muted: dark ? "#aeb7c8" : "#6a6a6a",
    faint: dark ? "#657089" : "#929292",
    code: dark ? "#0b0f16" : "#151922",
    accent: scene.accent,
  }
}

function text(x, y, content, options = {}) {
  const size = options.size ?? 24
  const weight = options.weight ?? 500
  const fill = options.fill ?? "currentColor"
  const anchor = options.anchor ? ` text-anchor="${options.anchor}"` : ""
  return `<text x="${x}" y="${y}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}"${anchor}>${escapeXml(content)}</text>`
}

function rect(x, y, w, h, options = {}) {
  const rx = options.rx ?? 18
  const fill = options.fill ?? "none"
  const stroke = options.stroke ? ` stroke="${options.stroke}"` : ""
  const sw = options.strokeWidth ? ` stroke-width="${options.strokeWidth}"` : ""
  const opacity = options.opacity == null ? "" : ` opacity="${options.opacity}"`
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${stroke}${sw}${opacity}/>`
}

function line(x1, y1, x2, y2, options = {}) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${options.stroke}" stroke-width="${options.width ?? 2}" stroke-linecap="round" opacity="${options.opacity ?? 1}"/>`
}

function panelChrome(p, colors) {
  return [
    rect(p.x, p.y, p.w, p.h, { rx: 24, fill: colors.panel, stroke: colors.border }),
    rect(p.x, p.y, p.w, 48, { rx: 24, fill: colors.dark ? "#111722" : "#fafafa" }),
    `<clipPath id="clip-${p.x}-${p.y}"><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="24"/></clipPath>`,
    `<g clip-path="url(#clip-${p.x}-${p.y})">${line(p.x, p.y + 48, p.x + p.w, p.y + 48, { stroke: colors.border, width: 1 })}</g>`,
    `<circle cx="${p.x + 24}" cy="${p.y + 24}" r="6" fill="#ff5f57"/>`,
    `<circle cx="${p.x + 44}" cy="${p.y + 24}" r="6" fill="#ffbd2e"/>`,
    `<circle cx="${p.x + 64}" cy="${p.y + 24}" r="6" fill="#28c840"/>`,
    text(p.x + 88, p.y + 31, p.title, { size: 16, weight: 700, fill: colors.muted }),
  ].join("")
}

function renderCode(p, colors) {
  const rows = p.rows ?? []
  const codeY = p.y + 86
  return [
    panelChrome(p, colors),
    rect(p.x + 24, p.y + 72, p.w - 48, p.h - 96, { rx: 16, fill: colors.code }),
    ...rows.map((row, i) => {
      const y = codeY + i * 38
      const color = row.includes("const") || row.includes("return") ? "#7dd3fc" : row.includes("where") || row.includes("with") ? "#f9a8d4" : "#d1d5db"
      return text(p.x + 48, y, row, { size: 21, weight: 500, fill: color })
    }),
    `<circle cx="${p.x + p.w - 72}" cy="${p.y + p.h - 68}" r="20" fill="${colors.accent}"/>`,
    text(p.x + p.w - 72, p.y + p.h - 60, "✓", { size: 24, weight: 800, fill: "#ffffff", anchor: "middle" }),
  ].join("")
}

function renderBrowser(p, colors) {
  return [
    panelChrome(p, colors),
    rect(p.x + 24, p.y + 72, p.w - 48, p.h - 96, { rx: 18, fill: colors.dark ? "#10141d" : "#ffffff", stroke: colors.border }),
    rect(p.x + 56, p.y + 108, p.w - 112, 116, { rx: 20, fill: colors.dark ? "#20283a" : "#f7f7f7" }),
    text(p.x + 82, p.y + 154, p.heading, { size: 30, weight: 800, fill: colors.text }),
    text(p.x + 82, p.y + 194, p.subheading, { size: 19, weight: 500, fill: colors.muted }),
    ...p.cards.map((card, i) => {
      const x = p.x + 56 + i * ((p.w - 128) / 4)
      return [
        rect(x, p.y + 252, (p.w - 152) / 4, 86, { rx: 18, fill: colors.dark ? "#151922" : "#ffffff", stroke: colors.border }),
        rect(x + 18, p.y + 274, 38, 38, { rx: 19, fill: colors.accent }),
        text(x + 74, p.y + 300, card, { size: 18, weight: 700, fill: colors.text }),
      ].join("")
    }),
    rect(p.x + 56, p.y + p.h - 92, p.w - 112, 18, { rx: 9, fill: colors.dark ? "#283145" : "#ebebeb" }),
    rect(p.x + 56, p.y + p.h - 92, (p.w - 112) * 0.62, 18, { rx: 9, fill: colors.accent }),
  ].join("")
}

function renderTerminal(p, colors) {
  const rows = p.rows ?? []
  return [
    panelChrome(p, colors),
    rect(p.x + 24, p.y + 72, p.w - 48, p.h - 96, { rx: 16, fill: colors.code }),
    ...rows.map((row, i) => {
      const y = p.y + 116 + i * 40
      return text(p.x + 48, y, `$ ${row}`, { size: 20, weight: 600, fill: i === rows.length - 1 ? "#86efac" : "#d1d5db" })
    }),
  ].join("")
}

function renderTable(p, colors) {
  const columnWidth = (p.w - 48) / p.columns.length
  return [
    panelChrome(p, colors),
    rect(p.x + 24, p.y + 72, p.w - 48, 44, { rx: 12, fill: colors.panelAlt }),
    ...p.columns.map((col, i) => text(p.x + 42 + i * columnWidth, p.y + 101, col, { size: 16, weight: 800, fill: colors.muted })),
    ...p.rows.flatMap((row, ri) => {
      const y = p.y + 146 + ri * 42
      return [
        line(p.x + 24, y - 24, p.x + p.w - 24, y - 24, { stroke: colors.border, width: 1 }),
        ...row.map((cell, ci) => text(p.x + 42 + ci * columnWidth, y, cell, { size: 18, weight: ci === 0 ? 800 : 600, fill: ci === row.length - 1 ? colors.accent : colors.text })),
      ]
    }),
  ].join("")
}

function renderPlayer(p, colors) {
  const cx = p.x + p.w / 2
  const cy = p.y + 232
  return [
    panelChrome(p, colors),
    `<defs><linearGradient id="player-${p.x}-${p.y}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${colors.dark ? "#1e293b" : "#e5e7eb"}"/><stop offset="1" stop-color="${colors.accent}"/></linearGradient></defs>`,
    rect(p.x + 24, p.y + 72, p.w - 48, p.h - 124, { rx: 18, fill: `url(#player-${p.x}-${p.y})` }),
    `<circle cx="${cx}" cy="${cy}" r="58" fill="rgba(255,255,255,0.92)"/>`,
    `<path d="M${cx - 16} ${cy - 25} L${cx + 28} ${cy} L${cx - 16} ${cy + 25} Z" fill="${colors.accent}"/>`,
    text(p.x + 56, p.y + p.h - 78, p.heading, { size: 24, weight: 800, fill: colors.text }),
    text(p.x + 56, p.y + p.h - 44, p.subheading, { size: 18, weight: 500, fill: colors.muted }),
  ].join("")
}

function renderLadder(p, colors) {
  return [
    panelChrome(p, colors),
    ...p.labels.map((label, i) => {
      const y = p.y + 92 + i * 36
      const w = [560, 430, 286, 190][i]
      return [
        text(p.x + 42, y + 8, label, { size: 18, weight: 800, fill: colors.text }),
        rect(p.x + 150, y - 12, w, 24, { rx: 12, fill: i === 0 ? colors.accent : colors.dark ? "#334155" : "#dddddd" }),
      ].join("")
    }),
  ].join("")
}

function renderCaptions(p, colors) {
  return [
    panelChrome(p, colors),
    ...p.rows.map((row, i) => {
      const y = p.y + 94 + i * 36
      return [
        rect(p.x + 28, y - 20, p.w - 56, 28, { rx: 8, fill: i % 2 ? "transparent" : colors.panelAlt }),
        text(p.x + 44, y, row, { size: 17, weight: 650, fill: colors.text }),
      ].join("")
    }),
  ].join("")
}

function renderBoard(p, colors) {
  const colW = (p.w - 64) / p.columns.length
  return [
    panelChrome(p, colors),
    ...p.columns.flatMap((column, ci) => {
      const x = p.x + 24 + ci * colW + ci * 8
      return [
        rect(x, p.y + 76, colW - 8, p.h - 104, { rx: 18, fill: colors.panelAlt, stroke: colors.border }),
        text(x + 22, p.y + 112, column[0], { size: 20, weight: 850, fill: colors.text }),
        ...column.slice(1).map((item, i) => {
          const y = p.y + 144 + i * 92
          return [
            rect(x + 18, y, colW - 44, 66, { rx: 14, fill: ci === 1 ? colors.accent : colors.dark ? "#151922" : "#ffffff", stroke: ci === 1 ? colors.accent : colors.border }),
            text(x + 38, y + 39, item, { size: 18, weight: 700, fill: ci === 1 ? "#ffffff" : colors.text }),
          ].join("")
        }),
      ]
    }),
  ].join("")
}

function renderAssistant(p, colors) {
  return [
    panelChrome(p, colors),
    rect(p.x + 28, p.y + 78, p.w - 56, 96, { rx: 18, fill: colors.accent }),
    text(p.x + 52, p.y + 118, "Reviewing course positioning", { size: 22, weight: 850, fill: "#ffffff" }),
    text(p.x + 52, p.y + 150, "Draft notes are ready for editing.", { size: 17, weight: 500, fill: "rgba(255,255,255,0.82)" }),
    ...p.rows.map((row, i) => {
      const y = p.y + 216 + i * 58
      return [
        rect(p.x + 28, y - 28, p.w - 56, 42, { rx: 12, fill: colors.panelAlt, stroke: colors.border }),
        text(p.x + 50, y, row, { size: 18, weight: 650, fill: colors.text }),
      ].join("")
    }),
  ].join("")
}

function renderTimeline(p, colors) {
  const gap = (p.w - 96) / (p.steps.length - 1)
  const y = p.y + p.h / 2 + 20
  return [
    panelChrome(p, colors),
    line(p.x + 48, y, p.x + p.w - 48, y, { stroke: colors.border, width: 4 }),
    ...p.steps.map((step, i) => {
      const x = p.x + 48 + i * gap
      return [
        `<circle cx="${x}" cy="${y}" r="18" fill="${i < 4 ? colors.accent : colors.panelAlt}" stroke="${colors.border}" stroke-width="2"/>`,
        text(x, y + 54, step, { size: 18, weight: 800, fill: colors.text, anchor: "middle" }),
      ].join("")
    }),
  ].join("")
}

function renderInspector(p, colors) {
  return [
    panelChrome(p, colors),
    ...p.rows.map((row, i) => {
      const y = p.y + 96 + i * 66
      return [
        rect(p.x + 30, y - 28, p.w - 60, 46, { rx: 12, fill: colors.panelAlt, stroke: colors.border }),
        `<circle cx="${p.x + 58}" cy="${y - 5}" r="10" fill="${colors.accent}"/>`,
        text(p.x + 82, y + 2, row, { size: 20, weight: 650, fill: colors.text }),
      ].join("")
    }),
  ].join("")
}

function renderEditor(p, colors) {
  return [
    panelChrome(p, colors),
    ...p.tracks.map((track, i) => {
      const y = p.y + 82 + i * 36
      return [
        text(p.x + 42, y + 20, track, { size: 15, weight: 800, fill: colors.muted }),
        rect(p.x + 150, y, p.w - 196, 24, { rx: 8, fill: colors.dark ? "#111722" : "#ebebeb" }),
        ...[0, 1, 2, 3, 4].map((j) => rect(p.x + 170 + j * 210 + (i % 2) * 28, y + 3, 120 + ((i + j) % 3) * 34, 18, { rx: 7, fill: j % 2 ? colors.accent : colors.dark ? "#475569" : "#cbd5e1", opacity: j % 2 ? 0.95 : 1 })),
      ].join("")
    }),
    line(p.x + 640, p.y + 76, p.x + 640, p.y + p.h - 36, { stroke: colors.accent, width: 3 }),
  ].join("")
}

function renderSerp(p, colors) {
  return [
    panelChrome(p, colors),
    rect(p.x + 30, p.y + 82, p.w - 60, p.h - 118, { rx: 18, fill: colors.panelAlt }),
    text(p.x + 58, p.y + 142, p.rows[0], { size: 24, weight: 850, fill: "#1a0dab" }),
    text(p.x + 58, p.y + 184, p.rows[2], { size: 17, weight: 600, fill: "#188038" }),
    text(p.x + 58, p.y + 230, p.rows[1], { size: 19, weight: 500, fill: colors.text }),
    rect(p.x + 58, p.y + 292, 210, 38, { rx: 19, fill: colors.accent }),
    text(p.x + 163, p.y + 318, "Indexable", { size: 18, weight: 850, fill: "#ffffff", anchor: "middle" }),
  ].join("")
}

function renderForm(p, colors) {
  return [
    panelChrome(p, colors),
    ...p.fields.map((field, i) => {
      const y = p.y + 94 + i * 62
      return [
        text(p.x + 42, y, field, { size: 15, weight: 800, fill: colors.muted }),
        rect(p.x + 42, y + 12, p.w - 84, 34, { rx: 10, fill: colors.panelAlt, stroke: colors.border }),
        rect(p.x + 60, y + 23, (p.w - 140) * (0.45 + (i % 3) * 0.16), 10, { rx: 5, fill: colors.faint, opacity: 0.55 }),
      ].join("")
    }),
    rect(p.x + p.w - 198, p.y + p.h - 72, 156, 42, { rx: 21, fill: colors.accent }),
    text(p.x + p.w - 120, p.y + p.h - 45, "Save draft", { size: 17, weight: 850, fill: "#ffffff", anchor: "middle" }),
  ].join("")
}

function renderSitemap(p, colors) {
  const cx = p.x + p.w / 2
  const cy = p.y + 136
  return [
    panelChrome(p, colors),
    ...p.nodes.map((node, i) => {
      const angle = (-120 + i * 60) * Math.PI / 180
      const x = cx + Math.cos(angle) * 210
      const y = cy + Math.sin(angle) * 74
      return [
        line(cx, cy, x, y, { stroke: colors.border, width: 2 }),
        rect(x - 66, y - 22, 132, 44, { rx: 22, fill: i === 2 ? colors.accent : colors.panelAlt, stroke: colors.border }),
        text(x, y + 7, node, { size: 15, weight: 800, fill: i === 2 ? "#ffffff" : colors.text, anchor: "middle" }),
      ].join("")
    }),
    `<circle cx="${cx}" cy="${cy}" r="38" fill="${colors.accent}"/>`,
    text(cx, cy + 7, "XML", { size: 18, weight: 900, fill: "#ffffff", anchor: "middle" }),
  ].join("")
}

function renderAnalytics(p, colors) {
  return [
    panelChrome(p, colors),
    ...p.bars.map((bar, i) => {
      const y = p.y + 94 + i * 38
      return [
        text(p.x + 42, y + 7, bar, { size: 17, weight: 700, fill: colors.text }),
        rect(p.x + 220, y - 12, p.w - 284, 22, { rx: 11, fill: colors.panelAlt }),
        rect(p.x + 220, y - 12, (p.w - 284) * (0.38 + i * 0.14), 22, { rx: 11, fill: colors.accent }),
      ].join("")
    }),
    `<polyline points="${p.x + 42},${p.y + p.h - 58} ${p.x + 160},${p.y + p.h - 94} ${p.x + 290},${p.y + p.h - 76} ${p.x + 430},${p.y + p.h - 126} ${p.x + 596},${p.y + p.h - 92}" fill="none" stroke="${colors.accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
  ].join("")
}

function renderWaveform(p, colors) {
  return [
    panelChrome(p, colors),
    ...p.tracks.map((track, i) => {
      const y = p.y + 96 + i * 72
      const bars = Array.from({ length: 42 }, (_, j) => {
        const h = 10 + ((j * 17 + i * 23) % 44)
        return rect(p.x + 184 + j * 12, y - h / 2, 7, h, { rx: 3, fill: j % 3 ? colors.accent : "#64748b", opacity: j % 3 ? 0.95 : 0.8 })
      }).join("")
      return [
        text(p.x + 42, y + 7, track, { size: 18, weight: 800, fill: colors.text }),
        bars,
      ].join("")
    }),
  ].join("")
}

function renderChecklist(p, colors) {
  return [
    panelChrome(p, colors),
    ...p.rows.map((row, i) => {
      const y = p.y + 92 + i * 38
      return [
        `<circle cx="${p.x + 52}" cy="${y - 7}" r="12" fill="${i < 4 ? colors.accent : colors.panelAlt}" stroke="${colors.border}" stroke-width="2"/>`,
        i < 4 ? text(p.x + 52, y - 1, "✓", { size: 14, weight: 900, fill: "#ffffff", anchor: "middle" }) : "",
        text(p.x + 82, y, row, { size: 18, weight: 700, fill: colors.text }),
      ].join("")
    }),
  ].join("")
}

function renderMetrics(p, colors) {
  const cardW = (p.w - 72) / p.items.length
  return [
    panelChrome(p, colors),
    ...p.items.map((item, i) => {
      const x = p.x + 24 + i * (cardW + 8)
      return [
        rect(x, p.y + 70, cardW, 64, { rx: 18, fill: colors.panelAlt, stroke: colors.border }),
        text(x + 20, p.y + 97, item[0], { size: 15, weight: 800, fill: colors.muted }),
        text(x + cardW - 20, p.y + 111, item[1], { size: 28, weight: 900, fill: colors.accent, anchor: "end" }),
      ].join("")
    }),
  ].join("")
}

function renderModal(p, colors) {
  return [
    panelChrome(p, colors),
    rect(p.x + 56, p.y + 92, p.w - 112, p.h - 154, { rx: 24, fill: colors.dark ? "#111722" : "#ffffff", stroke: colors.border }),
    text(p.x + p.w / 2, p.y + 144, p.title, { size: 28, weight: 900, fill: colors.text, anchor: "middle" }),
    ...p.rows.map((row, i) => text(p.x + 92, p.y + 204 + i * 48, row, { size: 20, weight: 650, fill: colors.text })),
    rect(p.x + 92, p.y + p.h - 104, 150, 48, { rx: 24, fill: colors.panelAlt, stroke: colors.border }),
    text(p.x + 167, p.y + p.h - 73, "Cancel", { size: 18, weight: 800, fill: colors.text, anchor: "middle" }),
    rect(p.x + p.w - 242, p.y + p.h - 104, 150, 48, { rx: 24, fill: colors.accent }),
    text(p.x + p.w - 167, p.y + p.h - 73, "Approve", { size: 18, weight: 850, fill: "#ffffff", anchor: "middle" }),
  ].join("")
}

function renderPanel(p, colors) {
  const renderers = {
    code: renderCode,
    browser: renderBrowser,
    table: renderTable,
    terminal: renderTerminal,
    player: renderPlayer,
    ladder: renderLadder,
    captions: renderCaptions,
    board: renderBoard,
    assistant: renderAssistant,
    timeline: renderTimeline,
    inspector: renderInspector,
    editor: renderEditor,
    serp: renderSerp,
    form: renderForm,
    sitemap: renderSitemap,
    analytics: renderAnalytics,
    waveform: renderWaveform,
    checklist: renderChecklist,
    metrics: renderMetrics,
    modal: renderModal,
  }
  return renderers[p.type](p, colors)
}

function renderScene(scene) {
  const colors = theme(scene)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#000000" flood-opacity="${colors.dark ? 0.35 : 0.11}"/>
    </filter>
    <radialGradient id="ambient" cx="78%" cy="12%" r="72%">
      <stop offset="0" stop-color="${colors.accent}" stop-opacity="${colors.dark ? 0.28 : 0.16}"/>
      <stop offset="1" stop-color="${colors.bg}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${colors.bg}"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#ambient)"/>
  <g filter="url(#shadow)">
    ${rect(40, 38, 1520, 824, { rx: 34, fill: colors.window, stroke: colors.border })}
  </g>
  ${text(72, 78, scene.eyebrow, { size: 18, weight: 850, fill: colors.accent })}
  ${text(72, 112, scene.title, { size: 34, weight: 900, fill: colors.text })}
  ${text(520, 112, scene.subtitle, { size: 20, weight: 600, fill: colors.muted })}
  ${scene.panels.map((panel) => renderPanel(panel, colors)).join("")}
</svg>`
}

await fs.mkdir(OUT_DIR, { recursive: true })

for (const scene of scenes.filter((scene) => !only || String(scene.id) === String(only))) {
  const outputPath = path.join(OUT_DIR, `course-${scene.id}-workshop.png`)
  console.log(`[render-ui] ${scene.id} ${scene.title}`)
  await sharp(Buffer.from(renderScene(scene)))
    .resize(WIDTH, HEIGHT, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(outputPath)
  const metadata = await sharp(outputPath).metadata()
  console.log(`[done] ${path.relative(ROOT, outputPath)} ${metadata.width}x${metadata.height}`)
}
