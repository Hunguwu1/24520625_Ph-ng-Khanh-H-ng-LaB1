import { useState } from 'react'
import { demoStandings } from '../data/pubgDemo'

type SortKey = 'wwcdCount' | 'placementPts' | 'killPts'

export default function Leaderboard() {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('wwcdCount')
  const keyword = search.trim().toLowerCase()

  const standings = demoStandings
    .filter((squad) => squad.squadName.toLowerCase().includes(keyword))
    .sort((a, b) =>
      b[sortKey] - a[sortKey] ||
      a.squadName.localeCompare(b.squadName, 'vi'),
    )

  return (
    <section className="leaderboard" aria-labelledby="leaderboard-title">
      <h2 id="leaderboard-title">Bảng xếp hạng PUBG Việt Nam</h2>
      <p className="note">Điểm số mô phỏng cho bài tập.</p>

      <div className="leaderboard-controls">
        <label>
          Tìm đội
          <input
            type="search"
            placeholder="Nhập tên đội..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label>
          Sắp xếp giảm dần theo
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
          >
            <option value="wwcdCount">WWCD</option>
            <option value="placementPts">Placement Points</option>
            <option value="killPts">Kill Points</option>
          </select>
        </label>
      </div>

      <div className="table-scroll">
        <table>
          <caption>Các đội phù hợp, sắp xếp theo tiêu chí đã chọn</caption>
          <thead>
            <tr>
              <th scope="col">STT</th>
              <th scope="col">Đội tuyển</th>
              <th scope="col">WWCD</th>
              <th scope="col">Placement</th>
              <th scope="col">Kill</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((squad, index) => (
              <tr key={squad.squadId}>
                <td>{index + 1}</td>
                <th scope="row">{squad.squadName}</th>
                <td>{squad.wwcdCount}</td>
                <td>{squad.placementPts}</td>
                <td>{squad.killPts}</td>
              </tr>
            ))}
            {standings.length === 0 && (
              <tr>
                <td colSpan={5}>Không tìm thấy đội phù hợp.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
