import { Text } from '@react-three/drei'
import { useMemo } from 'react'
import { Shape } from 'three'
import {
  ROAD_END,
  ROAD_START,
  RX_LANES,
  TX_LANES,
} from '../../utils/highwayLanes'

export function HighwayRoad() {
  const roadShape = useMemo(() => createRoadShape(), [])

  return (
    <group>
      <mesh
        position={[0, 0.08, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <shapeGeometry args={[roadShape]} />
        <meshStandardMaterial
          color="#071827"
          emissive="#082b43"
          emissiveIntensity={0.55}
          roughness={0.35}
          metalness={0.35}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.19, -1]}>
        <boxGeometry args={[63.6, 0.035, 0.86]} />
        <meshStandardMaterial
          color="#0b3856"
          emissive="#06a8e8"
          emissiveIntensity={0.72}
          roughness={0.25}
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>

      {[...RX_LANES, ...TX_LANES].map((curve, index) => (
          <mesh key={index}>
            <tubeGeometry args={[curve, 32, 0.022, 5, false]} />
            <meshBasicMaterial
              color={index < RX_LANES.length ? '#36d8ff' : '#ff527d'}
              transparent
              opacity={0.25}
              depthWrite={false}
            />
          </mesh>
        ))}

      <mesh position={[0, 0.21, 0]}>
        <boxGeometry args={[64, 0.02, 0.08]} />
        <meshBasicMaterial
          color="#b9eaff"
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </mesh>
      <EnergyEdge position={[0, 0.2, -5.02]} color="#25ceff" />
      <EnergyEdge position={[0, 0.2, 5.02]} color="#ff365f" />
      <HologramGrid />

      <RoadLabel text="RX / INBOUND  →" position={[-18, 0.25, -3]} />
      <RoadLabel text="←  TX / OUTBOUND" position={[18, 0.25, 3]} />
      <RoadLabel text="HTTPS 443 EXPRESS" position={[-6, 0.26, -1]} color="#8dc8ff" />
      <ExitLabel text="DNS / UDP EXIT" position={[13, 1.15, -5.1]} />
      <ExitLabel text="INTERNAL / DB" position={[-13, 1.15, 5.1]} />
      <DirectionArrows />
    </group>
  )
}

function EnergyEdge({
  position,
  color,
}: {
  position: [number, number, number]
  color: string
}) {
  return (
    <>
      <mesh position={position}>
        <boxGeometry args={[64, 0.025, 0.08]} />
        <meshBasicMaterial color={color} transparent opacity={0.88} />
      </mesh>
      <pointLight
        position={[position[0], 0.8, position[2]]}
        color={color}
        intensity={3.2}
        distance={7}
      />
    </>
  )
}

function HologramGrid() {
  return (
    <group>
      {[-24, -16, -8, 0, 8, 16, 24].map((x) => (
        <mesh key={x} position={[x, 0.205, 0]}>
          <boxGeometry args={[0.018, 0.012, 9.8 + Math.abs(x) * 0.18]} />
          <meshBasicMaterial
            color={x < 0 ? '#27bce8' : '#d43b61'}
            transparent
            opacity={0.12}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function DirectionArrows() {
  return (
    <>
      {[-23, -8, 8, 23].flatMap((x) => [
        <mesh
          key={`rx-${x}`}
          position={[x, 0.25, -3.4]}
          rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        >
          <coneGeometry args={[0.24, 0.65, 3]} />
          <meshBasicMaterial color="#6ee7ff" transparent opacity={0.34} />
        </mesh>,
        <mesh
          key={`tx-${x}`}
          position={[x, 0.25, 3.4]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        >
          <coneGeometry args={[0.24, 0.65, 3]} />
          <meshBasicMaterial color="#ff7894" transparent opacity={0.34} />
        </mesh>,
      ])}
    </>
  )
}

function createRoadShape() {
  const shape = new Shape()
  shape.moveTo(ROAD_START, -6.35)
  shape.lineTo(-16, -5.5)
  shape.lineTo(0, -4.65)
  shape.lineTo(16, -5.5)
  shape.lineTo(ROAD_END, -6.35)
  shape.lineTo(ROAD_END, 6.35)
  shape.lineTo(16, 5.5)
  shape.lineTo(0, 4.65)
  shape.lineTo(-16, 5.5)
  shape.lineTo(ROAD_START, 6.35)
  shape.closePath()
  return shape
}

function RoadLabel({
  text,
  position,
  color = '#7fcee2',
}: {
  text: string
  position: [number, number, number]
  color?: string
}) {
  return (
    <Text
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      fontSize={0.34}
      color={color}
      fillOpacity={0.42}
      letterSpacing={0.08}
    >
      {text}
    </Text>
  )
}

function ExitLabel({
  text,
  position,
}: {
  text: string
  position: [number, number, number]
}) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[2.3, 0.62, 0.1]} />
        <meshStandardMaterial
          color="#092b3c"
          emissive="#0c6d91"
          emissiveIntensity={0.4}
          transparent
          opacity={0.76}
        />
      </mesh>
      <Text position={[0, 0, 0.07]} fontSize={0.2} color="#e2efe4">
        {text}
      </Text>
    </group>
  )
}
