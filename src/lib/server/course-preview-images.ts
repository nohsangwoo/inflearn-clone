import sharp from "sharp"

export const COURSE_PREVIEW_WIDTH = 1200
export const COURSE_PREVIEW_MODEL_HEIGHT = 784
export const COURSE_PREVIEW_HEIGHT = 781

export type CoursePreviewVariant = {
  name: string
  label: string
  accent: string
  mood: string
}

export const coursePreviewVariants: CoursePreviewVariant[] = [
  {
    name: "Editorial Studio",
    label: "CREATOR LAB",
    accent: "#ff385c",
    mood:
      "warm editorial creator studio, premium online learning materials, course planning board, clean daylight, photography-led consumer marketplace feel",
  },
  {
    name: "Signal Interface",
    label: "PRACTICAL SYSTEM",
    accent: "#00b8a9",
    mood:
      "futuristic but restrained learning interface, structured modules, video timeline, subtle data signals, polished 2026 education product art",
  },
  {
    name: "Focused Workshop",
    label: "COHORT COURSE",
    accent: "#6c5ce7",
    mood:
      "hands-on workshop desk, laptop, notebooks, practical project artifacts, premium course production environment, confident and focused atmosphere",
  },
]

type PreviewCopyInput = {
  title: string
  topic: string
  headline?: string
  category?: string | null
  level?: string | null
}

export function buildCoursePreviewPrompt(topic: string, variant: CoursePreviewVariant) {
  return [
    `Create a premium online-course thumbnail background about: ${topic}.`,
    variant.mood,
    "No readable words, no letters, no logos, no brand names, no subtitles, no watermark.",
    "Leave generous darker negative space on the left side for a title overlay.",
    "Use a clean, trendy, high-trust consumer education marketplace style.",
    "Landscape composition, strong subject clarity, tasteful contrast, not cluttered.",
  ].join(" ")
}

export function buildCoursePreviewCopy(input: PreviewCopyInput) {
  const source = [input.title, input.topic, input.category, input.level].filter(Boolean).join(" ")
  const headline = normalizeHeadline(input.headline) || inferEnglishHeadline(source)
  const label = inferEnglishLabel(input.category, source)
  const subline = inferEnglishSubline(input.level, source)
  return { headline, label, subline }
}

export async function composeCoursePreviewImage(
  backgroundBytes: Buffer,
  props: {
    headline: string
    subline: string
    label: string
    variant: CoursePreviewVariant
  },
) {
  const background = await sharp(backgroundBytes)
    .resize(COURSE_PREVIEW_WIDTH, COURSE_PREVIEW_MODEL_HEIGHT, { fit: "cover" })
    .extract({ left: 0, top: 0, width: COURSE_PREVIEW_WIDTH, height: COURSE_PREVIEW_HEIGHT })
    .png()
    .toBuffer()

  return sharp(background)
    .composite([{ input: Buffer.from(overlaySvg(props)), left: 0, top: 0 }])
    .png({ compressionLevel: 9 })
    .toBuffer()
}

function normalizeHeadline(value?: string) {
  const trimmed = value?.trim()
  if (!trimmed) return null
  return trimmed.replace(/\s+/g, " ").slice(0, 68)
}

function inferEnglishHeadline(source: string) {
  const lower = source.toLowerCase()
  if (/next|react|typescript|웹|프론트|개발|코딩|코드/.test(lower)) return "Build Real Web Products"
  if (/hls|stream|video|영상|자막|더빙|encoding|인코딩/.test(lower)) return "Master Video Course Ops"
  if (/seo|검색|마케팅|노출|키워드/.test(lower)) return "Win Course Search"
  if (/ai|gpt|openai|자동|인공지능/.test(lower)) return "AI Workflow Intensive"
  if (/주식|투자|재테크|finance|stock/.test(lower)) return "Practical Finance Lab"
  if (/병원|의료|clinic|hospital/.test(lower)) return "Clinic Growth Playbook"
  if (/디자인|ux|ui|figma|브랜드/.test(lower)) return "Design Systems Studio"
  if (/강의|크리에이터|creator|콘텐츠|content/.test(lower)) return "Launch a Premium Course"
  return "Premium Course Intensive"
}

function inferEnglishLabel(category?: string | null, source = "") {
  const lower = `${category ?? ""} ${source}`.toLowerCase()
  if (/next|react|웹|개발|코딩/.test(lower)) return "WEB BUILD"
  if (/hls|stream|video|영상|더빙|자막/.test(lower)) return "VIDEO OPS"
  if (/seo|검색|마케팅/.test(lower)) return "SEARCH GROWTH"
  if (/ai|gpt|openai|인공지능/.test(lower)) return "AI COURSE"
  if (/비즈니스|사업|정산|판매/.test(lower)) return "BUSINESS LAB"
  if (/디자인|ux|ui|figma/.test(lower)) return "DESIGN STUDIO"
  return "LINGOOST COURSE"
}

function inferEnglishSubline(level?: string | null, source = "") {
  const lower = `${level ?? ""} ${source}`.toLowerCase()
  if (/고급|advanced|전문/.test(lower)) return "Advanced cohort curriculum"
  if (/중급|intermediate/.test(lower)) return "Project-based intermediate track"
  if (/입문|beginner|기초/.test(lower)) return "Beginner-friendly practical track"
  return "Cohort-ready practical curriculum"
}

function overlaySvg({
  headline,
  subline,
  label,
  variant,
}: {
  headline: string
  subline: string
  label: string
  variant: CoursePreviewVariant
}) {
  const titleLines = wrapWords(headline, 18, 3)
  const titleTspans = titleLines
    .map((line, index) => `<tspan x="72" dy="${index === 0 ? 0 : 76}">${escapeXml(line)}</tspan>`)
    .join("")
  const titleStart = titleLines.length === 1 ? 352 : titleLines.length === 2 ? 318 : 284
  const sublineY = titleStart + titleLines.length * 76 + 18
  const labelWidth = Math.max(210, Math.min(360, label.length * 15 + 68))

  return `
<svg width="${COURSE_PREVIEW_WIDTH}" height="${COURSE_PREVIEW_HEIGHT}" viewBox="0 0 ${COURSE_PREVIEW_WIDTH} ${COURSE_PREVIEW_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000000" stop-opacity="0.72"/>
      <stop offset="0.58" stop-color="#000000" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.02"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="13" flood-color="#000000" flood-opacity="0.24"/>
    </filter>
  </defs>
  <rect width="${COURSE_PREVIEW_WIDTH}" height="${COURSE_PREVIEW_HEIGHT}" fill="url(#shade)"/>
  <rect x="56" y="54" width="192" height="48" rx="24" fill="#ffffff" fill-opacity="0.94" filter="url(#softShadow)"/>
  <text x="84" y="86" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="900" letter-spacing="2.2" fill="${escapeXml(variant.accent)}">LINGOOST</text>
  <rect x="72" y="146" width="${labelWidth}" height="48" rx="24" fill="${escapeXml(variant.accent)}" fill-opacity="0.94"/>
  <text x="100" y="177" font-family="Inter, Arial, sans-serif" font-size="17" font-weight="900" letter-spacing="1.2" fill="#ffffff">${escapeXml(label)}</text>
  <text x="72" y="${titleStart}" font-family="Inter, Arial, sans-serif" font-size="68" font-weight="950" letter-spacing="-0.4" fill="#ffffff">${titleTspans}</text>
  <text x="76" y="${sublineY}" font-family="Inter, Arial, sans-serif" font-size="29" font-weight="700" fill="#ffffff" fill-opacity="0.86">${escapeXml(subline)}</text>
  <rect x="72" y="658" width="242" height="54" rx="27" fill="#ffffff" fill-opacity="0.92"/>
  <text x="105" y="692" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="900" fill="#222222">NOW ENROLLING</text>
  <circle cx="1112" cy="92" r="13" fill="${escapeXml(variant.accent)}"/>
  <circle cx="1150" cy="92" r="13" fill="#ffffff" fill-opacity="0.70"/>
</svg>`
}

function wrapWords(text: string, maxChars: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ""

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
    if (lines.length === maxLines) break
  }
  if (current && lines.length < maxLines) lines.push(current)

  if (!lines.length) return ["Premium Course"]
  if (words.join(" ").length > lines.join(" ").length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/\s+\S*$/, "")}...`
  }
  return lines
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
