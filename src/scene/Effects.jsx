import { EffectComposer, Bloom } from '@react-three/postprocessing'

// Ngưỡng 1: chỉ vật liệu có toneMapped={false} và emissive > 1 mới phát sáng,
// sàn/tường sáng màu không bị loá.
export default function Effects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur luminanceThreshold={1} intensity={1.2} radius={0.7} />
    </EffectComposer>
  )
}
