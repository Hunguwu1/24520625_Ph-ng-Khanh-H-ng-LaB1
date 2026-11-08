import { useState } from 'react'
import { createDemoKillFeed } from '../data/killFeedDemo'
import { demoStandings } from '../data/pubgDemo'

const timeFormat = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

export default function KillFeed() {
  const [events] = useState(() => createDemoKillFeed())
  const [squadId, setSquadId] = useState('')
  const filteredEvents = events.filter((event) =>
    squadId === '' ||
    event.killerSquadId === squadId ||
    event.victimSquadId === squadId,
  )

  return (
    <section className="kill-feed" aria-labelledby="kill-feed-title">
      <h2 id="kill-feed-title">Kill-feed</h2>
      <p className="note">Sự kiện mô phỏng cho bài tập.</p>

      <label>
        Lọc theo đội
        <select
          value={squadId}
          onChange={(event) => setSquadId(event.target.value)}
        >
          <option value="">Tất cả đội</option>
          {demoStandings.map((squad) => (
            <option key={squad.squadId} value={squad.squadId}>
              {squad.squadName}
            </option>
          ))}
        </select>
      </label>

      <p role="status">Hiển thị {filteredEvents.length} sự kiện</p>

      <ul className="kill-feed-list">
        {filteredEvents.map((event) => (
          <li key={event.id}>
            <time dateTime={new Date(event.occurredAt).toISOString()}>
              {timeFormat.format(event.occurredAt)}
            </time>
            <span>
              <strong>{event.killerName}</strong>
              {' hạ '}
              <strong>{event.victimName}</strong>
            </span>
          </li>
        ))}
      </ul>

      {filteredEvents.length === 0 && <p>Không có sự kiện phù hợp.</p>}
    </section>
  )
}
