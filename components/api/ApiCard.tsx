import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { IconBadge } from '@/components/ui/IconBadge'
import type { ApiCardItem } from '@/lib/content/api'

/**
 * API 카드 — 원본 :641-657
 *   카드   #242424 / 1px line-07 / radius 14px / padding 20px / cursor pointer
 *          hover border-color rgba(196,168,130,0.3)
 *   헤더   flex / gap 10px / margin-bottom 10px
 *   배지   32×32 radius 8px accent 0.1, 아이콘 15
 *   이름   13.5px 600 #fff
 *   경로   11px ink-30
 *   설명   12px ink-40 line-height 1.55 / margin-bottom 12px
 *   태그   gap 5px / padding 2px 8px / radius 4px / 10.5px / fill-05 / ink-40
 */
export function ApiCard({ icon: Icon, name, path, desc, tags }: ApiCardItem) {
  return (
    <Card interactive className="p-5">
      <div className="mb-2.5 flex items-center gap-2.5">
        <IconBadge size={32} radius="ctrl">
          <Icon size={15} />
        </IconBadge>
        <div>
          <div className="text-13-5 font-semibold text-ink">{name}</div>
          <div className="text-11 text-ink-30">{path}</div>
        </div>
      </div>
      <p className="mb-3 text-12 leading-1-55 text-ink-40">{desc}</p>
      <div className="flex flex-wrap gap-1.25">
        {tags.map((tag) => (
          <Chip key={tag} variant="tag">
            {tag}
          </Chip>
        ))}
      </div>
    </Card>
  )
}
