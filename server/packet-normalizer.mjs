let packetCounter = 0

const DATABASE_PORTS = new Set([1433, 1521, 3306, 5432, 6379, 27017])
const MEDIA_PROTOCOLS = ['rtp', 'rtsp', 'sip', 'mpeg', 'h264', 'h265']

const toNumber = (value) => {
  if (value === undefined || value === '') return undefined
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

export function inferDirection(srcIp, dstIp, localAddresses) {
  const sourceIsLocal = srcIp ? localAddresses.has(srcIp) : false
  const destinationIsLocal = dstIp ? localAddresses.has(dstIp) : false

  if (destinationIsLocal && !sourceIsLocal) return 'rx'
  if (sourceIsLocal && !destinationIsLocal) return 'tx'
  return 'unknown'
}

export function mapVehicleType(packet) {
  const application = (packet.applicationProtocol ?? '').toLowerCase()
  const transport = (packet.transportProtocol ?? '').toLowerCase()
  const ports = [packet.srcPort, packet.dstPort].filter(Boolean)

  if (application.includes('dns') || ports.includes(53)) return 'dns'
  if (
    application.includes('quic') ||
    application.includes('http3') ||
    application.includes('http/3')
  ) {
    return 'quic'
  }
  if (
    application.includes('tls') ||
    application.includes('ssl') ||
    ports.includes(443)
  ) {
    return 'https'
  }
  if (application.includes('http') || ports.includes(80)) return 'http'
  if (application.includes('ssh') || ports.includes(22)) return 'ssh'
  if (
    MEDIA_PROTOCOLS.some((protocol) => application.includes(protocol)) ||
    (packet.length ?? 0) >= 1200
  ) {
    return 'media'
  }
  if (
    ports.some((port) => DATABASE_PORTS.has(port)) ||
    ['mysql', 'pgsql', 'mongodb', 'redis', 'tds'].some((protocol) =>
      application.includes(protocol),
    )
  ) {
    return 'database'
  }
  if (transport.includes('icmp')) return 'icmp'
  if (transport === 'udp') return 'udp'
  if (transport === 'tcp') return 'tcp'
  return 'unknown'
}

export function parseTsharkLine(line, context) {
  const fields = line.replace(/\r$/, '').split('\t')
  const hasTransportPorts = fields.length >= 14
  const hasIpv6Fields = fields.length >= 12
  const timestamp = toNumber(fields[0]) ?? Date.now() / 1000
  const srcIp = hasIpv6Fields ? fields[1] || fields[2] : fields[1]
  const dstIp = hasIpv6Fields ? fields[3] || fields[4] : fields[2]
  const offset = hasIpv6Fields ? 2 : 0
  const srcPort = hasTransportPorts
    ? toNumber(fields[5]) ?? toNumber(fields[7])
    : toNumber(fields[3 + offset])
  const dstPort = hasTransportPorts
    ? toNumber(fields[6]) ?? toNumber(fields[8])
    : toNumber(fields[4 + offset])
  const protocolIndex = hasTransportPorts ? 9 : 5 + offset
  const transportProtocol = (fields[protocolIndex] || 'other').toLowerCase()
  const applicationProtocol =
    fields[protocolIndex + 1] || transportProtocol
  const length = toNumber(fields[protocolIndex + 2]) ?? 0
  const tcpFlags = fields[protocolIndex + 3] || undefined
  const expertMessage = fields[protocolIndex + 4] || undefined
  const direction = inferDirection(
    srcIp,
    dstIp,
    context.localAddresses,
  )
  const basePacket = {
    id: `real-${String(++packetCounter).padStart(8, '0')}`,
    source: context.source,
    capturedAt: timestamp,
    relativeTime: Math.max(0, timestamp - context.firstTimestamp),
    interfaceName: context.interfaceName,
    srcIp: srcIp || undefined,
    dstIp: dstIp || undefined,
    srcPort,
    dstPort,
    ipVersion:
      srcIp?.includes(':') || dstIp?.includes(':') ? 6 : srcIp || dstIp ? 4 : undefined,
    transportProtocol,
    applicationProtocol,
    tcpFlags,
    length,
    direction,
    expertMessage,
    isError: isPacketError(expertMessage),
    rawSummary: [
      srcIp,
      srcPort && `:${srcPort}`,
      ' -> ',
      dstIp,
      dstPort && `:${dstPort}`,
      applicationProtocol,
    ]
      .filter(Boolean)
      .join(' '),
  }

  return {
    ...basePacket,
    vehicleType: mapVehicleType(basePacket),
  }
}

function isPacketError(message) {
  if (!message) return false
  return /(malformed|checksum.*(?:bad|incorrect)|protocol error|invalid packet|expert error)/i.test(
    message,
  )
}
