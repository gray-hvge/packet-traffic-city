import { useSimulationStore } from '../../store/simulationStore'
import type { PacketType } from '../../types/highway'
import { VEHICLE_KIT_CONFIG } from '../vehicleKit/vehicleKitConfig'

const protocolOrder: PacketType[] = [
  'https',
  'http',
  'dns',
  'quic',
  'udp',
  'tcp',
  'icmp',
  'ssh',
  'database',
  'media',
  'unknown',
]

export function LegendPanel() {
  const filterType = useSimulationStore((state) => state.filterType)
  const setFilter = useSimulationStore((state) => state.setFilter)

  return (
    <aside className="highway-legend" aria-label="Protocol filter">
      {protocolOrder.map((type) => {
        const config = VEHICLE_KIT_CONFIG[type]
        const isActive = filterType === type
        const isDimmed = filterType !== null && !isActive

        return (
          <button
            key={type}
            type="button"
            className={isActive ? 'active' : ''}
            style={{ opacity: isDimmed ? 0.3 : 1 }}
            onClick={() => {
              const currentFilter =
                useSimulationStore.getState().filterType
              setFilter(currentFilter === type ? null : type)
            }}
          >
            <span
              className="legend-dot"
              style={{ background: config.primary }}
            />
            {config.label}
          </button>
        )
      })}
    </aside>
  )
}
