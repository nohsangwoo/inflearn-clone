import { ImageResponse } from "next/og"
import { brand } from "@/lib/brand"

export const alt = "Lingoost online course marketplace"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          color: "#222222",
          padding: 64,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 34, fontWeight: 700, color: "#ff385c" }}>{brand.nameEn}</div>
          <div style={{ fontSize: 22, color: "#6a6a6a" }}>{brand.creator}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.08, letterSpacing: 0 }}>
            Sell, learn, and launch online courses
          </div>
          <div style={{ marginTop: 28, maxWidth: 880, fontSize: 30, lineHeight: 1.35, color: "#3f3f3f" }}>
            Seasonal course marketplace with HLS learning, subtitles, dubbing, SEO pages, and seller dashboards.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 22, color: "#222222" }}>
          {["Course marketplace", "Creator education", "HLS learning", "Ludgi Inc."].map((item) => (
            <div
              key={item}
              style={{
                border: "1px solid #dddddd",
                borderRadius: 999,
                padding: "12px 20px",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  )
}
