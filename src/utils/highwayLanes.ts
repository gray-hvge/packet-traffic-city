import { CatmullRomCurve3, Vector3 } from 'three'

const Y = 0.34
export const ROAD_START = -32
export const ROAD_END = 32

const lane = (z: number, direction: 1 | -1) => {
  const points = [
    new Vector3(ROAD_START, Y, z),
    new Vector3(-16, Y, z * 0.86),
    new Vector3(0, Y, z * 0.72),
    new Vector3(16, Y, z * 0.86),
    new Vector3(ROAD_END, Y, z),
  ]
  return new CatmullRomCurve3(direction === 1 ? points : points.reverse())
}

export const RX_LANE_Z = [-1, -2.2, -3.4, -4.6, -5.8]
export const TX_LANE_Z = [1, 2.2, 3.4, 4.6, 5.8]

export const RX_LANES = RX_LANE_Z.map((z) => lane(z, 1))
export const TX_LANES = TX_LANE_Z.map((z) => lane(z, -1))
export const RX_SHOULDER = lane(-7.2, 1)
export const TX_SHOULDER = lane(7.2, -1)
export const LANE_COUNT = RX_LANES.length
