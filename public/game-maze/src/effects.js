import * as THREE from 'three';
import { CONFIG } from './config.js';

/**
 * Effects: EffectComposer với UnrealBloomPass, vignette nhẹ và color grading teal.
 * Bloom threshold cao (0.9) → chỉ emissive thật sáng mới bloom, tránh mờ màn hình.
 */
export function createEffects(renderer, scene, camera) {
  // Lazy-import để tương thích importmap
  let composer = null;
  let bloomPass = null;
  let colorGradePass = null;
  let initialized = false;

  const width = window.innerWidth;
  const height = window.innerHeight;

  // Khởi tạo đồng bộ bằng dynamic import từ importmap
  async function init() {
    const { EffectComposer } = await import('three/addons/postprocessing/EffectComposer.js');
    const { RenderPass } = await import('three/addons/postprocessing/RenderPass.js');
    const { UnrealBloomPass } = await import('three/addons/postprocessing/UnrealBloomPass.js');
    const { ShaderPass } = await import('three/addons/postprocessing/ShaderPass.js');

    const renderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType
    });

    composer = new EffectComposer(renderer, renderTarget);
    composer.addPass(new RenderPass(scene, camera));

    // Bloom tuned: threshold 0.90 để chỉ emissive mạnh mới bloom
    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      CONFIG.bloom.strength,   // 0.6
      CONFIG.bloom.radius,     // 0.5
      CONFIG.bloom.threshold   // 0.90
    );
    composer.addPass(bloomPass);

    // Vignette nhẹ + color grading teal
    const ColorGradingShader = {
      uniforms: {
        tDiffuse:         { value: null },
        vignetteDarkness: { value: CONFIG.colorGrading.vignetteDarkness },  // 0.6
        vignetteOffset:   { value: CONFIG.colorGrading.vignetteOffset },    // 1.0
        tealTint:         { value: new THREE.Color(CONFIG.colorGrading.tealShadowTint) },
        exposure:         { value: 1.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float vignetteDarkness;
        uniform float vignetteOffset;
        uniform vec3 tealTint;
        uniform float exposure;
        varying vec2 vUv;

        void main() {
          vec4 texel = texture2D(tDiffuse, vUv);
          vec3 color = texel.rgb * exposure;

          // Teal shadow tint nhẹ vào vùng tối
          float lum = dot(color, vec3(0.299, 0.587, 0.114));
          color += tealTint * (1.0 - lum) * 0.20;

          // Vignette: nhẹ hơn trước (vignetteDarkness 0.6 thay vì 0.95)
          vec2 uv2 = (vUv - vec2(0.5)) * vec2(vignetteOffset);
          float dist = dot(uv2, uv2);
          float vig = 1.0 - dist * vignetteDarkness;
          vig = clamp(vig, 0.0, 1.0);
          color *= vig;

          gl_FragColor = vec4(color, texel.a);
        }
      `
    };

    colorGradePass = new ShaderPass(ColorGradingShader);
    composer.addPass(colorGradePass);

    initialized = true;
  }

  // Khởi tạo ngay
  const initPromise = init();

  function setSize(w, h) {
    if (!composer) return;
    composer.setSize(w, h);
    if (bloomPass) bloomPass.resolution.set(w, h);
  }

  return {
    get composer() { return composer; },
    get bloomPass() { return bloomPass; },
    get colorGradePass() { return colorGradePass; },
    setSize,
    render: () => {
      if (composer && initialized) {
        composer.render();
      } else {
        // Fallback: render thường khi composer chưa sẵn
        renderer.clear();
        renderer.render(scene, camera);
      }
    }
  };
}
