import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE)
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } })
  await page.goto('http://127.0.0.1:5173')
  await page.locator('.leaderboard').waitFor()
  const widths = []
  for (const width of [320, 375, 768, 1280]) {
    await page.setViewportSize({ width, height: 812 })
    const value = await page.evaluate(() => ({ viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth }))
    assert.equal(value.scrollWidth, width)
    widths.push(value)
  }
  await page.setViewportSize({ width: 375, height: 812 })
  const controls = await page.locator('input, select, textarea').evaluateAll(elements => elements.map(element => ({
    id: element.id, tag: element.tagName,
    explicitLabels: [...element.labels].filter(label => label.htmlFor === element.id).length,
  })))
  assert.equal(controls.length, 5)
  assert.equal(new Set(controls.map(control => control.id)).size, 5)
  for (const control of controls) {
    assert.ok(control.id)
    assert.equal(control.explicitLabels, 1)
    const label = page.locator('label').filter({ has: page.locator(`[id="${control.id}"]`) })
    await label.click({ position: { x: 5, y: 5 } })
    assert.equal(await page.evaluate(() => document.activeElement.id), control.id)
  }
  await page.reload()
  const reached = []
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab')
    reached.push(await page.evaluate(() => ({
      id: document.activeElement.id, tag: document.activeElement.tagName,
      outline: getComputedStyle(document.activeElement).outlineStyle,
    })))
  }
  for (const control of controls) {
    assert.ok(reached.some(item => item.id === control.id && item.outline === 'solid'))
  }
  const table = page.locator('.table-scroll')
  await table.focus()
  await page.keyboard.press('ArrowRight')
  await page.waitForFunction(() => document.querySelector('.table-scroll').scrollLeft > 0)
  const tableScrollLeft = await table.evaluate(element => element.scrollLeft)
  const feed = page.getByRole('list', { name: 'Các sự kiện hạ gục' })
  await feed.focus()
  await page.keyboard.press('ArrowDown')
  await page.waitForFunction(() => document.querySelector('[role="list"]').scrollTop > 0)
  const feedScrollTop = await feed.evaluate(element => element.scrollTop)
  await page.locator('h1').scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'docs/audit/accessibility-375px.png', fullPage: true })
  const result = { widths, controls, reached, tableScrollLeft, feedScrollTop, passed: true }
  await writeFile('docs/audit/accessibility-checks.json', JSON.stringify(result, null, 2))
  console.log(JSON.stringify(result))
} finally {
  await browser.close()
}
