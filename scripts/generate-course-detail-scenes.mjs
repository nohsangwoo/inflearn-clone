import "dotenv/config"
import fs from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, "public", "course-detail-scenes")
const MODEL = "gpt-image-2"
const CANVAS_WIDTH = 1600
const MODEL_HEIGHT = 912
const FINAL_HEIGHT = 900

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

const scenes = [
  {
    id: 101,
    title: "Next.js Marketplace Build",
    prompt:
      "a realistic lecture-in-progress screen capture of building a course marketplace in a modern web development workspace, split view with a code editor containing abstract TypeScript and Drizzle schema blocks, a browser preview of course cards and enrollment status UI, database table inspector, terminal output panel, clean white consumer marketplace aesthetic with a restrained pink accent, instructor cursor highlight and subtle screen recording frame",
  },
  {
    id: 102,
    title: "HLS Video Operations",
    prompt:
      "a realistic lecture-in-progress screen capture of HLS video operations, ffmpeg terminal with abstract command blocks, adaptive bitrate ladder visualization, media player preview with waveform and caption track controls, file tree showing m3u8 and segment-like items as non-readable blocks, dark media control room UI mixed with clean web panels, technical but approachable",
  },
  {
    id: 103,
    title: "AI Course Planning",
    prompt:
      "a realistic lecture-in-progress screen capture on a MacBook Pro while planning a profitable online course, no human portrait, no mascot, just a believable desktop workspace: browser window with a Lingoost course editor, spreadsheet-like curriculum planner, search intent map, pricing and cohort calendar panel, AI assistant draft panel with blurred non-readable blocks, clean white workspace, practical operator view, like a real founder is recording a workshop",
  },
  {
    id: 104,
    title: "Course Editing Retention",
    prompt:
      "a realistic lecture-in-progress screen capture of editing an online course for retention, video editing timeline with chapter markers, audio waveform cleanup panel, thumbnail frame selector, zoomed lesson screen preview, color correction and caption controls, polished creator studio UI, focused practical editing workflow",
  },
  {
    id: 105,
    title: "Course Seller SEO",
    prompt:
      "a realistic lecture-in-progress screen capture of SEO work for online course sellers, search results preview cards, metadata editor, sitemap node diagram, keyword clustering board, analytics chart, course detail page preview, bright white interface with black text and subtle pink callouts, professional search optimization workshop",
  },
  {
    id: 106,
    title: "AI Dubbing Operations",
    prompt:
      "a realistic lecture-in-progress screen capture of AI dubbing and multilingual course operations, audio track mixer, voice waveform lanes, subtitle timing editor, language QA checklist, video preview with captions toggle, batch job status panel, futuristic but practical localization dashboard",
  },
  {
    id: 107,
    title: "Instructor Ledger Ops",
    prompt:
      "a realistic lecture-in-progress screen capture of a solo instructor ledger and operations dashboard, bank transfer approval queue, settlement ledger table with abstract rows, payout summary cards, manual confirmation modal, admin notes panel, calm financial operations workspace with trustworthy white surfaces and subtle red accent",
  },
  {
    id: 108,
    title: "First Course Launch",
    prompt:
      "a realistic lecture-in-progress screen capture of launching a first paid course, course registration form, preview lesson upload checklist, cohort enrollment calendar, sales page draft, creator desk with camera and microphone, onboarding workflow panels, optimistic clean education marketplace feel",
  },
  {
    id: 201,
    title: "Unreal Engine 5 Action RPG",
    prompt:
      "a realistic lecture-in-progress screen capture of creating an action RPG prototype in a high-end real-time 3D game editor, central viewport showing a third-person hero in a sci-fi fantasy combat arena, side panels for abstract blueprint nodes and gameplay C++ code, object hierarchy and properties inspector, glowing portal VFX, cinematic editor lighting, no official logos",
  },
  {
    id: 202,
    title: "Unity 6 Mobile Action",
    prompt:
      "a realistic lecture-in-progress screen capture of building a mobile action game in a modern game editor, game view showing a stylized arena with touch joystick overlay, C# script editor panel, inspector with component sliders, Android build settings panel, device preview on the side, colorful low-poly game art, no official logos",
  },
  {
    id: 203,
    title: "Godot 4 Pixel RPG",
    prompt:
      "a realistic lecture-in-progress screen capture of making a 2D pixel RPG in a lightweight game editor, tilemap village editor, node tree, GDScript-like abstract code panel, dialogue box preview, turn-based battle scene preview, cozy pixel art with clear practical tooling panels, no official logos",
  },
  {
    id: 204,
    title: "Blender to Unreal Worlds",
    prompt:
      "a realistic lecture-in-progress split-screen workflow for game environment art, left side 3D modeling software viewport editing modular stone ruins with UV and material node panels, right side real-time game engine editor importing the same assets into a forest courtyard with lighting, materials, level outliner and camera preview, hands-on portfolio workshop, no official logos",
  },
  {
    id: 205,
    title: "Niagara VFX Mastery",
    prompt:
      "a realistic lecture-in-progress screen capture of real-time game VFX creation, central viewport showing a glowing magic portal, combat sparks and particle trails, side panels with particle graph modules, parameter curves, timeline preview and material nodes, dark premium editor UI with cyan and pink energy, no official logos",
  },
  {
    id: 206,
    title: "UE5 Multiplayer Shooter",
    prompt:
      "a realistic lecture-in-progress screen capture of building a multiplayer shooter in a high-end game editor, main viewport showing two connected player characters in a sci-fi training arena, side panels for replication settings, network profiler, server RPC flow and weapon C++ code as abstract blocks, session lobby preview, no official logos or readable text",
  },
  {
    id: 207,
    title: "GAS Action Combat",
    prompt:
      "a realistic lecture-in-progress screen capture of implementing an action RPG combat system, game viewport with character using a special ability against a boss, panels for ability graph, attributes, cooldown tags, combat log and skill HUD preview, premium game editor UI, no official logos or readable text",
  },
  {
    id: 208,
    title: "Unity Netcode Co-op",
    prompt:
      "a realistic lecture-in-progress screen capture of creating a co-op survival game, editor viewport with four players defending a small base, inspector panels for network objects, lobby state, loot inventory and wave spawner, device/client previews side by side, no official logos or readable text",
  },
  {
    id: 209,
    title: "Game AI Systems",
    prompt:
      "a realistic lecture-in-progress screen capture of game AI development, viewport showing enemy NPC patrol, detection cone, chase path and boss arena, side panels with behavior tree, blackboard variables, utility score curves and debug overlay, practical game AI workshop, no official logos or readable text",
  },
  {
    id: 210,
    title: "Procedural Dungeon Tools",
    prompt:
      "a realistic lecture-in-progress screen capture of procedural dungeon tool development, central editor viewport showing generated dungeon rooms connected by corridors, grid and seed controls, side panels for room templates, spawn rules, graph connectivity and validation errors, level designer tooling context, no readable text",
  },
  {
    id: 211,
    title: "Game UI and HUD Systems",
    prompt:
      "a realistic lecture-in-progress screen capture of game UI and HUD implementation, gameplay viewport with health, stamina, minimap, skill slots and inventory overlay, side panels showing widget hierarchy, input navigation focus map, accessibility contrast checks and controller prompts, no readable text or logos",
  },
  {
    id: 212,
    title: "Interactive Game Audio",
    prompt:
      "a realistic lecture-in-progress screen capture of interactive game audio implementation, gameplay viewport with character walking across different surfaces and combat effects, audio event timeline, mixer lanes, footstep surface table, ambience state graph and waveform panels, no readable text or official logos",
  },
  {
    id: 213,
    title: "Indie Game Release QA",
    prompt:
      "a realistic lecture-in-progress screen capture of indie game release and QA operations, dashboard with build versions, bug report board, test case matrix, store page preview mockup, trailer screenshot selection and hotfix checklist, studio production room feeling, no readable text or official logos",
  },
  {
    id: 214,
    title: "Unreal Sequencer Cinematics",
    prompt:
      "a realistic lecture-in-progress screen capture of creating a game cinematic, central viewport with dramatic character scene and volumetric lighting, sequencer timeline, camera cut tracks, lighting panels, VFX timing markers and movie render queue settings as abstract UI, no official logos or readable text",
  },
  {
    id: 215,
    title: "Roblox UGC Mini Game",
    prompt:
      "a realistic lecture-in-progress screen capture of building a colorful UGC minigame, blocky obstacle arena viewport, Lua script panel as abstract code, round timer system, reward shop UI preview, server/client event panels and playtest window, playful but practical creator workflow, no readable text or official logos",
  },
]

function fallbackSvg(scene) {
  const hue = (scene.id * 37) % 360
  const accent = `hsl(${hue} 82% 58%)`
  const aux = `hsl(${(hue + 85) % 360} 88% 62%)`

  return Buffer.from(`
<svg width="${CANVAS_WIDTH}" height="${MODEL_HEIGHT}" viewBox="0 0 ${CANVAS_WIDTH} ${MODEL_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#111827"/>
      <stop offset="0.54" stop-color="#20202c"/>
      <stop offset="1" stop-color="#f7f7f7"/>
    </linearGradient>
    <radialGradient id="glow" cx="74%" cy="36%" r="62%">
      <stop offset="0" stop-color="${aux}" stop-opacity="0.7"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${CANVAS_WIDTH}" height="${MODEL_HEIGHT}" fill="url(#bg)"/>
  <rect width="${CANVAS_WIDTH}" height="${MODEL_HEIGHT}" fill="url(#glow)"/>
  <g opacity="0.94">
    <rect x="92" y="78" width="1416" height="756" rx="34" fill="rgba(255,255,255,0.92)"/>
    <rect x="116" y="108" width="900" height="610" rx="24" fill="#12141d"/>
    <rect x="1044" y="108" width="344" height="284" rx="24" fill="#f7f7f7"/>
    <rect x="1044" y="420" width="344" height="298" rx="24" fill="#f7f7f7"/>
    <circle cx="166" cy="150" r="12" fill="${accent}"/>
    <circle cx="202" cy="150" r="12" fill="${aux}"/>
    <circle cx="238" cy="150" r="12" fill="#dddddd"/>
    <path d="M178 630 C310 494 426 734 574 568 S810 512 938 632" fill="none" stroke="${accent}" stroke-width="18" stroke-linecap="round" opacity="0.9"/>
    <path d="M218 228 H940 M218 292 H840 M218 356 H900 M218 420 H748" stroke="rgba(255,255,255,0.38)" stroke-width="24" stroke-linecap="round"/>
    <path d="M1092 168 H1328 M1092 224 H1276 M1092 280 H1348" stroke="#222222" stroke-opacity="0.22" stroke-width="18" stroke-linecap="round"/>
    <path d="M1092 482 H1338 M1092 538 H1288 M1092 594 H1346 M1092 650 H1248" stroke="#222222" stroke-opacity="0.22" stroke-width="18" stroke-linecap="round"/>
  </g>
</svg>`)
}

async function generateScene(scene) {
  if (fallbackOnly) return fallbackSvg(scene)
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing. Use --fallback to generate local graphics.")
  }

  const prompt = [
    `Create a high-fidelity project detail image for the Lingoost course "${scene.title}".`,
    scene.prompt,
    "The image should feel like a real class is currently demonstrating the project on screen.",
    "Use a screenshot-like 16:9 composition with realistic software panels, viewport content, cursor callouts and production context.",
    "No readable words, no brand names rendered as text, no official logos, no watermark, no subtitles, no thumbnail title typography.",
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
    throw new Error(`OpenAI image generation failed for ${scene.id}: ${response.status} ${text}`)
  }

  const json = await response.json()
  const base64 = json?.data?.[0]?.b64_json
  if (!base64) throw new Error(`No image payload returned for ${scene.id}`)
  return Buffer.from(base64, "base64")
}

async function writeScene(scene, imageBytes, outputPath) {
  await sharp(imageBytes)
    .resize(CANVAS_WIDTH, MODEL_HEIGHT, { fit: "cover" })
    .extract({
      left: 0,
      top: Math.floor((MODEL_HEIGHT - FINAL_HEIGHT) / 2),
      width: CANVAS_WIDTH,
      height: FINAL_HEIGHT,
    })
    .png({ compressionLevel: 9 })
    .toFile(outputPath)
}

await fs.mkdir(OUT_DIR, { recursive: true })

const selected = scenes.filter((scene) => !only || String(scene.id) === String(only))

for (const scene of selected) {
  const outputPath = path.join(OUT_DIR, `course-${scene.id}-workshop.png`)
  if (!overwrite) {
    try {
      await fs.access(outputPath)
      console.log(`[skip] ${scene.id} ${outputPath}`)
      continue
    } catch {
      // continue
    }
  }

  console.log(`[generate] ${scene.id} ${scene.title}`)
  const imageBytes = await generateScene(scene)
  await writeScene(scene, imageBytes, outputPath)
  const metadata = await sharp(outputPath).metadata()
  console.log(`[done] ${path.relative(ROOT, outputPath)} ${metadata.width}x${metadata.height}`)
}
