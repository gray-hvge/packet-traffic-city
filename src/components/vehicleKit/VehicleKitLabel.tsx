// src/components/vehicleKit/VehicleKitLabel.tsx
import { Text } from '@react-three/drei'

interface VehicleKitLabelProps {
  label: string
  descriptor: string
  positionY?: number
}

export function VehicleKitLabel({ label, descriptor, positionY = -1.1 }: VehicleKitLabelProps) {
  return (
    <group position={[0, positionY, 0]}>
      <Text
        position={[0, 0, 0]}
        fontSize={0.22}
        color="#ffffff"
        anchorX="center"
        anchorY="top"
        outlineWidth={0.012}
        outlineColor="#09100f"
      >
        {label}
      </Text>
      <Text
        position={[0, -0.28, 0]}
        fontSize={0.14}
        color="#6b7880"
        anchorX="center"
        anchorY="top"
        outlineWidth={0.008}
        outlineColor="#09100f"
      >
        {descriptor}
      </Text>
    </group>
  )
}
