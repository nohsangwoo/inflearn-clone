import fs from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const publicDir = path.join(root, "public");
const appDir = path.join(root, "src", "app");
const fontDir = path.join(publicDir, "fonts", "paperlogy");

const colors = {
  primary: "#ff385c",
  primaryActive: "#e00b41",
  ink: "#222222",
  body: "#3f3f3f",
  muted: "#6a6a6a",
  soft: "#f7f7f7",
  hairline: "#dddddd",
  canvas: "#ffffff",
};

const fontStack = "Paperlogy, Inter, Arial, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";

function fontFaceCss() {
  const semiBold = readFileSync(path.join(fontDir, "Paperlogy-6SemiBold.woff2")).toString("base64");
  const extraBold = readFileSync(path.join(fontDir, "Paperlogy-8ExtraBold.woff2")).toString("base64");
  const black = readFileSync(path.join(fontDir, "Paperlogy-9Black.woff2")).toString("base64");

  return `
    @font-face { font-family: 'Paperlogy'; font-weight: 600; font-style: normal; src: url(data:font/woff2;base64,${semiBold}) format('woff2'); }
    @font-face { font-family: 'Paperlogy'; font-weight: 800; font-style: normal; src: url(data:font/woff2;base64,${extraBold}) format('woff2'); }
    @font-face { font-family: 'Paperlogy'; font-weight: 900; font-style: normal; src: url(data:font/woff2;base64,${black}) format('woff2'); }
  `;
}

function iconSvg(size = 512) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="124" fill="${colors.primary}"/>
  <path d="M155 141C155 126.641 166.641 115 181 115H337C351.359 115 363 126.641 363 141V371C363 385.359 351.359 397 337 397H181C166.641 397 155 385.359 155 371V141Z" fill="white"/>
  <path d="M198 175H302" stroke="${colors.primary}" stroke-width="22" stroke-linecap="round"/>
  <path d="M198 225H280" stroke="${colors.primary}" stroke-width="22" stroke-linecap="round" opacity="0.9"/>
  <path d="M198 275H250" stroke="${colors.primary}" stroke-width="22" stroke-linecap="round" opacity="0.75"/>
  <circle cx="323" cy="316" r="55" fill="${colors.primary}"/>
  <path d="M307 289L348 316L307 343V289Z" fill="white"/>
  <path d="M137 187C118 197 106 218 106 256C106 294 118 315 137 325" stroke="white" stroke-width="28" stroke-linecap="round" opacity="0.92"/>
  <path d="M375 187C394 197 406 218 406 256C406 294 394 315 375 325" stroke="white" stroke-width="28" stroke-linecap="round" opacity="0.92"/>
</svg>`;
}

function logoWideSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="960" height="240" viewBox="0 0 960 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>${fontFaceCss()}</style>
  <rect width="960" height="240" fill="white"/>
  <g transform="translate(36 36) scale(0.328125)">
    ${iconSvg().replace(/<\?xml[^>]*>\n?<svg[^>]*>/, "").replace("</svg>", "")}
  </g>
  <text x="232" y="113" fill="${colors.ink}" font-family="${fontStack}" font-size="66" font-weight="900" letter-spacing="0">링구스트</text>
  <text x="235" y="158" fill="${colors.body}" font-family="${fontStack}" font-size="28" font-weight="800" letter-spacing="0">Lingoost · Course marketplace by Ludgi Inc.</text>
  <text x="235" y="195" fill="${colors.muted}" font-family="${fontStack}" font-size="23" font-weight="600" letter-spacing="0">강의를 만들고, 판매하고, 수강하는 링구스트</text>
</svg>`;
}

function ogSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>${fontFaceCss()}</style>
  <rect width="1200" height="630" fill="${colors.canvas}"/>
  <circle cx="1056" cy="108" r="172" fill="${colors.primary}" opacity="0.08"/>
  <circle cx="104" cy="560" r="148" fill="${colors.primary}" opacity="0.07"/>
  <rect x="64" y="64" width="1072" height="502" rx="42" fill="${colors.canvas}" stroke="${colors.hairline}" stroke-width="2"/>
  <g transform="translate(104 102) scale(0.15625)">
    ${iconSvg().replace(/<\?xml[^>]*>\n?<svg[^>]*>/, "").replace("</svg>", "")}
  </g>
  <text x="208" y="150" fill="${colors.primary}" font-family="${fontStack}" font-size="44" font-weight="900" letter-spacing="0">링구스트</text>
  <text x="104" y="260" fill="${colors.ink}" font-family="${fontStack}" font-size="60" font-weight="900" letter-spacing="0">Build, sell, and learn</text>
  <text x="104" y="332" fill="${colors.ink}" font-family="${fontStack}" font-size="60" font-weight="900" letter-spacing="0">with Lingoost</text>
  <text x="108" y="397" fill="${colors.body}" font-family="${fontStack}" font-size="25" font-weight="600" letter-spacing="0">Seasonal launches, HLS learning, creator dashboards.</text>
  <text x="108" y="432" fill="${colors.body}" font-family="${fontStack}" font-size="25" font-weight="600" letter-spacing="0">SEO, captions, and manual enrollment approval.</text>
  <g font-family="${fontStack}" font-size="24" font-weight="700" letter-spacing="0">
    <rect x="104" y="462" width="154" height="52" rx="26" fill="${colors.primary}"/>
    <text x="132" y="497" fill="white">Courses</text>
    <rect x="276" y="462" width="146" height="52" rx="26" fill="${colors.soft}" stroke="${colors.hairline}"/>
    <text x="304" y="497" fill="${colors.ink}">Creators</text>
    <rect x="440" y="462" width="152" height="52" rx="26" fill="${colors.soft}" stroke="${colors.hairline}"/>
    <text x="468" y="497" fill="${colors.ink}">Students</text>
    <rect x="610" y="462" width="116" height="52" rx="26" fill="${colors.soft}" stroke="${colors.hairline}"/>
    <text x="640" y="497" fill="${colors.ink}">SEO</text>
  </g>
  <rect x="810" y="154" width="226" height="296" rx="30" fill="${colors.soft}" stroke="${colors.hairline}"/>
  <rect x="840" y="188" width="166" height="96" rx="18" fill="${colors.primary}"/>
  <path d="M906 219L951 236L906 253V219Z" fill="white"/>
  <rect x="840" y="314" width="158" height="18" rx="9" fill="${colors.ink}" opacity="0.9"/>
  <rect x="840" y="352" width="116" height="16" rx="8" fill="${colors.muted}" opacity="0.45"/>
  <rect x="840" y="386" width="126" height="34" rx="17" fill="${colors.primary}" opacity="0.14"/>
  <text x="866" y="410" fill="${colors.primary}" font-family="${fontStack}" font-size="20" font-weight="800" letter-spacing="0">HLS READY</text>
</svg>`;
}

function iconMaskableSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="${colors.primary}"/>
  <g transform="translate(56 56) scale(0.78125)">
    ${iconSvg().replace(/<\?xml[^>]*>\n?<svg[^>]*>/, "").replace("</svg>", "")}
  </g>
</svg>`;
}

function icoFromPngs(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const entries = [];
  let offset = 6 + images.length * 16;
  for (const image of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(image.size >= 256 ? 0 : image.size, 0);
    entry.writeUInt8(image.size >= 256 ? 0 : image.size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(image.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += image.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((image) => image.buffer)]);
}

async function pngFromSvg(svg, size, outPath) {
  await sharp(Buffer.from(svg))
    .resize(size, size, { fit: "contain" })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath);
}

async function main() {
  await fs.mkdir(publicDir, { recursive: true });
  await fs.mkdir(appDir, { recursive: true });

  const icon = iconSvg();
  const maskableIcon = iconMaskableSvg();
  const wideLogo = logoWideSvg();
  const og = ogSvg();

  await fs.writeFile(path.join(publicDir, "logo.svg"), icon);
  await fs.writeFile(path.join(publicDir, "logo-wide.svg"), wideLogo);
  await fs.writeFile(path.join(publicDir, "og-image.svg"), og);

  await pngFromSvg(icon, 512, path.join(publicDir, "logo.png"));
  await sharp(Buffer.from(wideLogo)).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(path.join(publicDir, "logo-wide.png"));
  await sharp(Buffer.from(og)).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(path.join(publicDir, "og-image.png"));

  const iconTargets = [
    ["android-chrome-192x192.png", 192, maskableIcon],
    ["android-chrome-512x512.png", 512, maskableIcon],
    ["apple-touch-icon.png", 180, icon],
    ["icon-144x144.png", 144, icon],
    ["favicon-16x16.png", 16, icon],
    ["favicon-32x32.png", 32, icon],
  ];

  for (const [file, size, svg] of iconTargets) {
    await pngFromSvg(svg, size, path.join(publicDir, file));
  }

  const icoPngs = await Promise.all(
    [16, 32, 48].map(async (size) => ({
      size,
      buffer: await sharp(Buffer.from(icon)).resize(size, size).png().toBuffer(),
    })),
  );
  await fs.writeFile(path.join(publicDir, "favicon.ico"), icoFromPngs(icoPngs));

  for (const file of ["favicon.ico", "favicon-16x16.png", "favicon-32x32.png", "apple-touch-icon.png", "android-chrome-192x192.png", "android-chrome-512x512.png"]) {
    await fs.copyFile(path.join(publicDir, file), path.join(appDir, file));
  }

  console.log("Generated Lingoost brand assets.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
