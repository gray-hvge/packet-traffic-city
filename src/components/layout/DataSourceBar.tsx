import { useRef } from 'react'
import {
  selectMockSource,
  startDefaultPcap,
  startLiveCapture,
  uploadPcap,
} from '../../services/captureClient'
import { useSimulationStore } from '../../store/simulationStore'

export function DataSourceBar() {
  const inputRef = useRef<HTMLInputElement>(null)
  const dataSource = useSimulationStore((state) => state.dataSource)
  const capture = useSimulationStore((state) => state.capture)

  return (
    <section className="data-source-bar" aria-label="Traffic data source">
      <span className="source-label">Source</span>
      <button
        type="button"
        className={dataSource === 'mock' ? 'active' : ''}
        onClick={() => void selectMockSource().catch(() => undefined)}
      >
        Mock
      </button>
      <button
        type="button"
        className={dataSource === 'live' ? 'active' : ''}
        onClick={() => void startLiveCapture().catch(() => undefined)}
      >
        Live · Wi-Fi
      </button>
      <button
        type="button"
        className={dataSource === 'pcap' ? 'active' : ''}
        onClick={() => void startDefaultPcap().catch(() => undefined)}
      >
        PCAP
      </button>
      <button
        type="button"
        className="file-button"
        onClick={() => inputRef.current?.click()}
      >
        Choose file
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pcap,.pcapng,.cap"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void uploadPcap(file).catch(() => undefined)
          event.target.value = ''
        }}
      />
      <span
        className={`source-status ${
          capture.error ? 'error' : capture.connected ? 'connected' : ''
        }`}
      >
        {getStatusText(dataSource, capture)}
      </span>
    </section>
  )
}

function getStatusText(
  dataSource: 'mock' | 'live' | 'pcap',
  capture: ReturnType<typeof useSimulationStore.getState>['capture'],
) {
  if (capture.error) return capture.error
  if (dataSource === 'mock') return 'Synthetic traffic'
  if (!capture.connected) return 'Capture service offline'
  if (!capture.tsharkAvailable) return 'TShark not installed'
  if (dataSource === 'live') return capture.interfaceName ?? 'Starting Wi-Fi'
  return capture.pcapName
    ? `${capture.pcapName} · ${capture.replayTime.toFixed(1)}s`
    : 'Loading capture'
}
