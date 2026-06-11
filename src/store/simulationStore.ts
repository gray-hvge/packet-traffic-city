import { create } from 'zustand'
import type {
  CaptureState,
  DataSource,
  HighwayStats,
  HighwayVehicle,
  PacketRecord,
  PacketType,
} from '../types/highway'

const initialStats: HighwayStats = {
  rxRate: 0,
  txRate: 0,
  dropRate: 0,
  activeCount: 0,
}

const initialCaptureState: CaptureState = {
  connected: false,
  tsharkAvailable: false,
  mode: 'idle',
  interfaceName: null,
  pcapName: null,
  replayPaused: false,
  replaySpeed: 1,
  replayTime: 0,
  parserErrors: 0,
  defaultPcapAvailable: false,
  error: null,
}

export const MAX_ACTIVE_PACKETS = 80

interface SimulationState {
  isPlaying: boolean
  currentTime: number
  speed: number
  dataSource: DataSource
  activePackets: HighwayVehicle[]
  selectedId: string | null
  filterType: PacketType | null
  stats: HighwayStats
  capture: CaptureState
  play: () => void
  pause: () => void
  replay: () => void
  setSpeed: (speed: number) => void
  setDataSource: (source: DataSource) => void
  tick: (delta: number) => void
  spawnPacket: (packet: HighwayVehicle) => void
  ingestRealPacket: (packet: PacketRecord) => void
  removePacket: (id: string) => void
  selectPacket: (id: string | null) => void
  setFilter: (type: PacketType | null) => void
  updateStats: (stats: HighwayStats) => void
  updateCapture: (capture: Partial<CaptureState>) => void
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  isPlaying: true,
  currentTime: 0,
  speed: 1,
  dataSource: 'mock',
  activePackets: [],
  selectedId: null,
  filterType: null,
  stats: initialStats,
  capture: initialCaptureState,
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  replay: () =>
    set({
      currentTime: 0,
      isPlaying: true,
      activePackets: [],
      selectedId: null,
      stats: initialStats,
    }),
  setSpeed: (speed) => set({ speed }),
  setDataSource: (dataSource) =>
    set({
      dataSource,
      currentTime: 0,
      activePackets: [],
      selectedId: null,
      stats: initialStats,
      isPlaying: true,
      capture: { ...get().capture, error: null },
    }),
  tick: (delta) =>
    set((state) =>
      state.isPlaying
        ? { currentTime: state.currentTime + delta * state.speed }
        : state,
    ),
  spawnPacket: (packet) =>
    set((state) =>
      state.activePackets.length >= MAX_ACTIVE_PACKETS
        ? state
        : { activePackets: [...state.activePackets, packet] },
    ),
  ingestRealPacket: (packet) =>
    set((state) => {
      const direction =
        packet.direction === 'unknown'
          ? hashString(packet.id) % 2 === 0
            ? 'rx'
            : 'tx'
          : packet.direction
      const size = Math.min(1.45, Math.max(0.62, 0.62 + packet.length / 1800))
      const speedByType: Partial<Record<PacketType, number>> = {
        icmp: 10,
        dns: 8,
        quic: 8.5,
        media: 3.3,
        database: 5,
        https: 6.5,
      }
      const vehicle: HighwayVehicle = {
        id: packet.id,
        type: packet.vehicleType,
        direction,
        status: packet.isError ? 'drop' : 'pass',
        size,
        speed: speedByType[packet.vehicleType] ?? 6,
        dropProgress: 0.45 + (hashString(`${packet.id}-drop`) % 30) / 100,
        dropReason: packet.isError ? packet.expertMessage : undefined,
        spawnedAt: state.currentTime,
        laneIndex: hashString(packet.id) % 5,
        source: packet.source,
        packet,
      }
      const activePackets =
        state.activePackets.length >= MAX_ACTIVE_PACKETS
          ? [
              ...state.activePackets.slice(-(MAX_ACTIVE_PACKETS - 1)),
              vehicle,
            ]
          : [...state.activePackets, vehicle]
      return {
        activePackets,
        stats: { ...state.stats, activeCount: activePackets.length },
      }
    }),
  removePacket: (id) =>
    set((state) => {
      const activePackets = state.activePackets.filter(
        (packet) => packet.id !== id,
      )
      return {
        activePackets,
        selectedId: state.selectedId === id ? null : state.selectedId,
        stats: { ...state.stats, activeCount: activePackets.length },
      }
    }),
  selectPacket: (selectedId) => set({ selectedId }),
  setFilter: (filterType) => set({ filterType }),
  updateStats: (stats) => set({ stats }),
  updateCapture: (capture) =>
    set((state) => ({
      capture: { ...state.capture, ...capture },
    })),
}))

function hashString(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}
