export function Lights() {
  return (
    <>
      <ambientLight intensity={0.28} color="#4b7695" />
      <directionalLight
        position={[-14, 12, 8]}
        intensity={3.6}
        color="#42cfff"
      />
      <directionalLight
        position={[14, 10, -8]}
        intensity={2.4}
        color="#ff365f"
      />
      <pointLight position={[-14, 3, -2]} intensity={11} distance={20} color="#009de0" />
      <pointLight position={[14, 3, 2]} intensity={9} distance={20} color="#d91f54" />
    </>
  )
}
