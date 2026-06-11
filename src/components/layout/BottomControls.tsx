import { controlCapture } from '../../services/captureClient'
import { useSimulationStore } from '../../store/simulationStore'

export function BottomControls() {
  const { isPlaying, speed, dataSource, play, pause, replay, setSpeed } =
    useSimulationStore()

  const togglePlayback = () => {
    if (isPlaying) {
      pause()
      if (dataSource === 'pcap') {
        void controlCapture('pause').catch(() => undefined)
      }
    } else {
      play()
      if (dataSource === 'pcap') {
        void controlCapture('play').catch(() => undefined)
      }
    }
  }

  const restart = () => {
    replay()
    if (dataSource === 'pcap') {
      void controlCapture('restart').catch(() => undefined)
    }
  }

  const changeSpeed = (value: number) => {
    setSpeed(value)
    if (dataSource === 'pcap') {
      void controlCapture('speed', value).catch(() => undefined)
    }
  }

  return (
    <div className="highway-controls">
      <button
        className="primary-control"
        type="button"
        onClick={togglePlayback}
        aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
      >
        <span>{isPlaying ? 'Ⅱ' : '▶'}</span>
        {isPlaying ? 'Pause flow' : 'Resume flow'}
      </button>
      <button type="button" onClick={restart} aria-label="Restart simulation">
        Restart
      </button>
      <div className="speed-controls" aria-label="Playback speed">
        {[0.5, 1, 2].map((value) => (
          <button
            type="button"
            key={value}
            className={speed === value ? 'active' : ''}
            onClick={() => changeSpeed(value)}
          >
            {value}×
          </button>
        ))}
      </div>
    </div>
  )
}
