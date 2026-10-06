# M4 Performance Audit

**Status: PASS for the measured performance targets.** This does not mean every Lighthouse category scored 100.

Date: 2026-10-07 (Asia/Saigon). Local URL: http://127.0.0.1:5504/.

## User measurements

The three supplied Chrome Performance screenshots show:

| Run | LCP | CLS | Result |
| --- | --- | --- | --- |
| 1 | 1.53 s | 0 | PASS |
| 2 | 1.44 s | 0 | PASS |
| 3 | 1.52 s | 0 | PASS |

Mean LCP is approximately 1.50 s; median is 1.52 s; maximum is 1.53 s. Every displayed LCP is below 2 seconds and every displayed CLS is zero.

The owner confirmed the Slow 4G network preset. Viewport, CPU throttling, theme, and cache settings are not visible in the supplied screenshots and were not separately confirmed. INP is shown as a dash; no INP result is claimed.

The supplied Lighthouse screenshot shows Performance **100**, Accessibility **100**, Best Practices **92**, and SEO **83**, with simulated throttling and Clear storage enabled. The owner reports the same scores in three runs; one representative screenshot was supplied. Device selection and Lighthouse version are not visible. The screenshot URL includes `#contact`.

Evidence: `m4-user-run-1.png`, `m4-user-run-2.png`, `m4-user-run-3.png`, and `m4-user-lighthouse.png`.

## Independent load measurements

- Chrome 154.0.8037.98, headless; no user extensions.
- Playwright and Chrome DevTools Protocol, loading the current project from the local HTTP server.
- Source and served bytes matched for HTML, CSS, JavaScript, and portrait.
- Widths 375 and 1280 pixels; height 900; device scale factor 1.
- Light and dark themes; three fresh browser contexts per combination.
- Cache disabled; CPU slowdown multiplier 1.
- Network uses DevTools Slow 4G values, formerly called Fast 3G: nominal 1.6 Mbps download, 750 Kbps upload, and 150 ms RTT. Adjusted CDP values are 180,000 bytes/s download, 84,375 bytes/s upload, and 562.5 ms request latency.
- Buffered PerformanceObserver entries recorded LCP and layout shifts. Measurements waited two seconds after load without interaction. CLS uses the largest session-window total and excludes shifts with recent input.

| Width | Theme | LCP run 1 | LCP run 2 | LCP run 3 | CLS in all runs |
| --- | --- | --- | --- | --- | --- |
| 375 px | Light | 1.508 s | 1.448 s | 1.384 s | 0 |
| 375 px | Dark | 1.400 s | 1.436 s | 1.424 s | 0 |
| 1280 px | Light | 1.376 s | 1.360 s | 1.316 s | 0 |
| 1280 px | Dark | 1.356 s | 1.368 s | 1.376 s | 0 |

All 12 runs passed LCP below 2 seconds and CLS zero. The portrait loaded, theme matched, and no JavaScript runtime exceptions occurred in these measurements. These are load measurements, not a long interactive session.

## Independent Lighthouse results

Lighthouse 13.5.0, navigation audit, simulated throttling, Chrome extensions disabled. Browser cache was cleared after setting the requested theme and before each audit. Storage reset was disabled to retain that theme. Each viewport/theme combination below was audited once.

Mobile used Lighthouse default mobile throttling (150 ms RTT, 1638.4 Kbps throughput, 4x CPU slowdown). Desktop used Lighthouse's official desktop configuration (40 ms RTT, 10,240 Kbps throughput, 1x CPU slowdown). Exact settings and raw metrics are saved in the JSON reports.

| Width / mode | Theme | Performance | Accessibility | Best Practices | SEO | Simulated LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 375 px / Mobile | Light | 100 | 100 | 100 | 83 | 1.207 s | 0 |
| 375 px / Mobile | Dark | 100 | 100 | 100 | 83 | 1.205 s | 0 |
| 1280 px / Desktop | Light | 100 | 100 | 100 | 83 | 0.291 s | 0 |
| 1280 px / Desktop | Dark | 100 | 100 | 100 | 83 | 0.292 s | 0 |

Lighthouse simulated LCP values are separate from the directly observed Slow 4G measurements above. The independent scores do not replace the owner's results; browser environment and test settings differ. No Lighthouse run warnings were returned.

An additional desktop experiment using mobile network/CPU throttling scored Performance 97 in both themes, with LCP about 1.21 s and CLS 0. It is preserved in `m4-extra-desktop-mobile-throttling-*` and in the combined JSON. It is separate from the official desktop preset; Performance 100 is not claimed under every possible test condition.

## Existing performance measures and remaining findings

- Portrait size: 28,189 bytes, with intrinsic width 399 and height 501 reserved in HTML.
- Both application scripts use `defer`.
- The page uses a system font and no external font or framework downloads.
- No application source changes were made during this audit. The existing implementation achieved the recorded performance targets; no before/after speed improvement is claimed.
- Local-server traces identify cache-lifetime, render-blocking, and LCP-discovery opportunities. These remain possible improvements even when Performance scores 100.
- Independent SEO audits report a missing meta description and `robots.txt is not valid`. SEO remains 83.
- The owner's Best Practices score is 92. Its specific failing audits cannot be determined from the supplied score screenshot alone. The independent browser scored 100 in the final runs.

## Saved evidence

- `m4-check-results.json`: project hashes, all 12 observed runs, final Lighthouse summaries, and the additional desktop experiment.
- `m4-lighthouse-375-light.html` / `.json`.
- `m4-lighthouse-375-dark.html` / `.json`.
- `m4-lighthouse-1280-light.html` / `.json`.
- `m4-lighthouse-1280-dark.html` / `.json`.
- `m4-extra-desktop-mobile-throttling-light.html` / `.json` and the dark equivalents.
- Four owner screenshots listed above.

The Lighthouse JSON files contain audit results and configuration, not exported Chrome Performance recordings from the owner. No owner trace files were supplied.

References: [DevTools network preset definitions](https://github.com/ChromeDevTools/devtools-frontend/blob/main/front_end/core/sdk/NetworkManager.ts), [Lighthouse throttling](https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md), and [Lighthouse desktop configuration](https://github.com/GoogleChrome/lighthouse/blob/main/core/config/desktop-config.js).

## Conclusion

The tested M4 performance targets pass: Performance 100 under the recorded standard Lighthouse configurations, LCP below 2 seconds under the recorded Slow 4G load conditions, and CLS zero. Accessibility also scores 100 in the supplied and independent Lighthouse results. SEO is 83, and the supplied Best Practices score is 92; this report does not claim four-category 100 or completion of every HW1 requirement.
