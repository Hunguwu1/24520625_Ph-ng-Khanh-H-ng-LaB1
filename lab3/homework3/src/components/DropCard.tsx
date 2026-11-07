import type { PubgCrateDrop } from '../domain/pubg'
import { usePubgAirdropTimer } from '../hooks/usePubgAirdropTimer'

const money = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
})

function formatTime(remainingMs: number) {
  const totalSeconds = Math.ceil(remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function DropCard({ drop }: { drop: PubgCrateDrop }) {
  const { remainingMs, isLive } = usePubgAirdropTimer(drop.dropEpochMs)
  const phase = drop.remainingStock <= 0
    ? 'LOOTED_OUT'
    : isLive ? 'AIRDROP_LIVE' : 'WARMUP'
  const statusText = {
    WARMUP: 'Chưa mở nhận',
    AIRDROP_LIVE: 'Đã mở nhận',
    LOOTED_OUT: 'Đã hết hàng',
  }[phase]

  return (
    <article className="product-card">
      <h2>{drop.title}</h2>
      <p className="sale-price">{money.format(drop.priceVnd)}</p>
      <p>Còn lại: {drop.remainingStock}</p>
      <div className="countdown">
        <p role="status">{statusText}</p>
        <p className="timer">{formatTime(remainingMs)}</p>
      </div>
    </article>
  )
}
