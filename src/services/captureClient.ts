import { useSimulationStore } from '../store/simulationStore'
import type { CaptureState, PacketRecord } from '../types/highway'

const API_URL = 'http://127.0.0.1:5174'
const WS_URL = 'ws://127.0.0.1:5174'

let socket: WebSocket | null = null
let reconnectTimer: number | null = null
let recentPackets: { time: number; direction: string; dropped: boolean }[] = []
let lastRenderedAt = 0
const MIN_RENDER_INTERVAL_MS = 40

export function connectCaptureClient() {
  if (socket?.readyState === WebSocket.OPEN || socket?.readyState === WebSocket.CONNECTING) {
    return
  }

  socket = new WebSocket(WS_URL)
  socket.addEventListener('open', () => {
    useSimulationStore.getState().updateCapture({
      connected: true,
      error: null,
    })
  })
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data) as
      | { type: 'packet'; packet: PacketRecord }
      | { type: 'state'; state: Partial<CaptureState> }
      | { type: 'replay-progress'; currentTime: number }
      | { type: 'replay-ended' }
      | { type: 'error'; message: string }

    if (message.type === 'packet') {
      const store = useSimulationStore.getState()
      if (store.dataSource === message.packet.source) {
        updatePacketRates(message.packet)
        const now = Date.now()
        if (
          store.isPlaying &&
          now - lastRenderedAt >= MIN_RENDER_INTERVAL_MS
        ) {
          lastRenderedAt = now
          store.ingestRealPacket(message.packet)
        }
      }
    } else if (message.type === 'state') {
      useSimulationStore.getState().updateCapture(message.state)
    } else if (message.type === 'replay-progress') {
      useSimulationStore.getState().updateCapture({
        replayTime: message.currentTime,
      })
    } else if (message.type === 'replay-ended') {
      useSimulationStore.getState().updateCapture({
        error: 'PCAP replay complete',
      })
    } else if (message.type === 'error') {
      useSimulationStore.getState().updateCapture({ error: message.message })
    }
  })
  socket.addEventListener('close', () => {
    useSimulationStore.getState().updateCapture({ connected: false })
    socket = null
    if (reconnectTimer === null) {
      reconnectTimer = window.setTimeout(() => {
        reconnectTimer = null
        connectCaptureClient()
      }, 1500)
    }
  })
}

export async function selectMockSource() {
  await postJson('/api/source/stop', {})
  recentPackets = []
  lastRenderedAt = 0
  useSimulationStore.getState().setDataSource('mock')
}

export async function startLiveCapture(interfaceName = 'Wi-Fi') {
  useSimulationStore.getState().setDataSource('live')
  await postJson('/api/live/start', { interfaceName })
}

export async function startDefaultPcap() {
  useSimulationStore.getState().setDataSource('pcap')
  await postJson('/api/pcap/start', {})
}

export async function uploadPcap(file: File) {
  useSimulationStore.getState().setDataSource('pcap')
  const response = await fetch(
    `${API_URL}/api/pcap/upload?filename=${encodeURIComponent(file.name)}`,
    {
      method: 'POST',
      body: await file.arrayBuffer(),
    },
  )
  await ensureSuccess(response)
}

export async function controlCapture(
  action: 'pause' | 'play' | 'restart' | 'speed',
  speed?: number,
) {
  await postJson('/api/control', { action, speed })
}

async function postJson(path: string, body: unknown) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  await ensureSuccess(response)
}

async function ensureSuccess(response: Response) {
  if (response.ok) return
  const result = (await response.json()) as { error?: string }
  const message = result.error ?? `Capture service returned ${response.status}`
  useSimulationStore.getState().updateCapture({ error: message })
  throw new Error(message)
}

function updatePacketRates(packet: PacketRecord) {
  const now = Date.now()
  recentPackets.push({
    time: now,
    direction: packet.direction,
    dropped: packet.isError,
  })
  recentPackets = recentPackets.filter((item) => now - item.time <= 1000)
  const store = useSimulationStore.getState()
  store.updateStats({
    rxRate: recentPackets.filter((item) => item.direction === 'rx').length,
    txRate: recentPackets.filter((item) => item.direction === 'tx').length,
    dropRate: recentPackets.filter((item) => item.dropped).length,
    activeCount: store.activePackets.length,
  })
}
