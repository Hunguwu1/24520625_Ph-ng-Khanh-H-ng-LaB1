import { useEffect, useState } from 'react'

export function usePubgAirdropTimer(
  targetEpochMs: number,
  serverOffsetMs = 0,
) {
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, targetEpochMs - (Date.now() + serverOffsetMs)),
  )

  useEffect(() => {
    function syncClock() {
      setRemainingMs(
        Math.max(0, targetEpochMs - (Date.now() + serverOffsetMs)),
      )
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') syncClock()
    }

    syncClock()
    const timerId = window.setInterval(syncClock, 200)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.clearInterval(timerId)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [targetEpochMs, serverOffsetMs])

  return { remainingMs, isLive: remainingMs === 0 }
}
