import { Text } from '@react-three/drei'

export function IncidentShoulder() {
  return (
    <group>
      {([-7.2, 7.2] as const).map((z) => (
        <group key={z}>
          <mesh position={[0, 0.1, z]} receiveShadow>
            <boxGeometry args={[64, 0.045, 2.1]} />
            <meshStandardMaterial
              color="#210817"
              emissive="#7c0b2d"
              emissiveIntensity={0.34}
              roughness={0.35}
              transparent
              opacity={0.14}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 0.2, z > 0 ? 6.15 : -6.15]}>
            <boxGeometry args={[64, 0.03, 0.13]} />
            <meshStandardMaterial
              color={z > 0 ? '#ff365f' : '#28cfff'}
              emissive={z > 0 ? '#8a0d2c' : '#075f80'}
              emissiveIntensity={0.8}
              transparent
              opacity={0.82}
            />
          </mesh>
          <mesh position={[0, 0.2, z]}>
            <boxGeometry args={[64, 0.01, 2]} />
            <meshStandardMaterial
              color="#ff2200"
              transparent
              opacity={0.065}
              depthWrite={false}
            />
          </mesh>
          <Text
            position={[z > 0 ? -8 : 8, 0.25, z]}
            rotation={[-Math.PI / 2, 0, z > 0 ? Math.PI : 0]}
            fontSize={0.32}
            color="#ff6b89"
            fillOpacity={0.5}
          >
            ERROR SHOULDER · STOP
          </Text>
        </group>
      ))}
    </group>
  )
}
