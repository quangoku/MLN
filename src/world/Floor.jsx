import { useMemo } from 'react'
import { floorTexture } from './textures.js'

export default function Floor({ kind, x, width, depth }) {
  const texture = useMemo(() => floorTexture(kind, width, depth), [kind, width, depth])

  return (
    <mesh position={[x, 0, 0]} rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}
