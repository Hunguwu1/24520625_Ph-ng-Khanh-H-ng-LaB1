// Replays an immutable Git baseline and the working tree; never patches the baseline.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, writeFile, symlink, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import puppeteer from 'puppeteer-core';

const root = fileURLToPath(new URL('../', import.meta.url));
const baseline = 'dd2bc9258fdfb9d4c2832fbba95c2d49add96c86';
const git = (...args) => execFileSync('git', args, { cwd: root });
const prefix = git('rev-parse', '--show-prefix').toString().trim();
const reportDir = path.join(root, 'reports', 'ai-audit');
const candidates = [process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const executablePath = candidates.find((candidate) => candidate && existsSync(candidate));
if (!executablePath) throw new Error('Set CHROME_PATH to your Chrome/Edge executable.');

const snapshot = await realpath(await mkdtemp(path.join(tmpdir(), 'piano-audit-')));
const servers = [];
let browser;
try {
  // Read only tracked files from the historical tree. No checkout/reset of user files.
  const files = git('ls-tree', '-r', '--name-only', baseline, '--', '.')
    .toString().trim().split('\n').filter(Boolean);
  for (const file of files) {
    const target = path.join(snapshot, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, git('show', `${baseline}:${prefix}${file}`));
  }
  await symlink(path.join(root, 'node_modules'), path.join(snapshot, 'node_modules'),
    process.platform === 'win32' ? 'junction' : 'dir');
  await mkdir(reportDir, { recursive: true });
  browser = await puppeteer.launch({ executablePath, headless: true });

  async function inspect(directory, label) {
    const server = await createServer({ root: directory, configFile: false, plugins: [react()],
      server: { host: '127.0.0.1', port: 0 }, logLevel: 'error' });
    servers.push(server);
    await server.listen();
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812 });
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
    await page.goto(`http://127.0.0.1:${server.httpServer.address().port}`, { waitUntil: 'networkidle0' });
    const result = await page.evaluate(() => ({
      viewport: innerWidth,
      pageWidth: document.documentElement.scrollWidth,
      horizontalOverflow: [...document.querySelectorAll('body *')]
        .filter((e) => e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1)
        .map((e) => ({ element: e.className || e.tagName,
          clientWidth: e.clientWidth, scrollWidth: e.scrollWidth })),
      language: document.documentElement.lang,
      keyCount: document.querySelectorAll('.piano-key').length,
      explicitLabels: [...document.querySelectorAll('select,input,textarea')]
        .every((e) => e.id && document.querySelector(`label[for="${CSS.escape(e.id)}"]`)),
    }));
    const key = await page.$('[aria-label="C4"]');
    await key.focus();
    await page.keyboard.down('Space');
    await page.keyboard.down('Enter');
    await page.keyboard.up('Enter');
    await page.waitForFunction(() => document.querySelector('[aria-label="C4"]') !== null);
    result.pressedWhileSpaceHeld = await key.evaluate((e) => e.getAttribute('aria-pressed') === 'true');
    await page.screenshot({ path: path.join(reportDir, `${label}.png`), fullPage: true });
    await page.keyboard.up('Space');
    result.releasedAfterBothUp = await key.evaluate((e) => e.getAttribute('aria-pressed') === 'false');
    assert.equal(result.keyCount, 88);
    await page.close();
    return result;
  }

  const before = await inspect(snapshot, 'before');
  const after = await inspect(root, 'after');
  assert.equal(before.pressedWhileSpaceHeld, false, 'Baseline must reproduce early release');
  assert.ok(before.horizontalOverflow.some((e) => e.element === 'piano-scroll'));
  assert.equal(before.language, 'en');
  assert.equal(before.explicitLabels, false);
  assert.equal(after.pressedWhileSpaceHeld, true);
  assert.equal(after.releasedAfterBothUp, true);
  assert.equal(after.pageWidth, 375);
  assert.deepEqual(after.horizontalOverflow, []);
  assert.equal(after.language, 'vi');
  assert.equal(after.explicitLabels, true);
  const report = { baseline, fixedSourceCommit: git('rev-parse', 'HEAD').toString().trim(),
    checkedAt: new Date().toISOString(), browser: await browser.version(),
    checks: '3 historical bugs reproduced; all 3 corrected; explicit label also checked',
    before, after };
  await writeFile(path.join(reportDir, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser?.close();
  for (const server of servers) await server.close();
  // Delete the known junction itself before removing the task-owned temporary snapshot.
  if (existsSync(path.join(snapshot, 'node_modules'))) {
    await rm(path.join(snapshot, 'node_modules'), { recursive: false, force: true }).catch(async () => {
      const { rmdir } = await import('node:fs/promises');
      await rmdir(path.join(snapshot, 'node_modules'));
    });
  }
  const resolved = path.resolve(snapshot);
  assert.equal(path.dirname(resolved), await realpath(tmpdir()));
  assert.ok(path.basename(resolved).startsWith('piano-audit-'));
  await rm(resolved, { recursive: true, force: true });
}
