import SelectionHull from './SelectionHull.jsx'
import { PEDESTAL } from '../config/constants.js'
import { COLORS } from '../config/theme.js'

const TRIM = 0.12

// Bục trưng bày. Biển nhỏ phía trước chuyển sang màu vàng khi hiện vật đã được khám phá.
export default function Pedestal({ highlighted = false, discovered = false }) {
  const { size, height } = PEDESTAL
  const bodyHeight = height - TRIM

  return (
    <group>
      <mesh position-y={bodyHeight / 2} castShadow receiveShadow>
        <boxGeometry args={[size, bodyHeight, size]} />
        <meshStandardMaterial color={COLORS.pedestalBody} />
        {highlighted && <SelectionHull args={[size, bodyHeight, size]} />}
      </mesh>
      <mesh position-y={bodyHeight + TRIM / 2} castShadow receiveShadow>
        <boxGeometry args={[size + 0.16, TRIM, size + 0.16]} />
        <meshStandardMaterial color={COLORS.pedestalTrim} />
      </mesh>
      <mesh position-y={height + 0.01} receiveShadow>
        <boxGeometry args={[size - 0.1, 0.02, size - 0.1]} />
        <meshStandardMaterial color={COLORS.pedestalTop} />
      </mesh>
      <mesh position={[0, bodyHeight * 0.6, size / 2 + 0.01]}>
        <boxGeometry args={[0.5, 0.18, 0.02]} />
        <meshStandardMaterial
          color={discovered ? COLORS.plaqueDone : COLORS.plaque}
          emissive={discovered ? COLORS.plaqueDone : '#000000'}
          emissiveIntensity={discovered ? 0.4 : 0}
        />
      </mesh>
    </group>
  )
}
