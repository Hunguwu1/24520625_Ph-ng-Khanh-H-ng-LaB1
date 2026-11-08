// Run with PLAYWRIGHT_MODULE pointing to the installed playwright entry point.
import { writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE)
const stage = process.argv[2] ?? 'before'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } })
  const page = await context.newPage()
  const cdp = await context.newCDPSession(page)
  await cdp.send('Runtime.enable')
  const consoleEvents = []
  cdp.on('Runtime.consoleAPICalled', event => {
    consoleEvents.push({ type: event.type, values: event.args.map(arg => arg.value ?? arg.description) })
  })
  await page.clock.install({ time: new Date('2026-11-08T15:00:00Z') })
  await page.goto('http://127.0.0.1:5173')
  await page.locator('.timer').first().waitFor()
  await page.clock.runFor(5000)
  const beforeReload = await page.locator('.timer').first().textContent()
  await page.reload()
  await page.locator('.timer').first().waitFor()
  const afterReload = await page.locator('.timer').first().textContent()
  const timer = { beforeReload, afterReload }
  assert.equal(beforeReload, '00:25')
  assert.equal(afterReload, stage === 'before' ? '00:30' : '00:25')
  await page.evaluate(value => console.log('AUDIT timer reload', JSON.stringify(value)), timer)
  await page.screenshot({ path: `docs/audit/timer-reload-${stage}.png` })
  await page.clock.runFor(31000)
  const card = page.locator('.product-card').first()
  const button = card.locator('button')
  for (let i = 0; i < 9; i++) {
    await button.click()
    await page.clock.runFor(1300)
    await page.waitForFunction(() => !document.querySelector('.product-card button').disabled)
  }
  await card.locator('select').selectOption('conflict')
  await button.click()
  const pending = await cdp.send('Runtime.evaluate', {
    expression: `JSON.stringify({stock: document.querySelector('.product-card > p:nth-of-type(2)').textContent, status: document.querySelector('.product-card .countdown [role="status"]').textContent, button: document.querySelector('.product-card button').textContent})`,
    returnByValue: true,
  })
  const pendingState = JSON.parse(pending.result.value)
  assert.equal(pendingState.stock, 'Còn lại: 0')
  assert.equal(pendingState.status, stage === 'before' ? 'Đã hết hàng' : 'Đang xác nhận lượt nhận')
  await page.evaluate(value => console.log('AUDIT last-unit pending', JSON.stringify(value)), pendingState)
  await page.screenshot({ path: `docs/audit/last-unit-${stage}.png` })
  await page.clock.runFor(1300)
  await page.waitForFunction(() => !document.querySelector('.product-card button').disabled)
  const rollback = await card.innerText()
  assert.match(rollback, /Còn lại: 1/)
  assert.match(rollback, /409/)
  await page.evaluate(() => console.log('AUDIT rollback', document.querySelector('.product-card').innerText))
  await card.locator('select').selectOption('success')
  await button.click()
  await page.clock.runFor(1300)
  await page.waitForFunction(() => document.querySelector('.product-card .purchase-message').textContent.includes('Nhận thành công'))
  assert.equal(await card.locator('.countdown [role="status"]').textContent(), 'Đã hết hàng')
  assert.equal(await button.isDisabled(), true)
  await page.evaluate(() => console.log('AUDIT final success', document.querySelector('.product-card').innerText))
  await writeFile(`docs/audit/ai-bugs-${stage}.json`, JSON.stringify({
    stage, browser: await browser.version(), transport: 'Chrome DevTools Protocol: Runtime.evaluate and Runtime.consoleAPICalled',
    clock: 'Playwright controlled clock; no real-time wait or backend request',
    timer, pendingState, rollback, consoleEvents,
  }, null, 2))
  console.log(JSON.stringify({ stage, timer, pendingState, rollbackVerified: true }))
} finally {
  await browser.close()
}
