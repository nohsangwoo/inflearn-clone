"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Creator = { id: string; name: string; avatar: string }

export function CreatorsShowcase({
  title = "인프런 지식공유자",
  creators,
}: {
  title?: string
  creators: Creator[]
}) {
  return (
    <div className="rounded-xl border bg-muted/40">
      <div className="px-4 py-6 sm:px-6">
        <h2 className="text-center text-lg font-semibold mb-6">{title}</h2>

        {/* 모바일: 가로 스크롤, 데스크탑: 가운데 정렬 그리드 */}
        <div className="overflow-x-auto">
          <div className="mx-auto flex w-max gap-6 px-1 sm:w-full sm:flex-wrap sm:justify-center">
            {creators.map((c) => (
              <div key={c.id} className="flex w-20 flex-col items-center gap-2 sm:w-24">
                <div className="rounded-full border bg-background p-1 shadow-xs">
                  <Avatar className="size-14">
                    <AvatarImage src={c.avatar} alt={c.name} />
                    <AvatarFallback>{c.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="w-full truncate text-center text-xs text-foreground/90" title={c.name}>
                  {c.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatorsShowcase


