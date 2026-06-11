import { useSimulationStore } from '../../store/simulationStore'

export function RightPanel() {
  const selectedId = useSimulationStore((state) => state.selectedId)
  const activePackets = useSimulationStore((state) => state.activePackets)
  const selectPacket = useSimulationStore((state) => state.selectPacket)
  const packet = activePackets.find((item) => item.id === selectedId)

  if (!packet) return null

  return (
    <aside className="vehicle-card">
      <button
        className="card-close"
        type="button"
        onClick={() => selectPacket(null)}
        aria-label="Close packet details"
      >
        ×
      </button>
      <p>Packet detail</p>
      <h2>{packet.type}</h2>
      <dl>
        <Detail label="ID" value={packet.id} />
        <Detail label="Source" value={packet.source} />
        <Detail label="Direction" value={packet.direction} />
        <Detail label="Lane" value={`${packet.laneIndex + 1} / 5`} />
        <Detail label="Size" value={`${packet.size.toFixed(2)}×`} />
        <Detail label="Speed" value={`${packet.speed.toFixed(1)} u/s`} />
        <Detail
          label="State"
          value={packet.status}
          incident={packet.status === 'drop'}
        />
        <Detail
          label="Drop reason"
          value={packet.dropReason ?? '—'}
          incident={Boolean(packet.dropReason)}
        />
        <Detail label="Spawned" value={`${packet.spawnedAt.toFixed(1)}s`} />
        {packet.packet && (
          <>
            <Detail
              label="Source endpoint"
              value={formatEndpoint(
                packet.packet.srcIp,
                packet.packet.srcPort,
              )}
            />
            <Detail
              label="Destination endpoint"
              value={formatEndpoint(
                packet.packet.dstIp,
                packet.packet.dstPort,
              )}
            />
            <Detail
              label="Protocol"
              value={
                packet.packet.applicationProtocol ??
                packet.packet.transportProtocol ??
                'unknown'
              }
            />
            <Detail
              label="Packet length"
              value={`${packet.packet.length} bytes`}
            />
            <Detail
              label="Captured"
              value={new Date(
                packet.packet.capturedAt * 1000,
              ).toLocaleTimeString()}
            />
            <Detail
              label="TCP flags"
              value={packet.packet.tcpFlags ?? '—'}
            />
          </>
        )}
      </dl>
    </aside>
  )
}

function formatEndpoint(ip?: string, port?: number) {
  if (!ip) return '—'
  return port ? `${ip}:${port}` : ip
}

function Detail({
  label,
  value,
  incident = false,
}: {
  label: string
  value: string
  incident?: boolean
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={incident ? 'incident' : ''}>{value}</dd>
    </div>
  )
}
