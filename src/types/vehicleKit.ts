// src/types/vehicleKit.ts
export type VehicleKitProtocol =
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

export interface VehicleByTypeProps {
  type: VehicleKitProtocol
  errorState?: boolean
  tcpVariant?: 'syn' | 'ack' | 'rst' | 'fin'
  scale?: number
}
