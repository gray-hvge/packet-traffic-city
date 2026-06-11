export function CityGround() {
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.04}>
      <planeGeometry args={[70, 42]} />
      <meshStandardMaterial color="#101716" roughness={1} />
    </mesh>
  )
}
