import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
});
const results = [];
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(String(error)));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
const test = async (name, action) => {
  try { await action(); results.push({ name, passed: true }); }
  catch (error) { results.push({ name, passed: false, error: String(error) }); }
};
const history = () => page.locator('[aria-labelledby="history-heading"] li').allTextContents();
const hit = () => page.locator('output').textContent();
try {
  await page.goto('http://127.0.0.1:4173');
  await test('All seven audio files decode as real audio', async () => {
    const decoded = await page.evaluate(async () => {
      const context = new OfflineAudioContext(1, 1, 44100);
      return Promise.all(['tom1.mp3', 'kick.wav', 'snare.wav', 'hihat.wav', 'tom2.mp3', 'crash.mp3', 'ride.mp3'].map(async file => {
        const response = await fetch(`/sounds/${file}`);
        if (!response.ok) throw new Error(file);
        const buffer = await context.decodeAudioData(await response.arrayBuffer());
        return { file, duration: buffer.duration };
      }));
    });
    assert.equal(decoded.length, 7);
    assert(decoded.every(file => file.duration > 0));
    await writeFile(path.join(root, 'audio-validation.json'), JSON.stringify(decoded, null, 2));
  });
  await test('Seven physical shortcut keys hit the matching pad', async () => {
    for (const [key, name] of [['w','Tom 1'],['a','Kick'],['s','Snare'],['d','Hi-hat'],['j','Tom 2'],['k','Crash'],['l','Ride']]) {
      await page.keyboard.press(key);
      assert((await hit()).endsWith(name));
    }
  });
  await test('Holding a key does not repeat a hit', async () => {
    await page.keyboard.down('a');
    const before = await hit();
    await page.keyboard.down('a');
    await page.keyboard.down('a');
    await page.keyboard.up('a');
    assert.equal(await hit(), before);
  });
  await test('Typing in notes does not trigger pads', async () => {
    const before = await hit();
    await page.locator('#beat-note').fill('');
    await page.locator('#beat-note').pressSequentially('wasdjkl');
    assert.equal(await hit(), before);
    await page.locator('#beat-note').fill('');
  });
  await test('Shortcut toggle disables keys while mouse clicks still play', async () => {
    await page.getByRole('checkbox').uncheck();
    await page.locator('h1').click();
    const before = await hit();
    await page.keyboard.press('a');
    assert.equal(await hit(), before);
    await page.locator('[data-pad-id="kick"]').click();
    assert.notEqual(await hit(), before);
    await page.getByRole('checkbox').check();
  });
  await test('Pad activation turns off after feedback interval', async () => {
    const pad = page.locator('[data-pad-id="kick"]');
    await pad.click();
    assert.equal(await pad.getAttribute('aria-pressed'), 'true');
    await page.waitForFunction(() => document.querySelector('[data-pad-id="kick"]').getAttribute('aria-pressed') === 'false');
  });
  await test('Rapid repeated hits keep only ten newest history entries', async () => {
    for (let i = 0; i < 15; i++) await page.keyboard.press('a');
    assert.equal((await history()).length, 10);
    assert.equal((await history())[0].trim(), (await hit()).trim());
  });
  await test('Meter reacts to decoded sound and returns to silence', async () => {
    await page.locator('[data-pad-id="crash"]').click();
    await page.waitForFunction(() => document.querySelector('meter').value > -60, { timeout: 5000 });
    await page.waitForFunction(() => document.querySelector('meter').value === -60, { timeout: 15000 });
  });
  await test('Tab, Shift+Tab, Enter and Space work with visible focus and allow exit', async () => {
    const pad = page.locator('[data-pad-id="tom1"]');
    await pad.focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.locator(':focus').getAttribute('data-pad-id'), 'kick');
    const before = await hit();
    await page.keyboard.press('Enter');
    assert.notEqual(await hit(), before);
    const afterEnter = await hit();
    await page.keyboard.press('Space');
    assert.notEqual(await hit(), afterEnter);
    assert.equal(await page.locator(':focus').evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.locator(':focus').getAttribute('data-pad-id'), 'tom1');
    for (let i = 0; i < 7; i++) await page.keyboard.press('Tab');
    assert.equal(await page.locator(':focus').getAttribute('id'), 'beat-note');
  });
  await test('Physical key code is used even when produced character differs', async () => {
    await page.locator('h1').click();
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ă', code: 'KeyA', bubbles: true })));
    assert((await hit()).endsWith('Kick'));
  });
  await page.addScriptTag({ path: path.join(root, 'tools/node_modules/axe-core/axe.min.js') });
  const axe = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice'] } }));
  await writeFile(path.join(root, 'axe-results.json'), JSON.stringify(axe, null, 2));
  results.push({ name: 'Axe accessibility scan', passed: axe.violations.length === 0, violations: axe.violations.map(v => ({ id: v.id, description: v.description, nodes: v.nodes.map(n => n.target) })) });
  await page.goto('http://127.0.0.1:4173');
  await page.screenshot({ path: path.join(root, 'drum-kit-desktop.png'), fullPage: true });
  for (const width of [390, 320, 640]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    results.push({ name: `No horizontal overflow at ${width}px${width === 640 ? ' (1280px viewport at 200% equivalent layout width)' : ''}`, passed: !overflow });
    if (width === 390) await page.screenshot({ path: path.join(root, 'drum-kit-mobile.png'), fullPage: true });
    if (width === 640) await page.screenshot({ path: path.join(root, 'drum-kit-200-percent-layout.png'), fullPage: true });
  }
  results.push({ name: 'No browser runtime or audio errors', passed: errors.length === 0, errors });
} finally {
  await writeFile(path.join(root, 'functional-results.json'), JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(JSON.stringify(results, null, 2));
if (results.some(result => !result.passed)) process.exitCode = 1;

