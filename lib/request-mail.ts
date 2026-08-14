/**
 * 운영자 알림 메일 본문 — 서버 전용 (app/api/requests/route.ts 가 사용).
 *
 * 구성 (4번 설계 3번):
 *   제목   [SoSpatial 요청] {방식 한글명} — {대표 필드}
 *   본문   공통 헤더(접수 id·시각 KST·회신 주소·방식) + 폼별 필드 한글 라벨 표.
 *          라벨 매핑에 없는 키는 원문 키로 그대로 출력해 누락을 막는다.
 *   병기   알림 미발송 접수가 남아 있으면 상단에 건수 표기 (조정 2 — mail_sent 기반)
 *
 * 값은 전부 사용자 입력이므로 반드시 이스케이프한다.
 */
type MailInput = {
  id: number
  createdAt: string
  method: string
  payload: Record<string, unknown>
  userEmail: string
  /** mail_sent=false 누적 건수. null = 집계 불가(컬럼 미적용 등) → 표기 생략 */
  unsent: number | null
}

const METHOD_LABEL: Record<string, string> = {
  source: '데이터 소스를 알고 있어요',
  upload: '데이터를 가지고 있어요',
  describe: '필요한 데이터를 설명할게요',
}

/** 폼 3종의 payload 키 → 한글 라벨 (각 폼의 payload 구성과 1:1) */
const FIELD_LABELS: Record<string, Record<string, string>> = {
  source: {
    dataset: 'Dataset (URL 또는 출처)',
    region: '지역',
    subRegion: '세부 지역',
    spatialUnit: '변환할 공간 단위',
    yearFrom: '기준 연도 (시작)',
    yearTo: '기준 연도 (종료)',
    variables: '필요한 변수',
    format: 'Output Format',
    notes: '추가 요청사항',
  },
  upload: {
    service: '연동 서비스',
    pickedFile: '선택 파일',
    spatialUnit: '변환할 공간 단위',
    yearFrom: '기준 연도 (시작)',
    yearTo: '기준 연도 (종료)',
  },
  describe: {
    text: '설명',
    length: '글자수',
  },
}

function esc(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function fmt(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—'
  if (Array.isArray(v)) return v.length ? v.map((x) => String(x)).join(', ') : '—'
  return String(v)
}

function subjectField(method: string, payload: Record<string, unknown>): string {
  if (method === 'source') return fmt(payload.dataset)
  if (method === 'upload') return fmt(payload.pickedFile ?? payload.service)
  const text = String(payload.text ?? '')
  return text ? text.slice(0, 30) + (text.length > 30 ? '…' : '') : '—'
}

export function buildRequestMail({ id, createdAt, method, payload, userEmail, unsent }: MailInput) {
  const label = METHOD_LABEL[method] ?? method
  const subject = `[SoSpatial 요청] ${label} — ${subjectField(method, payload)}`

  const labels = FIELD_LABELS[method] ?? {}
  const rows = Object.entries(payload)
    .filter(([k]) => k !== 'method')
    .map(([k, v]) => tr(labels[k] ?? k, fmt(v)))
    .join('')

  const kst = new Date(createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
  const unsentNote =
    unsent && unsent > 0
      ? `<p style="color:#b45309;margin:0 0 12px">⚠ 이 건 외에 알림 미발송 접수가 ${unsent}건 있습니다 — 대시보드의 requests 테이블(mail_sent=false)을 확인하세요.</p>`
      : ''

  const html = `
${unsentNote}
<p style="margin:0 0 12px"><strong>${esc(label)}</strong> 방식의 데이터 요청이 접수됐습니다.</p>
<table cellpadding="6" style="border-collapse:collapse;font-size:14px">
${tr('접수 번호', String(id))}
${tr('접수 시각 (KST)', kst)}
${tr('회신 주소', userEmail)}
${rows}
</table>
<p style="color:#888;font-size:12px;margin-top:16px">이 메일에 답장하면 요청자(${esc(userEmail)})에게 전달됩니다 (Reply-To).</p>
`.trim()

  return { subject, html }
}

function tr(label: string, value: string): string {
  return `<tr><td style="border:1px solid #ddd;color:#666;white-space:nowrap">${esc(label)}</td><td style="border:1px solid #ddd">${esc(value).replaceAll('\n', '<br>')}</td></tr>`
}
