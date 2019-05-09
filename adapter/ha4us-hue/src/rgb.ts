import * as tinycolor from 'tinycolor2'
export type TColorGamut = [
  [number, number],
  [number, number],
  [number, number]
]
export type TXy = [number, number]

const GAMUT_A: TColorGamut = [[0.703, 0.296], [0.214, 0.709], [0.139, 0.081]]
const GAMUT_B: TColorGamut = [[0.674, 0.322], [0.408, 0.517], [0.168, 0.041]]
const GAMUT_C: TColorGamut = [[0.692, 0.308], [0.17, 0.7], [0.153, 0.048]]
const GAMUT_DEFAULT: TColorGamut = [[1.0, 0.0], [0.0, 1.0], [0.0, 0.0]]
export const MODEL_GAMUTS = {
  LLC001: GAMUT_A,
  LLC005: GAMUT_A,
  LLC006: GAMUT_A,
  LLC007: GAMUT_A,
  LLC010: GAMUT_A,
  LLC011: GAMUT_A,
  LLC012: GAMUT_A,
  LLC014: GAMUT_A,
  LLC013: GAMUT_A,
  LST001: GAMUT_A,
  LCT001: GAMUT_B,
  LCT002: GAMUT_B,
  LCT003: GAMUT_B,
  LCT004: GAMUT_B,
  LLM001: GAMUT_B,
  LCT005: GAMUT_B,
  LCT006: GAMUT_B,
  LCT007: GAMUT_B,
  LCT010: GAMUT_C,
  LCT011: GAMUT_C,
  LCT012: GAMUT_C,
  LCT014: GAMUT_C,
  LCT015: GAMUT_C,
  LCT016: GAMUT_C,
  LLC020: GAMUT_C,
  LST002: GAMUT_C,
  // 'HBL001', 'HBL002', 'HBL003', 'HIL001', 'HIL002', 'HEL001', 'HEL002' -> all default
}

class XY {
  public x: number
  public y: number
  constructor(xy: TXy) {
    this.x = xy[0]
    this.y = xy[1]
  }
}

class HueLimit {
  public red: XY
  public green: XY
  public blue: XY

  constructor(gamut: TColorGamut) {
    this.red = new XY(gamut[0])
    this.green = new XY(gamut[1])
    this.blue = new XY(gamut[2])
  }
}

function _crossProduct(p1: XY, p2: XY): number {
  return p1.x * p2.y - p1.y * p2.x
}

function _isInColorGamut(p: XY, lampLimits): boolean {
  const v1 = new XY([
    lampLimits.green.x - lampLimits.red.x,
    lampLimits.green.y - lampLimits.red.y,
  ])
  const v2 = new XY([
    lampLimits.blue.x - lampLimits.red.x,
    lampLimits.blue.y - lampLimits.red.y,
  ])
  const q = new XY([p.x - lampLimits.red.x, p.y - lampLimits.red.y])
  const s = _crossProduct(q, v2) / _crossProduct(v1, v2)
  const t = _crossProduct(v1, q) / _crossProduct(v1, v2)

  return s >= 0.0 && t >= 0.0 && s + t <= 1.0
}

/**
 * Find the closest point on a line. This point will be reproducible by the limits.
 *
 * @param start  The point where the line starts.
 * @param stop The point where the line ends.
 * @param point The point which is close to the line.
 * @return A point that is on the line specified, and closest to the XY provided.
 */
function _getClosestPoint(start: XY, stop: XY, point: XY): XY {
  const AP = new XY([point.x - start.x, point.y - start.y])
  const AB = new XY([stop.x - start.x, stop.y - start.y])
  const ab2 = AB.x * AB.x + AB.y * AB.y
  const apAb = AP.x * AB.x + AP.y * AB.y
  let t = apAb / ab2

  if (t < 0.0) {
    t = 0.0
  } else if (t > 1.0) {
    t = 1.0
  }

  return new XY([start.x + AB.x * t, start.y + AB.y * t])
}

function _getDistanceBetweenPoints(pOne, pTwo): number {
  const dx = pOne.x - pTwo.x
  const dy = pOne.y - pTwo.y

  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * When a color is outside the limits, find the closest point on each line in the CIE 1931 'triangle'.
 * @param  point  The point that is outside the limits
 * @param  limits The limits of the bulb (red, green and blue XY points).
 * @return        [description]
 */
function _resolveXYPointForLamp(point, limits) {
  const pAB = _getClosestPoint(limits.red, limits.green, point)
  const pAC = _getClosestPoint(limits.blue, limits.red, point)
  const pBC = _getClosestPoint(limits.green, limits.blue, point)
  const dAB = _getDistanceBetweenPoints(point, pAB)
  const dAC = _getDistanceBetweenPoints(point, pAC)
  const dBC = _getDistanceBetweenPoints(point, pBC)
  let lowest = dAB
  let closestPoint = pAB

  if (dAC < lowest) {
    lowest = dAC
    closestPoint = pAC
  }

  if (dBC < lowest) {
    closestPoint = pBC
  }

  return closestPoint
}

function gammaCorrection(value) {
  return value > 0.04045
    ? Math.pow((value + 0.055) / (1.0 + 0.055), 2.4)
    : value / 12.92
}

export class XY2RGBConverter {
  protected limit: HueLimit

  constructor(colorgamut: TColorGamut) {
    this.limit = new HueLimit(colorgamut)
  }

  public toRGB(xy: TXy, brightness: number): string {
    let point = new XY(xy)
    // 4th - 2: check for model gamut
    if (!_isInColorGamut(point, this.limit)) {
      point = _resolveXYPointForLamp(xy, this.limit)
    }

    const z = 1 - point.x - point.y

    const Y = brightness
    const X = (Y / point.y) * point.x
    const Z = (Y / point.y) * z

    // Convert to RGB using Wide RGB D65 conversion
    let rgb = [
      X * 1.656492 - Y * 0.354851 - Z * 0.255038,
      -X * 0.707196 + Y * 1.655397 + Z * 0.036152,
      X * 0.051713 - Y * 0.121364 + Z * 1.01153,
    ]

    // Apply reverse gamma correction.
    rgb = rgb.map(_x => {
      return _x <= 0.0031308
        ? 12.92 * _x
        : (1.0 + 0.055) * Math.pow(_x, 1.0 / 2.4) - 0.055
    })

    // Bring all negative components to zero.
    rgb = rgb.map(_x => {
      return Math.max(0, _x)
    })

    // If one component is greater than 1, weight components by that value.
    const max = Math.max(rgb[0], rgb[1], rgb[2])
    if (max > 1) {
      rgb = rgb.map(_x => {
        return _x / max
      })
    }

    rgb = rgb.map(_x => {
      return Math.floor(_x * 255)
    })

    const [r, g, b] = rgb

    return tinycolor({ r, g, b }).toHexString()
  }

  public toXY(rgbColor: string): TXy {
    let { r, g, b } = tinycolor(rgbColor).toRgb()

    // 1st + 2nd : Normalize a scale 1 + apply Gamma Correction
    r = gammaCorrection(r / 255)
    g = gammaCorrection(g / 255)
    b = gammaCorrection(b / 255)

    // 3rd: Wide RGB D65
    const X = r * 0.4360747 + g * 0.3850649 + b * 0.0930804
    const Y = r * 0.2225045 + g * 0.7168786 + b * 0.0406169
    const Z = r * 0.0139322 + g * 0.0971045 + b * 0.7141733

    // 4th: calculate xy
    let cx = X / (X + Y + Z)
    let cy = Y / (X + Y + Z)

    cx = isNaN(cx) ? 0.0 : cx
    cy = isNaN(cy) ? 0.0 : cy

    let xyPoint = new XY([cx, cy])

    // 4th - 2: check for model gamut
    if (!_isInColorGamut(xyPoint, this.limit)) {
      xyPoint = _resolveXYPointForLamp(xyPoint, this.limit)
    }

    return [xyPoint.x, xyPoint.y]
  }
}
