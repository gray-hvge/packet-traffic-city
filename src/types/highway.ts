export type PacketType =
  | 'dns'
  | 'http'
  | 'https'
  | 'quic'
  | 'udp'
  | 'tcp'
  | 'icmp'
  | 'ssh'
  | 'database'
  | 'media'
  | 'unknown'

export type PacketStatus = 'pass' | 'drop'
export type PacketDirection = 'rx' | 'tx'
export type DataSource = 'mock' | 'live' | 'pcap'

export interface PacketRecord {
  id: string
  source: Exclude<DataSource, 'mock'>
  capturedAt: number
  relativeTime: number
  interfaceName?: string
  srcIp?: string
  dstIp?: string
  srcPort?: number
  dstPort?: number
  ipVersion?: 4 | 6
  transportProtocol?: string
  applicationProtocol?: string
  tcpFlags?: string
  length: number
  direction: PacketDirection | 'unknown'
  vehicleType: PacketType
  expertMessage?: string
  isError: boolean
  rawSummary: string
}

export interface CaptureState {
  connected: boolean
  tsharkAvailable: boolean
  mode: 'idle' | 'live' | 'pcap'
  interfaceName: string | null
  pcapName: string | null
  replayPaused: boolean
  replaySpeed: number
  replayTime: number
  parserErrors: number
  defaultPcapAvailable: boolean
  error: string | null
}

export interface TrafficStream {
  type: PacketType
  direction: PacketDirection | 'both'
  spawnInterval: number
  dropRate: number
  speedMin: number
  speedMax: number
  sizeMin: number
  sizeMax: number
  dropReasons: string[]
}

export interface HighwayVehicle {
  id: string
  type: PacketType
  direction: PacketDirection
  status: PacketStatus
  size: number
  speed: number
  dropProgress: number
  dropReason?: string
  spawnedAt: number
  laneIndex: number
  source: DataSource
  packet?: PacketRecord
}

export interface HighwayStats {
  rxRate: number
  txRate: number
  dropRate: number
  activeCount: number
}
