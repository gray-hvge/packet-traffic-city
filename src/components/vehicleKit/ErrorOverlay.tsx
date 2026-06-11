// src/components/vehicleKit/ErrorOverlay.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, MeshBasicMaterial } from 'three'

interface ErrorOverlayProps {
  vehicleLength?: number
  vehicleWidth?: number
  vehicleHeight?: number
}

export function ErrorOverlay({
  vehicleLength = 1.2,
  vehicleWidth = 0.6,
  vehicleHeight = 0.5,
}: ErrorOverlayProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const beaconRef = useRef<Mesh<any, MeshBasicMaterial>>(null)

  useFrame(({ clock }) => {
    if (beaconRef.current) {
      const t = clock.getElapsedTime()
      const blink = Math.sin(t * 6) > 0
      beaconRef.current.material.color.setHex(blink ? 0xFF8A00 : 0x4A1A00)
    }
  })

  return (
    <>
      {/* Left damage panel */}
      <mesh position={[-vehicleLength * 0.1, vehicleHeight * 0.3, vehicleWidth * 0.52]}>
        <boxGeometry args={[vehicleLength * 0.45, vehicleHeight * 0.38, 0.04]} />
        <meshStandardMaterial color="#CC2200" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Right damage panel */}
      <mesh position={[vehicleLength * 0.2, vehicleHeight * 0.2, -vehicleWidth * 0.52]}>
        <boxGeometry args={[vehicleLength * 0.3, vehicleHeight * 0.28, 0.04]} />
        <meshStandardMaterial color="#991A00" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Roof beacon */}
      <mesh
        ref={beaconRef}
        position={[0, vehicleHeight + 0.22, 0]}
      >
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#FF8A00" />
      </mesh>

      {/* Beacon housing */}
      <mesh position={[0, vehicleHeight + 0.12, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.12, 8]} />
        <meshStandardMaterial color="#333840" roughness={0.7} />
      </mesh>

      {/* Front cone left */}
      <mesh position={[vehicleLength * 0.7, -0.02, 0.22]}>
        <coneGeometry args={[0.08, 0.28, 6]} />
        <meshStandardMaterial color="#FF6600" roughness={0.6} />
      </mesh>

      {/* Front cone right */}
      <mesh position={[vehicleLength * 0.7, -0.02, -0.22]}>
        <coneGeometry args={[0.08, 0.28, 6]} />
        <meshStandardMaterial color="#FF6600" roughness={0.6} />
      </mesh>

      {/* Subtle red ring on ground */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.24, 0]}>
        <torusGeometry args={[vehicleLength * 0.6, 0.04, 6, 24]} />
        <meshBasicMaterial color="#CC2200" />
      </mesh>
    </>
  )
}
