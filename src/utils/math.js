import { MathUtils } from 'three'

// Xoay mượt về góc đích theo đường ngắn nhất
export function dampAngle(current, target, lambda, delta) {
  let diff = (target - current) % (Math.PI * 2)
  if (diff > Math.PI) diff -= Math.PI * 2
  if (diff < -Math.PI) diff += Math.PI * 2
  return current + diff * (1 - Math.exp(-lambda * delta))
}

export const clamp = MathUtils.clamp
