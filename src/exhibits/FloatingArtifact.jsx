import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Edges } from "@react-three/drei"
import { DoubleSide } from "three"
import SelectionHull from "./SelectionHull.jsx"
import useFloat from "../hooks/useFloat.js"
import { hashString, mulberry32 } from "../utils/random.js"

// B?ng màu s?c phong phú cho t?ng hình d?ng (c?m h?ng lo-poly tri?t h?c)
const PALETTES = [
  { main: "#E84393", emissive: "#FF69B4", edge: "#FFB3D9" },
  { main: "#4FD1C5", emissive: "#00E5FF", edge: "#B2EBF2" },
  { main: "#F59E0B", emissive: "#FFCA28", edge: "#FFF9C4" },
  { main: "#7C3AED", emissive: "#9B59B6", edge: "#E1BEE7" },
  { main: "#10B981", emissive: "#00E676", edge: "#B2DFDB" },
  { main: "#EF4444", emissive: "#FF5252", edge: "#FFCDD2" },
  { main: "#F97316", emissive: "#FF6D00", edge: "#FFE0B2" },
  { main: "#06B6D4", emissive: "#00B0FF", edge: "#E1F5FE" },
]

function IcoSphere({ hovered, palette }) {
  return (
    <group>
      <mesh castShadow>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.9 : 0.35} flatShading />
        <Edges threshold={10} color={palette.edge} />
        {hovered && <SelectionHull scale={1.16}><icosahedronGeometry args={[0.45, 1]} /></SelectionHull>}
      </mesh>
    </group>
  )
}

function Tetrahedron({ hovered, palette }) {
  return (
    <group>
      <mesh castShadow>
        <tetrahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 1 : 0.4} flatShading />
        <Edges threshold={5} color={palette.edge} />
        {hovered && <SelectionHull scale={1.18}><tetrahedronGeometry args={[0.5, 0]} /></SelectionHull>}
      </mesh>
    </group>
  )
}

function OctaShape({ hovered, palette }) {
  return (
    <group>
      <mesh castShadow>
        <octahedronGeometry args={[0.48, 0]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 1.1 : 0.45} flatShading />
        <Edges threshold={5} color={palette.edge} />
        {hovered && <SelectionHull scale={1.18}><octahedronGeometry args={[0.48, 0]} /></SelectionHull>}
      </mesh>
    </group>
  )
}

function DodecaShape({ hovered, palette }) {
  return (
    <group>
      <mesh castShadow>
        <dodecahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.8 : 0.3} transparent opacity={0.78} side={DoubleSide} flatShading />
        <Edges threshold={5} color={palette.edge} />
        {hovered && <SelectionHull scale={1.16}><dodecahedronGeometry args={[0.42, 0]} /></SelectionHull>}
      </mesh>
    </group>
  )
}

function TorusShape({ hovered, palette }) {
  const ref = useRef()
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.x += delta * 0.8 })
  return (
    <group ref={ref}>
      <mesh castShadow>
        <torusGeometry args={[0.3, 0.13, 6, 10]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 1.2 : 0.5} flatShading />
        <Edges threshold={10} color={palette.edge} />
        {hovered && <SelectionHull scale={1.2}><torusGeometry args={[0.3, 0.13, 6, 10]} /></SelectionHull>}
      </mesh>
    </group>
  )
}

function SpinCube({ hovered, palette }) {
  const ref = useRef()
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.z += delta * 0.5 })
  return (
    <group ref={ref}>
      <mesh castShadow>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.9 : 0.3} flatShading />
        <Edges threshold={5} color={palette.edge} />
        {hovered && <SelectionHull args={[0.55, 0.55, 0.55]} grow={0.08} />}
      </mesh>
    </group>
  )
}

function ConeOrb({ hovered, palette }) {
  const coreRef = useRef()
  useFrame(({ clock }) => {
    if (coreRef.current) coreRef.current.scale.setScalar(0.9 + Math.sin(clock.elapsedTime * 4) * 0.15)
  })
  return (
    <group>
      <mesh castShadow>
        <coneGeometry args={[0.38, 0.72, 6, 1]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 0.7 : 0.25} flatShading transparent opacity={0.82} />
        <Edges threshold={10} color={palette.edge} />
        {hovered && <SelectionHull scale={1.18}><coneGeometry args={[0.38, 0.72, 6, 1]} /></SelectionHull>}
      </mesh>
      <mesh ref={coreRef} position-y={0.1}>
        <sphereGeometry args={[0.12, 6, 5]} />
        <meshStandardMaterial color={palette.edge} emissive={palette.edge} toneMapped={false} emissiveIntensity={hovered ? 3 : 1.5} />
      </mesh>
    </group>
  )
}

function StarBurst({ hovered, palette }) {
  const ref2 = useRef()
  useFrame((_, delta) => { if (ref2.current) ref2.current.rotation.y += delta * 1.1 })
  return (
    <group>
      <mesh castShadow>
        <octahedronGeometry args={[0.46, 0]} />
        <meshStandardMaterial color={palette.main} emissive={palette.emissive} emissiveIntensity={hovered ? 1 : 0.4} flatShading transparent opacity={0.75} />
        <Edges threshold={5} color={palette.edge} />
      </mesh>
      <group ref={ref2} rotation-x={Math.PI / 4}>
        <mesh>
          <octahedronGeometry args={[0.46, 0]} />
          <meshStandardMaterial color={palette.edge} emissive={palette.edge} emissiveIntensity={hovered ? 0.6 : 0.2} flatShading transparent opacity={0.45} />
        </mesh>
      </group>
      {hovered && <SelectionHull scale={1.2}><octahedronGeometry args={[0.46, 0]} /></SelectionHull>}
    </group>
  )
}

const SHAPES = [IcoSphere, Tetrahedron, OctaShape, DodecaShape, TorusShape, SpinCube, ConeOrb, StarBurst]

// Vat pham lo lung random dua tren id — luon nhat quan moi lan load, da dang hinh/mau.
export default function FloatingArtifact({ hovered, accent, artifactSeed, ...pointerHandlers }) {
  const ref = useFloat(hovered)

  const { Shape, palette } = useMemo(() => {
    const rng = mulberry32(artifactSeed ?? hashString("artifact"))
    const shapeIdx = Math.floor(rng() * SHAPES.length)
    const paletteIdx = Math.floor(rng() * PALETTES.length)
    return { Shape: SHAPES[shapeIdx], palette: PALETTES[paletteIdx] }
  }, [artifactSeed])

  return (
    <group ref={ref} {...pointerHandlers}>
      <Shape hovered={hovered} palette={palette} />
    </group>
  )
}
