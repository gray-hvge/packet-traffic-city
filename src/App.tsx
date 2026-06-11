import { useState } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { VehicleKitScene } from './components/vehicleKit/VehicleKitScene'

type SceneId = 'highway' | 'kit'

const SCENE_CYCLE: Record<SceneId, SceneId> = {
  highway: 'kit',
  kit: 'highway',
}

const SCENE_LABEL: Record<SceneId, string> = {
  highway: 'VEHICLE KIT →',
  kit: '← HIGHWAY',
}

function App() {
  const [scene, setScene] = useState<SceneId>('highway')

  return (
    <>
      {scene === 'highway' && <AppLayout />}
      {scene === 'kit' && (
        <div style={{ width: '100vw', height: '100vh' }}>
          <VehicleKitScene />
        </div>
      )}
      <button
        onClick={() => setScene((s) => SCENE_CYCLE[s])}
        style={{
          position: 'fixed',
          top: 12,
          right: 12,
          zIndex: 9999,
          background: '#1a2830',
          color: '#a0c8d8',
          border: '1px solid #2a4050',
          borderRadius: 4,
          padding: '5px 12px',
          fontSize: 12,
          cursor: 'pointer',
          fontFamily: 'monospace',
          letterSpacing: '0.08em',
        }}
      >
        {SCENE_LABEL[scene]}
      </button>
    </>
  )
}

export default App
