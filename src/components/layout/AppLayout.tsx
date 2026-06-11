import { useEffect } from 'react'
import { connectCaptureClient } from '../../services/captureClient'
import { useSimulationStore } from '../../store/simulationStore'
import { TrafficScene } from '../scene/TrafficScene'
import { BottomControls } from './BottomControls'
import { DataSourceBar } from './DataSourceBar'
import { LegendPanel } from './LegendPanel'
import { RightPanel } from './RightPanel'

export function AppLayout() {
  const isPlaying = useSimulationStore((state) => state.isPlaying)
  const stats = useSimulationStore((state) => state.stats)

  useEffect(() => {
    connectCaptureClient()
  }, [])

  return (
    <main className="highway-shell">
      <div className="scene-bg-gradient" />
      <div className="scene-guardian-bg" />

      <section className="highway-canvas scene-highway-slot">
        <TrafficScene />
      </section>

      <header className="highway-header">
        <p>Live packet mobility simulation</p>
        <h1>Packet Highway</h1>
        <div className="live-readout">
          <span className={isPlaying ? 'live-dot' : 'paused-dot'} />
          {isPlaying ? 'FLOWING' : 'PAUSED'}
          <strong>{stats.activeCount} ACTIVE</strong>
          <span>RX {stats.rxRate}/s</span>
          <span>TX {stats.txRate}/s</span>
          <span className="drop-readout">DROP {stats.dropRate}/s</span>
        </div>
      </header>

      <DataSourceBar />
      <LegendPanel />
      <RightPanel />
      <BottomControls />
    </main>
  )
}
