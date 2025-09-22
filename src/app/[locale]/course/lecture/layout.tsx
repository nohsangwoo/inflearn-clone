import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lecture - Lingoost',
  description: 'Watch course lectures',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function LectureLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}