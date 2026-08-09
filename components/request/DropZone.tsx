import { UploadIcon } from '@/components/icons/picker'

/**
 * 업로드 드롭존 — 원본 :1491-1506
 *   padding 32px / fill-03 / 2px dashed line-12 / radius 10px / center
 *   아이콘 28px stroke 1.5 ink-25, margin 0 auto 10px
 *   1행 13px ink-40 / margin-bottom 4px
 *   2행 11.5px ink-22 / margin-bottom 14px
 *   용량 박스 inline-flex / gap 12px / padding 8px 16px
 *        fill-04 / 1px line-08 / radius 8px
 *        비회원  11px ink-30 + 13px 600 ink-50
 *        구분선  1×28 line-10
 *        로그인  11px 액센트 + 13px 600 액센트
 *
 * 랜딩 카드의 축소판(:1200-1203)과는 스펙이 다르다.
 * 그쪽은 padding 16 / 1.5px dashed / radius 9 이며 용량 박스가 없다.
 */
export function DropZone({
  title,
  formats,
  limits,
}: {
  title: string
  formats: string
  limits?: { guestLabel: string; guest: string; memberLabel: string; member: string }
}) {
  return (
    <div className="rounded-btn border-2 border-dashed border-line-12 bg-fill-03 p-8 text-center">
      <span className="mx-auto mb-2.5 block w-fit text-ink-25">
        <UploadIcon size={28} />
      </span>
      <p className="mb-1 text-13 text-ink-40">{title}</p>
      <p className="mb-3.5 text-11-5 text-ink-22">{formats}</p>

      {limits && (
        <div className="inline-flex items-center gap-3 rounded-ctrl border border-line-08 bg-fill-04 px-4 py-2">
          <div className="text-center">
            <span className="block text-11 text-ink-30">{limits.guestLabel}</span>
            <span className="text-13 font-semibold text-ink-50">{limits.guest}</span>
          </div>
          <div className="h-7 w-px bg-line-10" />
          <div className="text-center">
            <span className="block text-11 text-accent">{limits.memberLabel}</span>
            <span className="text-13 font-semibold text-accent">{limits.member}</span>
          </div>
        </div>
      )}
    </div>
  )
}
