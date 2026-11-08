import { useState, type ReactNode } from 'react'

interface VirtualListProps<T> {
  items: readonly T[]
  itemHeight: number
  height: number
  getKey: (item: T) => string
  renderItem: (item: T) => ReactNode
}

export default function VirtualList<T>({
  items,
  itemHeight,
  height,
  getKey,
  renderItem,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const overscan = 3
  const totalHeight = items.length * itemHeight
  const safeScrollTop = Math.min(
    scrollTop,
    Math.max(0, totalHeight - height),
  )
  const startIndex = Math.max(
    0,
    Math.floor(safeScrollTop / itemHeight) - overscan,
  )
  const endIndex = Math.min(
    items.length,
    Math.ceil((safeScrollTop + height) / itemHeight) + overscan,
  )

  return (
    <div
      role="list"
      aria-label="Các sự kiện hạ gục"
      tabIndex={0}
      style={{ height, overflowY: 'auto' }}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {items.slice(startIndex, endIndex).map((item, offset) => {
          const index = startIndex + offset
          return (
            <div
              key={getKey(item)}
              role="listitem"
              aria-posinset={index + 1}
              aria-setsize={items.length}
              style={{
                position: 'absolute',
                top: index * itemHeight,
                height: itemHeight,
                left: 0,
                right: 0,
              }}
            >
              {renderItem(item)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
