import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const WINDOWS_PATHS = [
  'C:\\Program Files\\Wireshark\\tshark.exe',
  'C:\\Program Files (x86)\\Wireshark\\tshark.exe',
]

export const TSHARK_FIELDS = [
  'frame.time_epoch',
  'ip.src',
  'ipv6.src',
  'ip.dst',
  'ipv6.dst',
  'tcp.srcport',
  'tcp.dstport',
  'udp.srcport',
  'udp.dstport',
  '_ws.col.Protocol',
  'frame.protocols',
  'frame.len',
  'tcp.flags',
  '_ws.expert.message',
]

export function findTshark() {
  const command = spawnSync('where.exe', ['tshark.exe'], {
    encoding: 'utf8',
    windowsHide: true,
  })
  const discovered = command.status === 0
    ? command.stdout.split(/\r?\n/).find(Boolean)
    : undefined
  return discovered ?? WINDOWS_PATHS.find(existsSync) ?? null
}

export function listInterfaces(tsharkPath) {
  if (!tsharkPath) return []
  const result = spawnSync(tsharkPath, ['-D'], {
    encoding: 'utf8',
    windowsHide: true,
  })
  if (result.status !== 0) return []
  return result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+)\.\s+(.+?)(?:\s+\((.+)\))?$/)
      return {
        id: match?.[1] ?? line,
        name: match?.[2] ?? line,
        description: match?.[3],
      }
    })
}

export function createTsharkProcess(tsharkPath, sourceArgs, onLine, onError, onExit) {
  const args = [
    ...sourceArgs,
    '-l',
    '-n',
    '-T',
    'fields',
    '-E',
    'separator=/t',
    '-E',
    'occurrence=f',
    ...TSHARK_FIELDS.flatMap((field) => ['-e', field]),
  ]
  const child = spawn(tsharkPath, args, {
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let stdoutBuffer = ''
  let stderrBuffer = ''

  child.stdout.setEncoding('utf8')
  child.stdout.on('data', (chunk) => {
    stdoutBuffer += chunk
    const lines = stdoutBuffer.split(/\r?\n/)
    stdoutBuffer = lines.pop() ?? ''
    lines.filter(Boolean).forEach(onLine)
  })
  child.stderr.setEncoding('utf8')
  child.stderr.on('data', (chunk) => {
    stderrBuffer = `${stderrBuffer}${chunk}`.slice(-4000)
  })
  child.on('error', onError)
  child.on('exit', (code) => onExit(code, stderrBuffer.trim()))
  return child
}
