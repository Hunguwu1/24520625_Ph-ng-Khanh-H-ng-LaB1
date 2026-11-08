import { useRef, useState } from 'react'
import type { PubgCrateDrop } from '../domain/pubg'
import { claimDrop, ClaimError, type ClaimDemoMode } from '../api/pubgClaim'
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
  const [stock, setStock] = useState(drop.remainingStock)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<ClaimDemoMode>('success')
  const inFlight = useRef(false)

  const phase = stock <= 0
    ? 'LOOTED_OUT'
    : isLive ? 'AIRDROP_LIVE' : 'WARMUP'
  const statusText = {
    WARMUP: 'Chưa mở nhận',
    AIRDROP_LIVE: 'Đã mở nhận',
    LOOTED_OUT: 'Đã hết hàng',
  }[phase]

  async function handleClaim() {
    if (inFlight.current || stock <= 0 || Date.now() < drop.dropEpochMs) {
      return
    }

    // Khóa tức thời, kể cả khi React chưa render lại nút disabled.
    inFlight.current = true
    setPending(true)
    setMessage('')
    setStock((current) => current - 1)

    try {
      const result = await claimDrop(drop.id, mode)
      setMessage(`Nhận thành công! Mã: ${result.claimId}`)
    } catch (error) {
      // Chỉ hoàn tác một lượt nhận bị lỗi của thẻ này.
      setStock((current) => current + 1)
      if (error instanceof ClaimError && error.status === 409) {
        setMessage('Server báo hết hàng (409). Đã hoàn tác lượt nhận.')
      } else {
        setMessage('Lỗi kết nối. Đã hoàn tác, bạn có thể thử lại.')
      }
    } finally {
      inFlight.current = false
      setPending(false)
    }
  }

  return (
    <article className="product-card">
      <h2>{drop.title}</h2>
      <p className="sale-price">{money.format(drop.priceVnd)}</p>
      <p>Còn lại: {stock}</p>
      <div className="countdown">
        <p role="status">{statusText}</p>
        <p className="timer">{formatTime(remainingMs)}</p>
      </div>
      <label>
        Kịch bản kiểm tra:
        <select
          value={mode}
          disabled={pending}
          onChange={(event) => setMode(event.target.value as ClaimDemoMode)}
        >
          <option value="success">Thành công</option>
          <option value="conflict">Lỗi 409 — hết hàng</option>
          <option value="network-error">Lỗi kết nối</option>
        </select>
      </label>
      <button
        type="button"
        disabled={!isLive || stock <= 0 || pending}
        onClick={handleClaim}
      >
        {pending ? 'Đang nhận...' : 'Nhận vật phẩm'}
      </button>
      <p className="purchase-message" role="status">{message}</p>
    </article>
  )
}
