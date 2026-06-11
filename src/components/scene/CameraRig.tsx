import { OrbitControls } from '@react-three/drei'

export function CameraRig() {
  return (
    <OrbitControls
      makeDefault
      target={[0, 0, 0]}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={18}
      maxDistance={35}
      minPolarAngle={Math.PI / 4.6}
      maxPolarAngle={Math.PI / 2.9}
      minAzimuthAngle={-0.24}
      maxAzimuthAngle={0.24}
    />
  )
}
