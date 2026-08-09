/**
 * OG 이미지 전용 Pretendard Bold 서브셋 생성기
 *
 * 원본 woff 는 1.1MB(한글 전체)라 빌드 산출물로 들고 다닐 이유가 없다.
 * app/opengraph-image.tsx 에서 실제로 쓰는 글자만 남긴다.
 *
 * 사용: node scripts/subset-og-font.mjs
 * 선행: pip install fonttools brotli  (pyftsubset 이 PATH 에 있어야 한다)
 *
 * ★ opengraph-image.tsx 의 문구를 바꾸면 이 스크립트를 다시 돌릴 것.
 *   서브셋에 없는 글자는 오류 없이 조용히 두부(.notdef)로 렌더된다.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, statSync, unlinkSync, existsSync } from 'node:fs'

const SRC = 'assets/Pretendard-Bold.woff'
const OUT = 'assets/Pretendard-Bold.subset.woff'
const TXT = 'assets/.og-chars.txt'
/** 원본 woff 는 1.1MB 라 커밋하지 않는다(.gitignore). 없으면 받아온다 */
const SRC_URL = 'https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/static/woff/Pretendard-Bold.woff'

// opengraph-image.tsx 에 등장하는 모든 문자
const TEXT = [
  'SoSpatial',
  'AI-READY',
  '공간 데이터 플랫폼',
  '흩어진 공간 데이터를 바로 쓸 수 있게',
  '찾고 · 분석하고 · 함께 활용하세요',
].join('')

if (!existsSync(SRC)) {
  console.log(`원본 없음 — 내려받는 중: ${SRC_URL}`)
  const res = await fetch(SRC_URL)
  if (!res.ok) throw new Error(`다운로드 실패 ${res.status}`)
  writeFileSync(SRC, Buffer.from(await res.arrayBuffer()))
}

// 명령줄 인코딩에 기대지 않도록 UTF-8 파일로 넘긴다
writeFileSync(TXT, TEXT, 'utf8')

execFileSync(
  'pyftsubset',
  [
    SRC,
    `--output-file=${OUT}`,
    `--text-file=${TXT}`,
    '--flavor=woff',
    // Satori 는 복잡한 OpenType 레이아웃을 쓰지 않는다. 커닝만 남긴다
    '--layout-features=kern',
    '--no-hinting',
    '--desubroutinize',
    '--drop-tables+=DSIG',
  ],
  { stdio: 'inherit' }
)
unlinkSync(TXT)

const before = statSync(SRC).size
const after = statSync(OUT).size
console.log(
  `${OUT}  ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(1)}KB ` +
    `(${((after / before) * 100).toFixed(1)}%)  ${[...new Set(TEXT)].length}자`
)
console.log('signature:', readFileSync(OUT).subarray(0, 4).toString('latin1'))
