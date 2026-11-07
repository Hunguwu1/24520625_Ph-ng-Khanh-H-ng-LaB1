import { useState } from 'react'
import DropCard from './components/DropCard'
import { createDemoDrops } from './data/pubgDemo'

export default function App() {
  const [drops] = useState(() => createDemoDrops())

  return (
    <main className="arena">
      <header>
        <p className="badge">PUBG VIETNAM ARENA</p>
        <h1>KRAFTON x PUBG Vietnam</h1>
        <p>Chuẩn bị nhận vé VIP và G-Coin.</p>
      </header>
      <section className="drop-list" aria-label="Airdrop">
        {drops.map((drop) => (
          <DropCard key={drop.id} drop={drop} />
        ))}
      </section>
    </main>
  )
}
