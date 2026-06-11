// src/components/vehicleKit/VehicleKitScene.tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { VehicleByType } from './VehicleByType'
import { VehicleKitLabel } from './VehicleKitLabel'
import { VEHICLE_KIT_CONFIG } from './vehicleKitConfig'
import type { VehicleKitProtocol } from '../../types/vehicleKit'

const GRID_COLS = 4
const SPACING = 3.5

// 11 protocols + 1 error-state cell
const KIT_ITEMS: Array<{ type: VehicleKitProtocol; errorState?: boolean; label?: string; descriptor?: string }> = [
  { type: 'dns' },
  { type: 'http' },
  { type: 'https' },
  { type: 'quic' },
  { type: 'udp' },
  { type: 'tcp' },
  { type: 'icmp' },
  { type: 'ssh' },
  { type: 'database' },
  { type: 'media' },
  { type: 'unknown' },
  { type: 'https', errorState: true, label: 'ERROR STATE', descriptor: 'failed · diverted · unstable' },
]

function KitCell({
  item,
  col,
  row,
}: {
  item: typeof KIT_ITEMS[number]
  col: number
  row: number
}) {
  const x = (col - (GRID_COLS - 1) / 2) * SPACING
  const z = (row - 1) * SPACING

  const cfg = VEHICLE_KIT_CONFIG[item.type]
  const label = item.label ?? cfg.label
  const descriptor = item.descriptor ?? cfg.descriptor

  return (
    <group position={[x, 0, z]}>
      {/* Presentation rotation wrapper — vehicle local forward = +X */}
      <group rotation={[0, Math.PI / 6, 0]}>
        <VehicleByType
          type={item.type}
          errorState={item.errorState}
          scale={item.type === 'icmp' ? 1.3 : item.type === 'media' ? 0.82 : 1}
        />
      </group>
      <VehicleKitLabel label={label} descriptor={descriptor} positionY={-1.0} />
    </group>
  )
}

export function VehicleKitScene() {
  return (
    <Canvas
      camera={{ position: [0, 12, 16], fov: 52, near: 0.1, far: 120 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#09100f']} />
      <fog attach="fog" args={['#09100f', 40, 80]} />

      {/* Lighting */}
      <ambientLight intensity={0.55} color="#b8d4e8" />
      <directionalLight position={[8, 14, 6]} intensity={1.1} color="#e8f0ff" castShadow={false} />
      <directionalLight position={[-6, 8, -4]} intensity={0.35} color="#6080a0" />
      <pointLight position={[0, 6, 0]} intensity={0.4} color="#ffffff" distance={30} />

      <OrbitControls
        target={[0, 0, 0]}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={8}
        maxDistance={40}
        enablePan={false}
      />

      {KIT_ITEMS.map((item, i) => {
        const col = i % GRID_COLS
        const row = Math.floor(i / GRID_COLS)
        return (
          <KitCell
            key={`${item.type}-${i}`}
            item={item}
            col={col}
            row={row}
          />
        )
      })}
    </Canvas>
  )
}
