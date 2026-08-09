/** /request/source 폼 computed style 덤프 */
import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
await page.goto('http://localhost:3000/request/source')
await page.waitForLoadState('networkidle')
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(700)

const m = await page.evaluate(() => {
  const cs = (el) => getComputedStyle(el)
  const b = (el) => {
    const r = el.getBoundingClientRect()
    return { x: +r.x.toFixed(2), y: +(r.y + scrollY).toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }
  }
  const sec = document.querySelector('main section')
  const cont = sec.children[0]
  const back = cont.children[0]
  const steps = cont.children[1]
  const grid = cont.children[2]
  const formCard = grid.children[0]
  const guide = grid.children[1]
  const form = formCard.children[0]
  const header = form.children[0]
  const row1 = form.children[1]
  const row2 = form.children[2]
  const fmt = form.children[3]
  const notes = form.children[4]
  const submitRow = form.children[5]

  const field1 = row1.children[0]
  const input1 = field1.children[1]
  const label1 = field1.children[0]
  const regionField = row1.children[1]
  const varField = row2.children[1]
  const varList = varField.children[1]
  const addBtn = varList.children[varList.children.length - 1]
  const textarea = notes.children[1]
  const submitBtn = submitRow.children[0]
  const radios = fmt.children[1]

  return {
    section: { padding: `${cs(sec).paddingTop} ${cs(sec).paddingRight} ${cs(sec).paddingBottom}` },
    backLink: { ...b(back), mb: cs(back).marginBottom, gap: cs(back).columnGap, fontSize: cs(back.children[1]).fontSize, color: cs(back.children[1]).color },
    steps: { ...b(steps), mb: cs(steps).marginBottom, gap: cs(steps).columnGap },
    grid: { ...b(grid), cols: cs(grid).gridTemplateColumns, gap: cs(grid).columnGap, align: cs(grid).alignItems },
    formCard: { ...b(formCard), padding: cs(formCard).padding, radius: cs(formCard).borderRadius, bg: cs(formCard).backgroundColor, border: `${cs(formCard).borderWidth} ${cs(formCard).borderColor}` },
    guide: { ...b(guide), padding: cs(guide).padding, radius: cs(guide).borderRadius, position: cs(guide).position, top: cs(guide).top },
    header: { ...b(header), gap: cs(header).columnGap, mb: cs(header).marginBottom },
    h2: { fontSize: cs(header.children[1].children[0]).fontSize, fontWeight: cs(header.children[1].children[0]).fontWeight, letterSpacing: cs(header.children[1].children[0]).letterSpacing },
    headerP: { fontSize: cs(header.children[1].children[1]).fontSize, color: cs(header.children[1].children[1]).color, mt: cs(header.children[1].children[1]).marginTop, ...b(header.children[1].children[1]) },
    row1: { ...b(row1), cols: cs(row1).gridTemplateColumns, gap: cs(row1).columnGap, mb: cs(row1).marginBottom },
    label1: { fontSize: cs(label1).fontSize, fontWeight: cs(label1).fontWeight, color: cs(label1).color, letterSpacing: cs(label1).letterSpacing, transform: cs(label1).textTransform, mb: cs(label1).marginBottom, ...b(label1) },
    input1: { ...b(input1), padding: `${cs(input1).paddingTop} ${cs(input1).paddingRight}`, bg: cs(input1).backgroundColor, border: `${cs(input1).borderWidth} ${cs(input1).borderColor}`, radius: cs(input1).borderRadius, fontSize: cs(input1).fontSize, color: cs(input1).color, lineHeight: cs(input1).lineHeight },
    regionSelectCount: regionField.children.length - 1,
    row2: { ...b(row2), cols: cs(row2).gridTemplateColumns, gap: cs(row2).columnGap, mb: cs(row2).marginBottom },
    varList: { ...b(varList), gap: cs(varList).rowGap, maxHeight: cs(varList).maxHeight, overflowY: cs(varList).overflowY, rows: varList.children.length },
    addBtn: { ...b(addBtn), padding: cs(addBtn).padding, bg: cs(addBtn).backgroundColor, border: `${cs(addBtn).borderWidth} ${cs(addBtn).borderStyle} ${cs(addBtn).borderColor}`, radius: cs(addBtn).borderRadius, fontSize: cs(addBtn).fontSize, color: cs(addBtn).color, textAlign: cs(addBtn).textAlign },
    formatRow: { ...b(radios), gap: cs(radios).columnGap, mb: cs(fmt).marginBottom, itemGap: cs(radios.children[0]).columnGap, accent: cs(radios.children[0].children[0]).accentColor, labelSize: cs(radios.children[0].children[1]).fontSize, labelColor: cs(radios.children[0].children[1]).color },
    textarea: { ...b(textarea), padding: cs(textarea).padding, minHeight: cs(textarea).minHeight, resize: cs(textarea).resize, lineHeight: cs(textarea).lineHeight, bg: cs(textarea).backgroundColor, border: `${cs(textarea).borderWidth} ${cs(textarea).borderColor}`, radius: cs(textarea).borderRadius, fontSize: cs(textarea).fontSize, color: cs(textarea).color, mb: cs(notes).marginBottom },
    submitBtn: { ...b(submitBtn), padding: `${cs(submitBtn).paddingTop} ${cs(submitBtn).paddingRight}`, bg: cs(submitBtn).backgroundColor, color: cs(submitBtn).color, radius: cs(submitBtn).borderRadius, fontSize: cs(submitBtn).fontSize, fontWeight: cs(submitBtn).fontWeight },
    submitRow: { gap: cs(submitRow).columnGap, noteSize: cs(submitRow.children[1]).fontSize, noteColor: cs(submitRow.children[1]).color },
    docHeight: document.documentElement.scrollHeight,
  }
})

console.log(JSON.stringify(m, null, 2))
await browser.close()
