export interface Specs {
  minCylinders?: number | null
  maxCylinders?: number | null
  minPower?: number | null
  maxPower?: number | null
  vehicleTypes?: string[]
  fuelTypes?: string[]
}

export function calcSpecificity(specs: Specs | null | undefined): number {
  if (!specs) return 0
  let score = 0

  // vehicleTypes: 1 type = 3pts, 4 types = 0pts
  if (specs.vehicleTypes?.length) score += 4 - specs.vehicleTypes.length

  // fuelTypes: 1 type = 1pt, 2 types = 0pts
  if (specs.fuelTypes?.length) score += 2 - specs.fuelTypes.length

  score += rangeScore(specs.minCylinders, specs.maxCylinders)
  score += rangeScore(specs.minPower, specs.maxPower)

  return score
}

function rangeScore(min: number | null | undefined, max: number | null | undefined): number {
  if (min != null && max != null) {
    const width = Math.max(max - min, 0) + 1
    return 10 / width
  }
  if (min != null || max != null) return 1
  return 0
}
