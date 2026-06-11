import test from 'node:test'
import assert from 'node:assert/strict'
import {
  inferDirection,
  mapVehicleType,
  parseTsharkLine,
} from './packet-normalizer.mjs'

test('infers rx and tx from local addresses', () => {
  const local = new Set(['10.103.56.132'])
  assert.equal(inferDirection('8.8.8.8', '10.103.56.132', local), 'rx')
  assert.equal(inferDirection('10.103.56.132', '1.1.1.1', local), 'tx')
  assert.equal(inferDirection('192.0.2.1', '198.51.100.2', local), 'unknown')
})

test('maps application protocol and ports to vehicle types', () => {
  assert.equal(mapVehicleType({ applicationProtocol: 'tls' }), 'https')
  assert.equal(mapVehicleType({ dstPort: 53, transportProtocol: 'udp' }), 'dns')
  assert.equal(mapVehicleType({ transportProtocol: 'icmp' }), 'icmp')
  assert.equal(mapVehicleType({ transportProtocol: 'tcp' }), 'tcp')
})

test('parses a tshark tab-separated packet line', () => {
  const packet = parseTsharkLine(
    '1710000000.125\t192.0.2.10\t10.103.56.132\t51515\t443\tTCP\tTLSv1.3\t1514\t0x0018\t',
    {
      source: 'live',
      localAddresses: new Set(['10.103.56.132']),
      interfaceName: 'Wi-Fi',
      firstTimestamp: 1710000000,
    },
  )

  assert.equal(packet.srcIp, '192.0.2.10')
  assert.equal(packet.dstIp, '10.103.56.132')
  assert.equal(packet.dstPort, 443)
  assert.equal(packet.direction, 'rx')
  assert.equal(packet.vehicleType, 'https')
  assert.equal(packet.length, 1514)
  assert.equal(packet.tcpFlags, '0x0018')
  assert.equal(packet.relativeTime, 0.125)
})

test('uses UDP ports and only marks explicit packet errors', () => {
  const packet = parseTsharkLine(
    '1710000000\t10.103.56.132\t\t8.8.8.8\t\t\t\t53000\t53\tDNS\teth:ip:udp:dns\t90\t\tGenerated (Sent Out)',
    {
      source: 'live',
      localAddresses: new Set(['10.103.56.132']),
      interfaceName: 'Wi-Fi',
      firstTimestamp: 1710000000,
    },
  )

  assert.equal(packet.srcPort, 53000)
  assert.equal(packet.dstPort, 53)
  assert.equal(packet.vehicleType, 'dns')
  assert.equal(packet.isError, false)
})
