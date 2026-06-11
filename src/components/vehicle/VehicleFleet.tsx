import { useMemo, useRef } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { trafficStreams } from '../../data/trafficStreams'
import {
  MAX_ACTIVE_PACKETS,
  useSimulationStore,
} from '../../store/simulationStore'
import type {
  HighwayVehicle,
  PacketDirection,
  PacketType,
} from '../../types/highway'
import {
  LANE_COUNT,
  RX_LANES,
  RX_SHOULDER,
  TX_LANES,
  TX_SHOULDER,
} from '../../utils/highwayLanes'
import { VehicleByType } from '../vehicleKit/VehicleByType'

let packetCounter = 0

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const generateId = () =>
  `pkt-${String(++packetCounter).padStart(4, '0')}`

export function VehicleFleet() {
  const activePackets = useSimulationStore((state) => state.activePackets)
  const selectedId = useSimulationStore((state) => state.selectedId)
  const filterType = useSimulationStore((state) => state.filterType)
  const lastSpawnTime = useRef<Record<string, number>>({})
  const directionToggle = useRef<Record<string, boolean>>({})
  const stoppedAt = useRef<Record<string, number>>({})
  const lastStatsUpdate = useRef(0)
  const previousTime = useRef(0)
  const spawnedInWindow = useRef<
    { time: number; direction: PacketDirection; dropped: boolean }[]
  >([])
  const curveLength = useMemo(() => RX_LANES[0].getLength() * 0.625, [])

  useFrame((_, delta) => {
    const store = useSimulationStore.getState()
    if (!store.isPlaying) return

    store.tick(delta)
    const elapsed = store.currentTime + delta * store.speed

    if (store.dataSource !== 'mock') return

    if (elapsed < previousTime.current) {
      lastSpawnTime.current = {}
      stoppedAt.current = {}
      spawnedInWindow.current = []
      lastStatsUpdate.current = 0
      packetCounter = 0
    }
    previousTime.current = elapsed

    if (store.activePackets.length < MAX_ACTIVE_PACKETS) {
      for (const stream of trafficStreams) {
        const direction: PacketDirection =
          stream.direction === 'both'
            ? directionToggle.current[stream.type]
              ? 'rx'
              : 'tx'
            : stream.direction
        const key = `${stream.type}-${direction}`
        const lastSpawn = lastSpawnTime.current[key] ?? 0

        if (elapsed - lastSpawn < stream.spawnInterval) continue

        lastSpawnTime.current[key] = elapsed
        if (stream.direction === 'both') {
          directionToggle.current[stream.type] =
            !directionToggle.current[stream.type]
        }

        const status = Math.random() < stream.dropRate ? 'drop' : 'pass'
        const laneIndex = Math.floor(Math.random() * LANE_COUNT)
        const laneSpeedFactor = 1 - laneIndex * 0.05
        const speed =
          (stream.speedMin +
            Math.random() * (stream.speedMax - stream.speedMin)) *
          laneSpeedFactor
        const packet: HighwayVehicle = {
          id: generateId(),
          type: stream.type,
          direction,
          status,
          size:
            stream.sizeMin +
            Math.random() * (stream.sizeMax - stream.sizeMin),
          speed,
          dropProgress: 0.4 + Math.random() * 0.4,
          dropReason:
            status === 'drop'
              ? stream.dropReasons[
                  Math.floor(Math.random() * stream.dropReasons.length)
                ]
              : undefined,
          spawnedAt: elapsed,
          laneIndex,
          source: 'mock',
        }
        store.spawnPacket(packet)
        spawnedInWindow.current.push({
          time: elapsed,
          direction,
          dropped: status === 'drop',
        })
      }
    }

    if (elapsed - lastStatsUpdate.current >= 1) {
      lastStatsUpdate.current = elapsed
      const window = spawnedInWindow.current.filter(
        (event) => elapsed - event.time <= 1,
      )
      spawnedInWindow.current = window
      store.updateStats({
        rxRate: window.filter((event) => event.direction === 'rx').length,
        txRate: window.filter((event) => event.direction === 'tx').length,
        dropRate: window.filter((event) => event.dropped).length,
        activeCount: store.activePackets.length,
      })
    }
  })

  return (
    <>
      {activePackets.map((packet) => (
        <PacketVehicle
          key={packet.id}
          packet={packet}
          curveLength={curveLength}
          isSelected={selectedId === packet.id}
          isFiltered={filterType !== null && filterType !== packet.type}
          stoppedAt={stoppedAt}
        />
      ))}
    </>
  )
}

function PacketVehicle({
  packet,
  curveLength,
  isSelected,
  isFiltered,
  stoppedAt,
}: {
  packet: HighwayVehicle
  curveLength: number
  isSelected: boolean
  isFiltered: boolean
  stoppedAt: React.MutableRefObject<Record<string, number>>
}) {
  const groupRef = useRef<Group>(null)
  const hasReachedShoulder = useRef(false)
  const mainLane =
    packet.direction === 'rx'
      ? RX_LANES[packet.laneIndex]
      : TX_LANES[packet.laneIndex]
  const shoulder =
    packet.direction === 'rx' ? RX_SHOULDER : TX_SHOULDER

  useFrame(() => {
    const group = groupRef.current
    if (!group) return

    const store = useSimulationStore.getState()
    const elapsed = store.currentTime
    const progress =
      ((elapsed - packet.spawnedAt) * packet.speed) / curveLength

    if (packet.status === 'pass') {
      if (progress >= 1) {
        store.removePacket(packet.id)
        return
      }
      group.scale.setScalar(palmTransferScale(progress))
      positionOnCurve(group, mainLane, progress)
      return
    }

    group.scale.setScalar(1)
    if (progress < packet.dropProgress) {
      positionOnCurve(group, mainLane, progress)
      return
    }

    const mergeProgress = clamp(
      (progress - packet.dropProgress) / 0.15,
      0,
      1,
    )
    const mainPosition = mainLane.getPointAt(packet.dropProgress)
    const shoulderPosition = shoulder.getPointAt(packet.dropProgress)
    group.position.lerpVectors(mainPosition, shoulderPosition, mergeProgress)
    const tangent = mainLane.getTangentAt(packet.dropProgress)
    group.rotation.y = Math.atan2(-tangent.z, tangent.x)

    if (mergeProgress >= 1) {
      hasReachedShoulder.current = true
      const stopped = stoppedAt.current[packet.id]
      if (stopped === undefined) {
        stoppedAt.current[packet.id] = elapsed
      } else if (elapsed - stopped >= 2) {
        delete stoppedAt.current[packet.id]
        store.removePacket(packet.id)
      }
    }
  })

  return (
    <group
      ref={groupRef}
      onClick={(event) => {
        event.stopPropagation()
        useSimulationStore.getState().selectPacket(packet.id)
      }}
    >
      {isFiltered ? (
        <mesh>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshBasicMaterial color="#333333" transparent opacity={0.24} />
        </mesh>
      ) : (
        <VehicleByType
          type={packet.type as PacketType}
          errorState={packet.status === 'drop' && hasReachedShoulder.current}
          scale={packet.size}
        />
      )}
      {isSelected && (
        <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.65, 0.04, 8, 32]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
      {packet.status === 'drop' &&
        hasReachedShoulder.current &&
        packet.dropReason && (
          <Text position={[0, 1.4, 0]} fontSize={0.18} color="#ff6644">
            {packet.dropReason}
          </Text>
        )}
    </group>
  )
}

function palmTransferScale(progress: number) {
  const entry = clamp(progress / 0.08, 0, 1)
  const exit = clamp((1 - progress) / 0.08, 0, 1)
  return Math.max(0.05, Math.min(entry, exit))
}

function positionOnCurve(
  group: Group,
  curve: (typeof RX_LANES)[number],
  progress: number,
) {
  const boundedProgress = clamp(progress, 0, 1)
  const position = curve.getPointAt(boundedProgress)
  const tangent = curve.getTangentAt(boundedProgress)
  group.position.copy(position)
  group.rotation.y = Math.atan2(-tangent.z, tangent.x)
}
