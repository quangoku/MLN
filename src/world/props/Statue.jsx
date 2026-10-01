import { useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { COLORS } from '../../config/theme.js'

// Hàm tạo texture bảng tên đồng khắc chữ vàng
function makePlaqueTexture(text) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#261C14'
  ctx.fillRect(0, 0, 256, 64)

  ctx.strokeStyle = '#C9A043'
  ctx.lineWidth = 4
  ctx.strokeRect(4, 4, 248, 56)

  ctx.fillStyle = '#F4E8C1'
  ctx.font = 'bold 22px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 128, 33)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

// 1. Tượng toàn thân V.I. Lênin đứng trên bệ, tay phải chỉ về phía trước (đặc trưng tượng đài Lênin)
function LeninStatue({ name = 'V.I. Lenin' }) {
  const plaqueTex = useMemo(() => makePlaqueTexture(name), [name])
  const stoneColor = '#DDD5C4'
  const coatColor = '#CFC6B4'

  return (
    <group>
      {/* Bệ đá nhiều tầng vững chãi */}
      <mesh position-y={0.12} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.24, 1.4]} />
        <meshStandardMaterial color="#2B2D33" />
      </mesh>
      <mesh position-y={0.55} castShadow receiveShadow>
        <boxGeometry args={[1.25, 0.65, 1.15]} />
        <meshStandardMaterial color="#3D4048" />
      </mesh>
      <mesh position-y={0.9} castShadow receiveShadow>
        <boxGeometry args={[1.35, 0.08, 1.25]} />
        <meshStandardMaterial color="#2B2D33" />
      </mesh>

      {/* Bảng tên V.I. Lenin mặt trước */}
      <mesh position={[0, 0.55, 0.585]}>
        <planeGeometry args={[0.7, 0.22]} />
        <meshStandardMaterial map={plaqueTex} roughness={0.4} />
      </mesh>

      {/* Tượng Lênin */}
      <group position-y={0.94}>
        {/* Đôi giày */}
        <mesh position={[-0.14, 0.06, 0.04]} castShadow>
          <boxGeometry args={[0.16, 0.12, 0.32]} />
          <meshStandardMaterial color="#38332E" />
        </mesh>
        <mesh position={[0.14, 0.06, 0.02]} castShadow>
          <boxGeometry args={[0.16, 0.12, 0.32]} />
          <meshStandardMaterial color="#38332E" />
        </mesh>

        {/* Chân / Quần âu */}
        <mesh position={[-0.14, 0.42, 0.02]} castShadow>
          <boxGeometry args={[0.18, 0.62, 0.22]} />
          <meshStandardMaterial color={coatColor} />
        </mesh>
        <mesh position={[0.14, 0.42, 0.01]} castShadow>
          <boxGeometry args={[0.18, 0.62, 0.22]} />
          <meshStandardMaterial color={coatColor} />
        </mesh>

        {/* Áo măng tô dài qua đầu gối */}
        <mesh position={[0, 0.58, 0.01]} castShadow>
          <boxGeometry args={[0.54, 0.48, 0.36]} />
          <meshStandardMaterial color={coatColor} />
        </mesh>

        {/* Thân trên / Áo vest */}
        <mesh position={[0, 0.98, 0.02]} castShadow>
          <boxGeometry args={[0.58, 0.52, 0.36]} />
          <meshStandardMaterial color={coatColor} />
        </mesh>

        {/* Cổ áo & cà vạt */}
        <mesh position={[0, 1.22, 0.16]} castShadow>
          <boxGeometry args={[0.14, 0.14, 0.1]} />
          <meshStandardMaterial color="#8C2F39" />
        </mesh>

        {/* Cổ & Đầu */}
        <mesh position={[0, 1.34, 0.02]} castShadow>
          <cylinderGeometry args={[0.1, 0.11, 0.14, 8]} />
          <meshStandardMaterial color={stoneColor} />
        </mesh>
        <mesh position={[0, 1.52, 0.03]} castShadow>
          <boxGeometry args={[0.26, 0.28, 0.28]} />
          <meshStandardMaterial color={stoneColor} />
        </mesh>
        {/* Vòm trán & ria mép / chòm râu dê đặc trưng của Lênin */}
        <mesh position={[0, 1.44, 0.17]} castShadow>
          <boxGeometry args={[0.14, 0.12, 0.06]} />
          <meshStandardMaterial color={stoneColor} />
        </mesh>

        {/* Tay trái: buông tự nhiên cạnh vạt áo / bỏ túi */}
        <group position={[-0.34, 1.0, 0.02]}>
          <mesh position={[0, -0.22, 0]} rotation-z={0.08} castShadow>
            <boxGeometry args={[0.14, 0.46, 0.16]} />
            <meshStandardMaterial color={coatColor} />
          </mesh>
          <mesh position={[0.02, -0.46, 0]} castShadow>
            <boxGeometry args={[0.1, 0.12, 0.12]} />
            <meshStandardMaterial color={stoneColor} />
          </mesh>
        </group>

        {/* Tay phải: GIƠ CAO VÀ CHỈ VỀ PHÍA TRƯỚC (hướng tương lai) */}
        <group position={[0.34, 1.15, 0.08]} rotation-x={-Math.PI / 4.5} rotation-y={-0.15}>
          {/* Cánh tay trên */}
          <mesh position={[0.08, 0.18, 0.22]} rotation-x={0.4} castShadow>
            <boxGeometry args={[0.14, 0.14, 0.42]} />
            <meshStandardMaterial color={coatColor} />
          </mesh>
          {/* Cẳng tay vươn thẳng */}
          <mesh position={[0.12, 0.32, 0.54]} rotation-x={0.2} castShadow>
            <boxGeometry args={[0.12, 0.12, 0.44]} />
            <meshStandardMaterial color={coatColor} />
          </mesh>
          {/* Bàn tay chỉ ngón trỏ */}
          <mesh position={[0.14, 0.4, 0.8]} castShadow>
            <boxGeometry args={[0.08, 0.08, 0.18]} />
            <meshStandardMaterial color={stoneColor} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

// 2. Tượng bán thân Karl Marx với chòm râu dày vĩ đại
function MarxBustStatue({ name = 'Karl Marx' }) {
  const plaqueTex = useMemo(() => makePlaqueTexture(name), [name])
  const stoneColor = '#DDD5C4'

  return (
    <group>
      {/* Bệ đá cao */}
      <mesh position-y={0.12} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.24, 1.3]} />
        <meshStandardMaterial color="#2E3035" />
      </mesh>
      <mesh position-y={0.65} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.85, 0.95]} />
        <meshStandardMaterial color="#444750" />
      </mesh>
      <mesh position-y={1.12} castShadow receiveShadow>
        <boxGeometry args={[1.05, 0.1, 1.05]} />
        <meshStandardMaterial color="#2E3035" />
      </mesh>

      {/* Bảng tên */}
      <mesh position={[0, 0.65, 0.485]}>
        <planeGeometry args={[0.65, 0.2]} />
        <meshStandardMaterial map={plaqueTex} />
      </mesh>

      {/* Tượng bán thân Marx */}
      <group position-y={1.18}>
        {/* Khối vai áo */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.82, 0.45, 0.46]} />
          <meshStandardMaterial color={stoneColor} />
        </mesh>
        {/* Cổ áo & ngực */}
        <mesh position={[0, 0.42, 0.08]} castShadow>
          <boxGeometry args={[0.3, 0.2, 0.2]} />
          <meshStandardMaterial color={stoneColor} />
        </mesh>
        {/* Đầu & mái tóc dày rậm */}
        <mesh position={[0, 0.66, 0.02]} castShadow>
          <boxGeometry args={[0.42, 0.38, 0.38]} />
          <meshStandardMaterial color={stoneColor} />
        </mesh>
        {/* Chòm râu quai nón vĩ đại của Marx */}
        <mesh position={[0, 0.52, 0.16]} castShadow>
          <boxGeometry args={[0.38, 0.32, 0.22]} />
          <meshStandardMaterial color={stoneColor} />
        </mesh>
        <mesh position={[0, 0.38, 0.14]} castShadow>
          <boxGeometry args={[0.32, 0.18, 0.18]} />
          <meshStandardMaterial color={stoneColor} />
        </mesh>
      </group>
    </group>
  )
}

// 3. Tượng Người suy tưởng (The Thinker) ngồi trầm ngâm
function ThinkerStatue({ name = 'Người suy tưởng' }) {
  const plaqueTex = useMemo(() => makePlaqueTexture(name), [name])
  const stoneColor = '#DDD5C4'

  return (
    <group>
      {/* Bệ đá */}
      <mesh position-y={0.12} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.24, 1.3]} />
        <meshStandardMaterial color="#2E3035" />
      </mesh>
      <mesh position-y={0.5} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.55, 1.1]} />
        <meshStandardMaterial color="#40434C" />
      </mesh>
      <mesh position-y={0.8} castShadow receiveShadow>
        <boxGeometry args={[1.18, 0.08, 1.18]} />
        <meshStandardMaterial color="#2E3035" />
      </mesh>

      <mesh position={[0, 0.5, 0.56]}>
        <planeGeometry args={[0.65, 0.2]} />
        <meshStandardMaterial map={plaqueTex} />
      </mesh>

      {/* Khối đá ngồi */}
      <mesh position={[0, 1.1, -0.05]} castShadow>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshStandardMaterial color="#94929D" />
      </mesh>

      {/* Dáng ngồi suy tưởng */}
      <group position={[0, 1.35, 0]}>
        {/* Đùi gập */}
        <mesh position={[-0.14, 0.05, 0.2]} rotation-x={0.4} castShadow>
          <boxGeometry args={[0.14, 0.18, 0.42]} />
          <meshStandardMaterial color={stoneColor} />
        </mesh>
        <mesh position={[0.14, 0.05, 0.2]} rotation-x={0.4} castShadow>
          <boxGeometry args={[0.14, 0.18, 0.42]} />
          <meshStandardMaterial color={stoneColor} />
        </mesh>
        {/* Cẳng chân hạ xuống */}
        <mesh position={[-0.14, -0.22, 0.36]} castShadow>
          <boxGeometry args={[0.13, 0.42, 0.16]} />
          <meshStandardMaterial color={stoneColor} />
        </mesh>
        <mesh position={[0.14, -0.22, 0.36]} castShadow>
          <boxGeometry args={[0.13, 0.42, 0.16]} />
          <meshStandardMaterial color={stoneColor} />
        </mesh>
        {/* Thân nghiêng về phía trước */}
        <mesh position={[0, 0.32, 0.08]} rotation-x={0.35} castShadow>
          <boxGeometry args={[0.38, 0.48, 0.28]} />
          <meshStandardMaterial color={stoneColor} />
        </mesh>
        {/* Đầu cúi xuống, tì cằm lên tay */}
        <mesh position={[0, 0.58, 0.24]} rotation-x={0.45} castShadow>
          <boxGeometry args={[0.22, 0.24, 0.24]} />
          <meshStandardMaterial color={stoneColor} />
        </mesh>
        {/* Cánh tay chống cằm */}
        <mesh position={[0.1, 0.38, 0.26]} rotation-z={-0.3} rotation-x={0.6} castShadow>
          <boxGeometry args={[0.1, 0.38, 0.1]} />
          <meshStandardMaterial color={stoneColor} />
        </mesh>
      </group>
    </group>
  )
}

// 4. Tượng đài Obelisk (Tháp bút triết học)
function ObeliskStatue({ name = 'Đài tưởng niệm' }) {
  const plaqueTex = useMemo(() => makePlaqueTexture(name), [name])

  return (
    <group>
      {/* Bệ tam cấp */}
      <mesh position-y={0.12} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.24, 1.5]} />
        <meshStandardMaterial color="#2E3035" />
      </mesh>
      <mesh position-y={0.42} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.38, 1.2]} />
        <meshStandardMaterial color="#424650" />
      </mesh>
      <mesh position-y={0.65} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.12, 1.0]} />
        <meshStandardMaterial color="#2E3035" />
      </mesh>

      <mesh position={[0, 0.42, 0.61]}>
        <planeGeometry args={[0.65, 0.2]} />
        <meshStandardMaterial map={plaqueTex} />
      </mesh>

      {/* Tháp nhọn 4 cạnh thuôn dần lên cao */}
      <mesh position-y={2.2} castShadow>
        <cylinderGeometry args={[0.2, 0.42, 3.0, 4]} />
        <meshStandardMaterial color="#DDD5C4" />
      </mesh>
      {/* Đỉnh chóp nhọn pyramidion */}
      <mesh position-y={3.85} castShadow>
        <coneGeometry args={[0.2, 0.35, 4]} />
        <meshStandardMaterial color={COLORS.gold} metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}

// 5. Tượng nhà hiền triết Hy Lạp / Cổ điển đứng khoác áo choàng
function StandingStatue({ name = 'Nhà hiền triết' }) {
  const plaqueTex = useMemo(() => makePlaqueTexture(name), [name])
  const stoneColor = '#DDD5C4'

  return (
    <group>
      <mesh position-y={0.12} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.24, 1.2]} />
        <meshStandardMaterial color="#2E3035" />
      </mesh>
      <mesh position-y={0.55} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.65, 0.95]} />
        <meshStandardMaterial color="#3D4048" />
      </mesh>
      <mesh position-y={0.9} castShadow receiveShadow>
        <boxGeometry args={[1.05, 0.08, 1.05]} />
        <meshStandardMaterial color="#2E3035" />
      </mesh>

      <mesh position={[0, 0.55, 0.485]}>
        <planeGeometry args={[0.6, 0.2]} />
        <meshStandardMaterial map={plaqueTex} />
      </mesh>

      <group position-y={0.94}>
        {/* Áo choàng toga dài */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.36, 1.15, 10]} />
          <meshStandardMaterial color={stoneColor} />
        </mesh>
        {/* Thân & nếp vải */}
        <mesh position={[0, 1.25, 0]} castShadow>
          <boxGeometry args={[0.48, 0.45, 0.32]} />
          <meshStandardMaterial color={stoneColor} />
        </mesh>
        {/* Đầu */}
        <mesh position={[0, 1.6, 0.02]} castShadow>
          <boxGeometry args={[0.25, 0.28, 0.25]} />
          <meshStandardMaterial color={stoneColor} />
        </mesh>
        {/* Tay giơ cao cầm cuộn giấy / ngọn đuốc tri thức */}
        <mesh position={[0.3, 1.5, 0.1]} rotation-x={-0.4} rotation-z={-0.3} castShadow>
          <boxGeometry args={[0.1, 0.45, 0.1]} />
          <meshStandardMaterial color={stoneColor} />
        </mesh>
        <mesh position={[0.38, 1.8, 0.22]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.24, 8]} />
          <meshStandardMaterial color={COLORS.gold} />
        </mesh>
      </group>
    </group>
  )
}

// 6. Bia đá cổ / Bia triết học
function SteleStatue({ name = 'Bia đá triết học' }) {
  const plaqueTex = useMemo(() => makePlaqueTexture(name), [name])

  return (
    <group>
      <mesh position-y={0.12} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.24, 1.0]} />
        <meshStandardMaterial color="#2E3035" />
      </mesh>
      <mesh position-y={0.5} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.55, 0.8]} />
        <meshStandardMaterial color="#3D4048" />
      </mesh>
      <mesh position={[0, 0.5, 0.41]}>
        <planeGeometry args={[0.6, 0.18]} />
        <meshStandardMaterial map={plaqueTex} />
      </mesh>
      {/* Tấm bia vòm tròn đỉnh */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[0.7, 0.8, 0.2]} />
        <meshStandardMaterial color="#C5BEAE" />
      </mesh>
      <mesh position={[0, 1.55, 0]} rotation-x={Math.PI / 2} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.2, 16]} />
        <meshStandardMaterial color="#C5BEAE" />
      </mesh>
    </group>
  )
}

export default function Statue({ position, rotation = 0, statueType = 'lenin', name }) {
  return (
    <group position={position} rotation-y={rotation}>
      {statueType === 'lenin' && <LeninStatue name={name ?? 'V.I. Lenin'} />}
      {statueType === 'marx_bust' && <MarxBustStatue name={name ?? 'Karl Marx'} />}
      {statueType === 'seated_thinker' && <ThinkerStatue name={name ?? 'Người suy tưởng'} />}
      {statueType === 'obelisk' && <ObeliskStatue name={name ?? 'Đài tưởng niệm'} />}
      {statueType === 'standing_philosopher' && <StandingStatue name={name ?? 'Nhà hiền triết'} />}
      {statueType === 'bust' && <MarxBustStatue name={name ?? 'Triết gia'} />}
      {statueType === 'stele' && <SteleStatue name={name ?? 'Bia ký triết học'} />}
    </group>
  )
}
