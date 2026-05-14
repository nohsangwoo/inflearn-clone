import { toCdnUrl } from "@/lib/brand"

export const COURSE_PREVIEW_PLACEHOLDER = "/course-preview-placeholder.svg"

export function getCoursePreviewImage(value?: string | null) {
  return toCdnUrl(value) ?? COURSE_PREVIEW_PLACEHOLDER
}
