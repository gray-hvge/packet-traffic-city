// src/components/vehicleKit/VehicleByType.tsx
import { VEHICLE_KIT_CONFIG, TCP_VARIANT_COLORS } from './vehicleKitConfig'
import { ErrorOverlay } from './ErrorOverlay'
import type { VehicleByTypeProps } from '../../types/vehicleKit'

// ─── Shared helpers ────────────────────────────────────────────────────────

function Wheel({ pos, radius = 0.13, width = 0.1 }: { pos: [number, number, number]; radius?: number; width?: number }) {
  return (
    <mesh position={pos} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[radius, radius, width, 10]} />
      <meshStandardMaterial color="#0d1014" roughness={0.9} metalness={0.1} />
    </mesh>
  )
}

function HoverPad({ pos, radius = 0.13 }: { pos: [number, number, number]; radius?: number }) {
  return (
    <mesh position={pos} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[radius, radius * 1.2, 0.06, 10]} />
      <meshStandardMaterial color="#1A3A4A" roughness={0.4} metalness={0.3} emissive="#003344" emissiveIntensity={0.4} />
    </mesh>
  )
}

function Chassis({ l, w, h, color, metalness = 0.08, roughness = 0.65 }: {
  l: number; w: number; h: number; color: string; metalness?: number; roughness?: number
}) {
  return (
    <mesh position={[0, h / 2, 0]}>
      <boxGeometry args={[l, h, w]} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  )
}

// ─── DNS Van ───────────────────────────────────────────────────────────────
function renderDnsVan(cfg: typeof VEHICLE_KIT_CONFIG['dns']) {
  return (
    <>
      <Chassis l={0.82} w={0.5} h={0.18} color={cfg.primary} />
      <mesh position={[0.04, 0.42, 0]}>
        <boxGeometry args={[0.52, 0.38, 0.48]} />
        <meshStandardMaterial color={cfg.primary} roughness={0.65} metalness={0.08} />
      </mesh>
      <mesh position={[-0.3, 0.35, 0]}>
        <boxGeometry args={[0.22, 0.3, 0.46]} />
        <meshStandardMaterial color={cfg.secondary} roughness={0.55} metalness={0.06} />
      </mesh>
      <mesh position={[0.12, 0.65, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.3, 6]} />
        <meshStandardMaterial color="#888A88" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0.12, 0.82, 0]}>
        <sphereGeometry args={[0.045, 6, 6]} />
        <meshBasicMaterial color={cfg.secondary} />
      </mesh>
      <Wheel pos={[-0.26, 0.13, 0.3]} />
      <Wheel pos={[-0.26, 0.13, -0.3]} />
      <Wheel pos={[0.26, 0.13, 0.3]} />
      <Wheel pos={[0.26, 0.13, -0.3]} />
    </>
  )
}

// ─── HTTP Car ──────────────────────────────────────────────────────────────
function renderHttpCar(cfg: typeof VEHICLE_KIT_CONFIG['http']) {
  return (
    <>
      <Chassis l={0.96} w={0.52} h={0.16} color={cfg.primary} />
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.88, 0.2, 0.5]} />
        <meshStandardMaterial color={cfg.primary} roughness={0.68} metalness={0.07} />
      </mesh>
      <mesh position={[0.1, 0.44, 0]}>
        <boxGeometry args={[0.46, 0.2, 0.46]} />
        <meshStandardMaterial color={cfg.secondary} roughness={0.55} metalness={0.05} />
      </mesh>
      <Wheel pos={[-0.32, 0.13, 0.3]} />
      <Wheel pos={[-0.32, 0.13, -0.3]} />
      <Wheel pos={[0.32, 0.13, 0.3]} />
      <Wheel pos={[0.32, 0.13, -0.3]} />
    </>
  )
}

// ─── HTTPS Truck ───────────────────────────────────────────────────────────
function renderHttpsTruck(cfg: typeof VEHICLE_KIT_CONFIG['https']) {
  return (
    <>
      <Chassis l={1.4} w={0.56} h={0.18} color={cfg.primary} />
      <mesh position={[0.12, 0.52, 0]}>
        <boxGeometry args={[0.98, 0.58, 0.54]} />
        <meshStandardMaterial color={cfg.primary} roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0.12, 0.84, 0]}>
        <boxGeometry args={[0.98, 0.06, 0.56]} />
        <meshStandardMaterial color={cfg.secondary} roughness={0.4} metalness={0.15} emissive={cfg.secondary} emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[-0.5, 0.4, 0]}>
        <boxGeometry args={[0.28, 0.42, 0.52]} />
        <meshStandardMaterial color="#1A3860" roughness={0.55} metalness={0.08} />
      </mesh>
      <Wheel pos={[-0.48, 0.13, 0.32]} />
      <Wheel pos={[-0.48, 0.13, -0.32]} />
      <Wheel pos={[0.1, 0.13, 0.32]} />
      <Wheel pos={[0.1, 0.13, -0.32]} />
      <Wheel pos={[0.46, 0.13, 0.32]} />
      <Wheel pos={[0.46, 0.13, -0.32]} />
    </>
  )
}

// ─── QUIC Pod ──────────────────────────────────────────────────────────────
function renderQuicPod(cfg: typeof VEHICLE_KIT_CONFIG['quic']) {
  return (
    <>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.72, 12]} />
        <meshStandardMaterial color={cfg.primary} roughness={0.4} metalness={0.15} />
      </mesh>
      <mesh position={[0.36, 0.22, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <sphereGeometry args={[0.22, 12, 12, 0, Math.PI]} />
        <meshStandardMaterial color={cfg.primary} roughness={0.4} metalness={0.15} />
      </mesh>
      <mesh position={[-0.36, 0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
        <sphereGeometry args={[0.22, 12, 12, 0, Math.PI]} />
        <meshStandardMaterial color={cfg.primary} roughness={0.4} metalness={0.15} />
      </mesh>
      <mesh position={[0.52, 0.18, 0]}>
        <boxGeometry args={[0.14, 0.12, 0.28]} />
        <meshStandardMaterial color={cfg.secondary} roughness={0.35} metalness={0.2} emissive={cfg.secondary} emissiveIntensity={0.2} />
      </mesh>
      <HoverPad pos={[-0.28, 0.04, 0.24]} radius={0.1} />
      <HoverPad pos={[-0.28, 0.04, -0.24]} radius={0.1} />
      <HoverPad pos={[0.2, 0.04, 0.24]} radius={0.1} />
      <HoverPad pos={[0.2, 0.04, -0.24]} radius={0.1} />
    </>
  )
}

// ─── UDP Dart ──────────────────────────────────────────────────────────────
function renderUdpDart(cfg: typeof VEHICLE_KIT_CONFIG['udp']) {
  return (
    <>
      <Chassis l={1.0} w={0.32} h={0.14} color={cfg.primary} />
      <mesh position={[0, 0.26, 0]}>
        <boxGeometry args={[0.78, 0.16, 0.28]} />
        <meshStandardMaterial color={cfg.primary} roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0.54, 0.2, 0]}>
        <boxGeometry args={[0.22, 0.14, 0.18]} />
        <meshStandardMaterial color={cfg.secondary} roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0.7, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.07, 0.2, 6]} />
        <meshStandardMaterial color={cfg.secondary} roughness={0.45} metalness={0.15} />
      </mesh>
      <HoverPad pos={[-0.32, 0.04, 0.2]} radius={0.08} />
      <HoverPad pos={[-0.32, 0.04, -0.2]} radius={0.08} />
      <HoverPad pos={[0.22, 0.04, 0.2]} radius={0.08} />
      <HoverPad pos={[0.22, 0.04, -0.2]} radius={0.08} />
    </>
  )
}

// ─── TCP Sedan ─────────────────────────────────────────────────────────────
function renderTcpSedan(cfg: typeof VEHICLE_KIT_CONFIG['tcp'], variant: 'syn' | 'ack' | 'rst' | 'fin') {
  const accentColor = TCP_VARIANT_COLORS[variant]
  return (
    <>
      <Chassis l={0.92} w={0.5} h={0.16} color={cfg.primary} />
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.84, 0.18, 0.48]} />
        <meshStandardMaterial color={cfg.primary} roughness={0.65} metalness={0.07} />
      </mesh>
      <mesh position={[0.08, 0.44, 0]}>
        <boxGeometry args={[0.44, 0.2, 0.44]} />
        <meshStandardMaterial color={cfg.secondary} roughness={0.5} metalness={0.06} />
      </mesh>
      <mesh position={[0.08, 0.58, 0]}>
        <boxGeometry args={[0.38, 0.06, 0.22]} />
        <meshBasicMaterial color={accentColor} />
      </mesh>
      <mesh position={[0.08, 0.55, 0]}>
        <boxGeometry args={[0.42, 0.04, 0.26]} />
        <meshStandardMaterial color="#222830" roughness={0.7} />
      </mesh>
      <Wheel pos={[-0.3, 0.13, 0.3]} />
      <Wheel pos={[-0.3, 0.13, -0.3]} />
      <Wheel pos={[0.3, 0.13, 0.3]} />
      <Wheel pos={[0.3, 0.13, -0.3]} />
    </>
  )
}

// ─── ICMP Probe ────────────────────────────────────────────────────────────
function renderIcmpProbe(cfg: typeof VEHICLE_KIT_CONFIG['icmp']) {
  return (
    <>
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.52, 10]} />
        <meshStandardMaterial color={cfg.primary} roughness={0.55} metalness={0.08} />
      </mesh>
      <mesh position={[0.26, 0.24, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <sphereGeometry args={[0.16, 10, 10, 0, Math.PI]} />
        <meshStandardMaterial color={cfg.primary} roughness={0.55} metalness={0.08} />
      </mesh>
      <mesh position={[-0.26, 0.24, 0]} rotation={[0, 0, Math.PI / 2]}>
        <sphereGeometry args={[0.16, 10, 10, 0, Math.PI]} />
        <meshStandardMaterial color={cfg.secondary} roughness={0.5} metalness={0.06} />
      </mesh>
      <mesh position={[0.34, 0.26, 0]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial color={cfg.secondary} />
      </mesh>
      <Wheel pos={[-0.2, 0.06, 0]} radius={0.1} width={0.08} />
      <Wheel pos={[0.2, 0.06, 0]} radius={0.1} width={0.08} />
    </>
  )
}

// ─── SSH Van ───────────────────────────────────────────────────────────────
function renderSshVan(cfg: typeof VEHICLE_KIT_CONFIG['ssh']) {
  return (
    <>
      <Chassis l={0.88} w={0.5} h={0.18} color="#172733" />
      <mesh position={[0.04, 0.44, 0]}>
        <boxGeometry args={[0.56, 0.42, 0.48]} />
        <meshStandardMaterial color={cfg.primary} roughness={0.7} metalness={0.12} />
      </mesh>
      <mesh position={[-0.3, 0.36, 0]}>
        <boxGeometry args={[0.22, 0.3, 0.46]} />
        <meshStandardMaterial color="#13202a" roughness={0.52} metalness={0.2} />
      </mesh>
      <mesh position={[0.22, 0.44, 0.26]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial color={cfg.secondary} />
      </mesh>
      <mesh position={[0.22, 0.44, 0.28]}>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 8]} />
        <meshStandardMaterial color="#2A3840" roughness={0.6} />
      </mesh>
      <Wheel pos={[-0.28, 0.13, 0.3]} />
      <Wheel pos={[-0.28, 0.13, -0.3]} />
      <Wheel pos={[0.28, 0.13, 0.3]} />
      <Wheel pos={[0.28, 0.13, -0.3]} />
    </>
  )
}

// ─── Database Truck ────────────────────────────────────────────────────────
function renderDatabaseTruck(cfg: typeof VEHICLE_KIT_CONFIG['database']) {
  return (
    <>
      <Chassis l={1.3} w={0.64} h={0.18} color={cfg.primary} />
      <mesh position={[0.1, 0.52, 0]}>
        <boxGeometry args={[0.88, 0.52, 0.62]} />
        <meshStandardMaterial color={cfg.primary} roughness={0.65} metalness={0.08} />
      </mesh>
      <mesh position={[0.18, 0.82, 0.14]}>
        <boxGeometry args={[0.22, 0.08, 0.18]} />
        <meshStandardMaterial color={cfg.secondary} roughness={0.5} metalness={0.1} emissive={cfg.secondary} emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0.18, 0.82, -0.14]}>
        <boxGeometry args={[0.22, 0.08, 0.18]} />
        <meshStandardMaterial color={cfg.secondary} roughness={0.5} metalness={0.1} emissive={cfg.secondary} emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[-0.46, 0.4, 0]}>
        <boxGeometry args={[0.28, 0.4, 0.6]} />
        <meshStandardMaterial color="#184830" roughness={0.6} metalness={0.08} />
      </mesh>
      <Wheel pos={[-0.44, 0.13, 0.36]} />
      <Wheel pos={[-0.44, 0.13, -0.36]} />
      <Wheel pos={[0.08, 0.13, 0.36]} />
      <Wheel pos={[0.08, 0.13, -0.36]} />
      <Wheel pos={[0.44, 0.13, 0.36]} />
      <Wheel pos={[0.44, 0.13, -0.36]} />
    </>
  )
}

// ─── Media Carrier ─────────────────────────────────────────────────────────
function renderMediaCarrier(cfg: typeof VEHICLE_KIT_CONFIG['media']) {
  return (
    <>
      <Chassis l={1.85} w={0.6} h={0.2} color="#30243c" />
      <mesh position={[-0.7, 0.45, 0]}>
        <boxGeometry args={[0.3, 0.46, 0.56]} />
        <meshStandardMaterial color="#241b30" roughness={0.48} metalness={0.2} />
      </mesh>
      <mesh position={[0.08, 0.55, 0]}>
        <boxGeometry args={[0.52, 0.56, 0.58]} />
        <meshStandardMaterial color={cfg.primary} roughness={0.65} metalness={0.08} />
      </mesh>
      <mesh position={[0.66, 0.55, 0]}>
        <boxGeometry args={[0.5, 0.56, 0.58]} />
        <meshStandardMaterial color={cfg.primary} roughness={0.65} metalness={0.08} />
      </mesh>
      <mesh position={[0.66, 0.85, 0]}>
        <boxGeometry args={[0.5, 0.04, 0.58]} />
        <meshStandardMaterial color={cfg.secondary} roughness={0.4} metalness={0.1} emissive={cfg.secondary} emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[0.1, 0.06, 0]}>
        <boxGeometry args={[1.6, 0.08, 0.62]} />
        <meshStandardMaterial color="#17131f" roughness={0.7} metalness={0.12} />
      </mesh>
      <Wheel pos={[-0.56, 0.13, 0.34]} />
      <Wheel pos={[-0.56, 0.13, -0.34]} />
      <Wheel pos={[-0.14, 0.13, 0.34]} />
      <Wheel pos={[-0.14, 0.13, -0.34]} />
      <Wheel pos={[0.38, 0.13, 0.34]} />
      <Wheel pos={[0.38, 0.13, -0.34]} />
      <Wheel pos={[0.72, 0.13, 0.34]} />
      <Wheel pos={[0.72, 0.13, -0.34]} />
    </>
  )
}

// ─── Unknown Car ───────────────────────────────────────────────────────────
function renderUnknownCar(cfg: typeof VEHICLE_KIT_CONFIG['unknown']) {
  return (
    <>
      <Chassis l={0.9} w={0.5} h={0.16} color={cfg.primary} />
      <mesh position={[0.04, 0.28, 0.03]}>
        <boxGeometry args={[0.82, 0.18, 0.48]} />
        <meshStandardMaterial color={cfg.primary} roughness={0.75} metalness={0.05} />
      </mesh>
      <mesh position={[0.06, 0.44, -0.02]} rotation={[0, 0.04, 0]}>
        <boxGeometry args={[0.42, 0.19, 0.44]} />
        <meshStandardMaterial color={cfg.secondary} roughness={0.7} metalness={0.04} />
      </mesh>
      <Wheel pos={[-0.3, 0.13, 0.3]} />
      <Wheel pos={[-0.3, 0.13, -0.3]} />
      <Wheel pos={[0.3, 0.13, 0.3]} />
      <Wheel pos={[0.3, 0.13, -0.3]} />
    </>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────
export function VehicleByType({ type, errorState = false, tcpVariant = 'syn', scale = 1 }: VehicleByTypeProps) {
  const cfg = VEHICLE_KIT_CONFIG[type]

  function renderVehicle() {
    switch (type) {
      case 'dns':      return renderDnsVan(VEHICLE_KIT_CONFIG.dns)
      case 'http':     return renderHttpCar(VEHICLE_KIT_CONFIG.http)
      case 'https':    return renderHttpsTruck(VEHICLE_KIT_CONFIG.https)
      case 'quic':     return renderQuicPod(VEHICLE_KIT_CONFIG.quic)
      case 'udp':      return renderUdpDart(VEHICLE_KIT_CONFIG.udp)
      case 'tcp':      return renderTcpSedan(VEHICLE_KIT_CONFIG.tcp, tcpVariant)
      case 'icmp':     return renderIcmpProbe(VEHICLE_KIT_CONFIG.icmp)
      case 'ssh':      return renderSshVan(VEHICLE_KIT_CONFIG.ssh)
      case 'database': return renderDatabaseTruck(VEHICLE_KIT_CONFIG.database)
      case 'media':    return renderMediaCarrier(VEHICLE_KIT_CONFIG.media)
      case 'unknown':  return renderUnknownCar(VEHICLE_KIT_CONFIG.unknown)
      default:         return null
    }
  }

  const displayScale = scale * cfg.baseScale

  if (errorState) {
    return (
      <group scale={displayScale} rotation={[0, 0, 0.12]}>
        <ProtocolAura color="#ff365f" />
        {renderVehicle()}
        <ErrorOverlay />
      </group>
    )
  }

  return (
    <group scale={displayScale}>
      <ProtocolAura color={cfg.secondary} />
      {renderVehicle()}
    </group>
  )
}

function ProtocolAura({ color }: { color: string }) {
  return (
    <mesh position={[0, 0.025, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.34, 0.58, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.2}
        depthWrite={false}
      />
    </mesh>
  )
}
