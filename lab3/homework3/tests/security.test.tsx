import assert from 'node:assert/strict'
import { test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import DropCard from '../src/components/DropCard'
import VirtualList from '../src/components/VirtualList'

test('drop titles and virtual feed text escape hostile HTML', () => {
  const payload = '<img src=x onerror="globalThis.xss=1"><script>bad()</script>'
  const card = renderToStaticMarkup(<DropCard drop={{
    id: 'security-probe', title: payload, priceVnd: 1,
    remainingStock: 1, dropEpochMs: Date.now() + 60_000,
  }} />)
  const feed = renderToStaticMarkup(<VirtualList
    items={[{ id: 'probe', text: payload }]} height={360} itemHeight={72}
    getKey={item => item.id} renderItem={item => <span>{item.text}</span>}
  />)
  for (const html of [card, feed]) {
    assert.ok(html.includes('&lt;img'))
    assert.ok(html.includes('&lt;script&gt;'))
    assert.ok(!html.includes('<img'))
    assert.ok(!html.includes('<script'))
  }
})
