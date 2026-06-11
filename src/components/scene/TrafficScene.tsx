import { Canvas } from '@react-three/fiber'
import { CameraRig } from './CameraRig'
import { Lights } from './Lights'
import { VehicleFleet } from '../vehicle/VehicleFleet'
import { useSimulationStore } from '../../store/simulationStore'
import { HighwayRoad } from '../highway/HighwayRoad'
import { IncidentShoulder } from '../highway/IncidentShoulder'

export function TrafficScene() {
  const selectPacket = useSimulationStore((state) => state.selectPacket)

  return (
    <Canvas
      camera={{ position: [0, 12, 21], fov: 44, near: 0.1, far: 120 }}
      dpr={[1, 1.25]}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => gl.setClearColor('#07111b', 0)}
      onPointerMissed={() => selectPacket(null)}
    >
      <fog attach="fog" args={['#07111b', 34, 64]} />
      <CameraRig />
      <Lights />
      <HighwayRoad />
      <IncidentShoulder />
      <VehicleFleet />
    </Canvas>
  )
}
