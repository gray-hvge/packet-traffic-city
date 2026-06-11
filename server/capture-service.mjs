import { createServer } from 'node:http'
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { extname, basename, join } from 'node:path'
import { networkInterfaces } from 'node:os'
import { WebSocketServer, WebSocket } from 'ws'
import { parseTsharkLine } from './packet-normalizer.mjs'
import {
  createTsharkProcess,
  findTshark,
  listInterfaces,
} from './tshark-source.mjs'

const HOST = '127.0.0.1'
const PORT = 5174
const tsharkPath = findTshark()
const uploadDirectory = join(process.cwd(), '.capture-uploads')
const defaultPcap = process.env.PACKET_HIGHWAY_DEFAULT_PCAP || ''

mkdirSync(uploadDirectory, { recursive: true })

const localAddresses = new Set(
  Object.values(networkInterfaces())
    .flat()
    .filter(Boolean)
    .map((address) => address.address.split('%')[0]),
)

const state = {
  mode: 'idle',
  interfaceName: null,
  pcapPath: null,
  pcapName: null,
  process: null,
  firstTimestamp: null,
  replayQueue: [],
  replayTimer: null,
  replayCursor: 0,
  replayPaused: false,
  replaySpeed: 1,
  parserErrors: 0,
  eof: false,
  sourceToken: 0,
}

const server = createServer(async (request, response) => {
  setCors(response)
  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  try {
    const url = new URL(request.url, `http://${request.headers.host}`)
    if (request.method === 'GET' && url.pathname === '/api/status') {
      sendJson(response, 200, getStatus())
      return
    }
    if (request.method === 'GET' && url.pathname === '/api/interfaces') {
      sendJson(response, 200, { interfaces: listInterfaces(tsharkPath) })
      return
    }
    if (request.method === 'POST' && url.pathname === '/api/live/start') {
      const body = await readJson(request)
      startLive(body.interfaceName || 'Wi-Fi')
      sendJson(response, 200, getStatus())
      return
    }
    if (request.method === 'POST' && url.pathname === '/api/source/stop') {
      stopSource()
      sendJson(response, 200, getStatus())
      return
    }
    if (request.method === 'POST' && url.pathname === '/api/pcap/start') {
      const body = await readJson(request)
      startPcap(validatePcapPath(body.path || defaultPcap))
      sendJson(response, 200, getStatus())
      return
    }
    if (request.method === 'POST' && url.pathname === '/api/pcap/upload') {
      const extension = extname(url.searchParams.get('filename') || '').toLowerCase()
      if (!['.pcap', '.pcapng', '.cap'].includes(extension)) {
        throw new Error('Only .pcap, .pcapng, and .cap files are supported')
      }
      const data = await readBinary(request, 150 * 1024 * 1024)
      const path = join(uploadDirectory, `selected${extension}`)
      writeFileSync(path, data)
      startPcap(path)
      sendJson(response, 200, getStatus())
      return
    }
    if (request.method === 'POST' && url.pathname === '/api/control') {
      const body = await readJson(request)
      controlReplay(body)
      sendJson(response, 200, getStatus())
      return
    }
    sendJson(response, 404, { error: 'Not found' })
  } catch (error) {
    broadcast({ type: 'error', message: error.message })
    sendJson(response, 400, { error: error.message })
  }
})

const websocketServer = new WebSocketServer({ server })
websocketServer.on('connection', (socket) => {
  socket.send(JSON.stringify({ type: 'state', state: getStatus() }))
})

function startLive(interfaceName) {
  requireTshark()
  stopSource()
  const sourceToken = state.sourceToken
  state.mode = 'live'
  state.interfaceName = interfaceName
  state.firstTimestamp = null
  state.process = createTsharkProcess(
    tsharkPath,
    ['-i', interfaceName],
    (line) => {
      if (sourceToken === state.sourceToken) {
        emitParsedLine(line, 'live', interfaceName)
      }
    },
    (error) => {
      if (sourceToken === state.sourceToken) handleProcessError(error)
    },
    (code, stderr) => {
      if (sourceToken === state.sourceToken) handleProcessExit(code, stderr)
    },
  )
  broadcastState()
}

function startPcap(path) {
  requireTshark()
  stopSource()
  const sourceToken = state.sourceToken
  state.mode = 'pcap'
  state.pcapPath = path
  state.pcapName = basename(path)
  state.firstTimestamp = null
  state.replayQueue = []
  state.replayCursor = 0
  state.replayPaused = false
  state.eof = false
  state.process = createTsharkProcess(
    tsharkPath,
    ['-r', path],
    (line) => {
      if (sourceToken !== state.sourceToken) return
      const packet = parseLine(line, 'pcap', state.pcapName)
      if (packet) {
        state.replayQueue.push(packet)
        pumpReplay()
      }
    },
    (error) => {
      if (sourceToken === state.sourceToken) handleProcessError(error)
    },
    (code, stderr) => {
      if (sourceToken !== state.sourceToken) return
      state.process = null
      state.eof = true
      if (code !== 0) broadcast({ type: 'error', message: stderr || `TShark exited with ${code}` })
      pumpReplay()
      broadcastState()
    },
  )
  broadcastState()
}

function emitParsedLine(line, source, interfaceName) {
  const packet = parseLine(line, source, interfaceName)
  if (packet) broadcast({ type: 'packet', packet })
}

function parseLine(line, source, interfaceName) {
  const timestamp = Number(line.split('\t', 1)[0])
  if (state.firstTimestamp === null && Number.isFinite(timestamp)) {
    state.firstTimestamp = timestamp
  }
  try {
    return parseTsharkLine(line, {
      source,
      localAddresses,
      interfaceName,
      firstTimestamp: state.firstTimestamp ?? timestamp,
    })
  } catch {
    state.parserErrors += 1
    return null
  }
}

function pumpReplay() {
  if (
    state.mode !== 'pcap' ||
    state.replayPaused ||
    state.replayTimer ||
    state.replayQueue.length === 0
  ) {
    if (state.eof && state.replayQueue.length === 0 && !state.replayTimer) {
      broadcast({ type: 'replay-ended' })
    }
    return
  }

  const packet = state.replayQueue[0]
  const delay = Math.max(
    0,
    ((packet.relativeTime - state.replayCursor) / state.replaySpeed) * 1000,
  )
  state.replayTimer = setTimeout(() => {
    state.replayTimer = null
    state.replayQueue.shift()
    state.replayCursor = packet.relativeTime
    broadcast({ type: 'packet', packet })
    broadcast({
      type: 'replay-progress',
      currentTime: state.replayCursor,
      queued: state.replayQueue.length,
    })
    pumpReplay()
  }, delay)
}

function controlReplay(command) {
  if (command.action === 'pause') {
    state.replayPaused = true
    clearReplayTimer()
  } else if (command.action === 'play') {
    state.replayPaused = false
    pumpReplay()
  } else if (command.action === 'speed') {
    state.replaySpeed = [0.5, 1, 2].includes(command.speed) ? command.speed : 1
    clearReplayTimer()
    pumpReplay()
  } else if (command.action === 'restart' && state.pcapPath) {
    startPcap(state.pcapPath)
    return
  }
  broadcastState()
}

function stopSource() {
  state.sourceToken += 1
  clearReplayTimer()
  if (state.process) {
    state.process.kill()
    state.process = null
  }
  state.mode = 'idle'
  state.interfaceName = null
  state.replayQueue = []
  state.replayCursor = 0
  state.eof = false
  broadcastState()
}

function clearReplayTimer() {
  if (state.replayTimer) clearTimeout(state.replayTimer)
  state.replayTimer = null
}

function handleProcessError(error) {
  broadcast({ type: 'error', message: error.message })
}

function handleProcessExit(code, stderr) {
  state.process = null
  if (state.mode === 'live' && code !== 0) {
    broadcast({ type: 'error', message: stderr || `TShark exited with ${code}` })
  }
  broadcastState()
}

function validatePcapPath(path) {
  const extension = extname(path).toLowerCase()
  if (!['.pcap', '.pcapng', '.cap'].includes(extension) || !existsSync(path)) {
    throw new Error('PCAP path does not exist or has an unsupported extension')
  }
  return path
}

function requireTshark() {
  if (!tsharkPath) throw new Error('TShark is not installed or not on PATH')
}

function getStatus() {
  return {
    tsharkAvailable: Boolean(tsharkPath),
    tsharkPath,
    mode: state.mode,
    interfaceName: state.interfaceName,
    pcapName: state.pcapName,
    replayPaused: state.replayPaused,
    replaySpeed: state.replaySpeed,
    replayTime: state.replayCursor,
    parserErrors: state.parserErrors,
    defaultPcapAvailable: existsSync(defaultPcap),
    defaultPcap,
  }
}

function broadcastState() {
  broadcast({ type: 'state', state: getStatus() })
}

function broadcast(message) {
  const serialized = JSON.stringify(message)
  websocketServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(serialized)
  })
}

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(body))
}

function setCors(response) {
  response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5173')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
}

async function readJson(request) {
  const data = await readBinary(request, 1024 * 1024)
  return data.length ? JSON.parse(data.toString('utf8')) : {}
}

function readBinary(request, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    request.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        reject(new Error('Request body is too large'))
        request.destroy()
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => resolve(Buffer.concat(chunks)))
    request.on('error', reject)
  })
}

server.listen(PORT, HOST, () => {
  console.log(`Packet capture service listening on http://${HOST}:${PORT}`)
  console.log(tsharkPath ? `TShark: ${tsharkPath}` : 'TShark: not found')
})

process.on('SIGINT', () => {
  stopSource()
  server.close(() => process.exit(0))
})
