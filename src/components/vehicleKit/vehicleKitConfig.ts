// src/components/vehicleKit/vehicleKitConfig.ts
import type { VehicleKitProtocol } from '../../types/vehicleKit'

export interface ProtocolConfig {
  label: string
  descriptor: string
  primary: string
  secondary: string
  baseScale: number
}

export const VEHICLE_KIT_CONFIG: Record<VehicleKitProtocol, ProtocolConfig> = {
  dns: {
    label: 'DNS',
    descriptor: 'small · fast · bursty',
    primary: '#738e9e',
    secondary: '#d5edff',
    baseScale: 0.85,
  },
  http: {
    label: 'HTTP',
    descriptor: 'plain · open · common',
    primary: '#526f82',
    secondary: '#b6d9e8',
    baseScale: 0.9,
  },
  https: {
    label: 'HTTPS',
    descriptor: 'sealed · steady · common',
    primary: '#315d82',
    secondary: '#6edcff',
    baseScale: 1.0,
  },
  quic: {
    label: 'QUIC',
    descriptor: 'stream · fast · multiplexed',
    primary: '#397487',
    secondary: '#5eeaff',
    baseScale: 0.8,
  },
  udp: {
    label: 'UDP',
    descriptor: 'dart · fast · lossy',
    primary: '#3b746f',
    secondary: '#57e4d2',
    baseScale: 0.75,
  },
  tcp: {
    label: 'TCP',
    descriptor: 'control · reliable · signal',
    primary: '#52687b',
    secondary: '#adcbe0',
    baseScale: 0.88,
  },
  icmp: {
    label: 'ICMP',
    descriptor: 'probe · fast · sparse',
    primary: '#718997',
    secondary: '#d9f5ff',
    baseScale: 0.65,
  },
  ssh: {
    label: 'SSH',
    descriptor: 'secure · rare · admin',
    primary: '#1b2d3a',
    secondary: '#5dd9ff',
    baseScale: 0.9,
  },
  database: {
    label: 'DATABASE',
    descriptor: 'internal · regular · cargo',
    primary: '#356c70',
    secondary: '#63e8d1',
    baseScale: 1.05,
  },
  media: {
    label: 'MEDIA',
    descriptor: 'heavy · slow · large',
    primary: '#584567',
    secondary: '#e06bff',
    baseScale: 1.2,
  },
  unknown: {
    label: 'UNKNOWN',
    descriptor: 'unclassified · drifting',
    primary: '#44535f',
    secondary: '#8599a8',
    baseScale: 0.88,
  },
}

export const TCP_VARIANT_COLORS: Record<'syn' | 'ack' | 'rst' | 'fin', string> = {
  syn: '#4A9EFF',
  ack: '#4AFF8A',
  rst: '#FF4A4A',
  fin: '#FF8A4A',
}
