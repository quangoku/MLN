import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import { FLOAT } from '../config/constants.js'

// Nhấp nhô theo sin + xoay chậm quanh trục Y; tăng tốc mượt khi hover
export default function useFloat(hovered, baseY = FLOAT.height) {
  const ref = useRef()
  const spin = useRef(FLOAT.spinSpeed)

  useFrame((state, delta) => {
    const obj = ref.current
    if (!obj) return

    const target = hovered ? FLOAT.hoverSpinSpeed : FLOAT.spinSpeed
    spin.current = MathUtils.damp(spin.current, target, 6, delta)

    obj.rotation.y += spin.current * delta
    obj.position.y = baseY + Math.sin(state.clock.elapsedTime * FLOAT.bobSpeed) * FLOAT.amplitude
  })

  return ref
}
