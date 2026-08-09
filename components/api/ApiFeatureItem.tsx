import { IconBadge } from '@/components/ui/IconBadge'
import type { ApiFeature } from '@/lib/content/api'

/**
 * 특징 밴드 항목 — 원본 :595-603
 *   flex / align-items flex-start / gap 14px
 *   배지 36×36 radius 9px  accent 0.1, 아이콘 16
 *   제목 13.5px 600 #fff, margin-bottom 4px
 *   설명 12px ink-38 line-height 1.55
 */
export function ApiFeatureItem({ icon: Icon, title, desc }: ApiFeature) {
  return (
    <div className="flex items-start gap-3.5">
      <IconBadge size={36} radius="field">
        <Icon size={16} />
      </IconBadge>
      <div>
        <div className="mb-1 text-13-5 font-semibold text-ink">{title}</div>
        <div className="text-12 leading-1-55 text-ink-38">{desc}</div>
      </div>
    </div>
  )
}
