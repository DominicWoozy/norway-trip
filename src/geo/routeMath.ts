export type Coordinate = [number, number]

export type PathSample = {
  position: Coordinate
  bearing: number
  travelled: Coordinate[]
}

const EARTH_RADIUS_KM = 6371

const toRadians = (value: number) => value * Math.PI / 180
const toDegrees = (value: number) => value * 180 / Math.PI

export const haversineDistance = (from: Coordinate, to: Coordinate) => {
  const latitudeDelta = toRadians(to[1] - from[1])
  const longitudeDelta = toRadians(to[0] - from[0])
  const latitude1 = toRadians(from[1])
  const latitude2 = toRadians(to[1])
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(longitudeDelta / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(value))
}

export const bearingBetween = (from: Coordinate, to: Coordinate) => {
  const longitudeDelta = toRadians(to[0] - from[0])
  const latitude1 = toRadians(from[1])
  const latitude2 = toRadians(to[1])
  const y = Math.sin(longitudeDelta) * Math.cos(latitude2)
  const x =
    Math.cos(latitude1) * Math.sin(latitude2) -
    Math.sin(latitude1) * Math.cos(latitude2) * Math.cos(longitudeDelta)
  return (toDegrees(Math.atan2(y, x)) + 360) % 360
}

export const greatCircle = (from: Coordinate, to: Coordinate, steps = 48): Coordinate[] => {
  const latitude1 = toRadians(from[1])
  const longitude1 = toRadians(from[0])
  const latitude2 = toRadians(to[1])
  const longitude2 = toRadians(to[0])
  const angularDistance = haversineDistance(from, to) / EARTH_RADIUS_KM

  if (angularDistance < 0.000001) return [from, to]

  return Array.from({ length: steps + 1 }, (_, index) => {
    const progress = index / steps
    const a = Math.sin((1 - progress) * angularDistance) / Math.sin(angularDistance)
    const b = Math.sin(progress * angularDistance) / Math.sin(angularDistance)
    const x =
      a * Math.cos(latitude1) * Math.cos(longitude1) +
      b * Math.cos(latitude2) * Math.cos(longitude2)
    const y =
      a * Math.cos(latitude1) * Math.sin(longitude1) +
      b * Math.cos(latitude2) * Math.sin(longitude2)
    const z = a * Math.sin(latitude1) + b * Math.sin(latitude2)
    return [toDegrees(Math.atan2(y, x)), toDegrees(Math.atan2(z, Math.hypot(x, y)))]
  })
}

export const samplePath = (path: Coordinate[], progress: number): PathSample => {
  if (path.length < 2) {
    const position = path[0] ?? [0, 0]
    return { position, bearing: 0, travelled: [position] }
  }

  const lengths = path.slice(0, -1).map((point, index) => haversineDistance(point, path[index + 1]))
  const total = lengths.reduce((sum, length) => sum + length, 0)
  let remaining = total * Math.min(Math.max(progress, 0), 1)

  for (let index = 0; index < lengths.length; index += 1) {
    const segmentLength = lengths[index]
    if (remaining <= segmentLength || index === lengths.length - 1) {
      const localProgress = segmentLength === 0 ? 1 : Math.min(remaining / segmentLength, 1)
      const from = path[index]
      const to = path[index + 1]
      const position: Coordinate = [
        from[0] + (to[0] - from[0]) * localProgress,
        from[1] + (to[1] - from[1]) * localProgress,
      ]
      return {
        position,
        bearing: bearingBetween(from, to),
        travelled: [...path.slice(0, index + 1), position],
      }
    }
    remaining -= segmentLength
  }

  return {
    position: path.at(-1)!,
    bearing: bearingBetween(path.at(-2)!, path.at(-1)!),
    travelled: path,
  }
}

