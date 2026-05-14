---
name: baksal-course-imagegen
description: Generate Baksal Class course preview images using the project OPENAI_API_KEY and gpt-image-2, then compose exact English title/discount overlays.
---

# Baksal Course Imagegen

Use this project-local skill when creating or refreshing course preview images for the Baksal Class web app.

## Source Of Truth

- Read `docs/images2.0.md` before changing API parameters.
- Use `OPENAI_API_KEY` from the project `.env`.
- Generate visual backgrounds with `gpt-image-2`.
- Keep all visible image text in English.

## Output Contract

- Final images must be exactly `1200x781`.
- Store public course assets in `public/course-previews/`.
- Use stable filenames: `course-101.png`, `course-102.png`, etc.
- Point mock course `imageUrl` and `ogImageUrl` to `/course-previews/course-XXX.png`.

## Composition Rules

- Request a `1200x784` generated background because `gpt-image-2` requires dimensions to be multiples of 16.
- Crop the final composed result to `1200x781`.
- Do not rely on the image model for exact typography. Ask for a background with no readable text, then use local SVG overlays for:
  - brand label: `BAKSAL CLASS`
  - course title
  - short English subtitle
  - category chips
  - discount or cohort status badge
- Discount treatment should be high-contrast and noticeable but restrained: one red/pink pill or ribbon, not a noisy sale poster.

## Command

```bash
pnpm exec node scripts/generate-course-preview-images.mjs
```

Useful options:

```bash
pnpm exec node scripts/generate-course-preview-images.mjs --only=103 --overwrite
pnpm exec node scripts/generate-course-preview-images.mjs --quality=medium
pnpm exec node scripts/generate-course-preview-images.mjs --fallback --overwrite
```

`--fallback` creates deterministic local graphics without calling the API. Use it only when the OpenAI API is unavailable.
