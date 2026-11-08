import * as THREE from 'three';
import { CONFIG } from '../config.js';

/**
 * Dense knee-high grass field with wind vertex shader,
 * lush bright green gradient (+40% albedo), cyan rim highlights near portal,
 * and colorful tiny flowers (yellow, purple, pink) scattered in grass.
 */
export function createGrassField(scene) {
  const count = CONFIG.grass.count;
  const hallWidth = 14.5;
  const startZ = -3.4;
  const endZ = 12.0;

  const geom = new THREE.BufferGeometry();
  const bladeWidth = 0.075;
  const bladeHeight = CONFIG.grass.bladeHeight;

  const positions = new Float32Array([
    -bladeWidth * 0.5, 0, 0,
     bladeWidth * 0.5, 0, 0,
    -bladeWidth * 0.35, bladeHeight * 0.5, 0.04,
     bladeWidth * 0.35, bladeHeight * 0.5, 0.04,
     0.0, bladeHeight, 0.12
  ]);

  const indices = [
    0, 1, 2,
    1, 3, 2,
    2, 3, 4
  ];

  const heightFactors = new Float32Array([0.0, 0.0, 0.5, 0.5, 1.0]);

  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('heightFactor', new THREE.BufferAttribute(heightFactors, 1));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  const grassMaterial = new THREE.MeshStandardMaterial({
    roughness: 0.65,
    metalness: 0.08,
    side: THREE.DoubleSide
  });

  const uniforms = {
    uTime: { value: 0 },
    uBaseColor: { value: new THREE.Color(CONFIG.grass.baseColor) }, // 0x145c35 (brighter root)
    uTipColor: { value: new THREE.Color(CONFIG.grass.tipColor) },   // 0x5fe0a0 (vibrant luminous tip)
    uCyanAccent: { value: new THREE.Color(CONFIG.grass.cyanRimColor) } // 0x4ff5d0
  };

  grassMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uBaseColor = uniforms.uBaseColor;
    shader.uniforms.uTipColor = uniforms.uTipColor;
    shader.uniforms.uCyanAccent = uniforms.uCyanAccent;

    shader.vertexShader = `
      attribute float heightFactor;
      varying float vHeight;
      varying vec3 vWorldPos;
      uniform float uTime;
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vHeight = heightFactor;

      vec4 worldInstancePos = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      vWorldPos = worldInstancePos.xyz;

      float windWave1 = sin(uTime * 2.2 + worldInstancePos.x * 0.9 + worldInstancePos.z * 1.3);
      float windWave2 = cos(uTime * 1.4 + worldInstancePos.x * 2.0 - worldInstancePos.z * 0.8);
      float totalWind = (windWave1 + windWave2 * 0.5) * 0.22;

      float swayFactor = pow(heightFactor, 1.6);
      transformed.x += totalWind * swayFactor;
      transformed.z += (windWave1 * 0.6) * swayFactor;
      transformed.y -= abs(totalWind * 0.3) * swayFactor;
      `
    );

    shader.fragmentShader = `
      varying float vHeight;
      varying vec3 vWorldPos;
      uniform vec3 uBaseColor;
      uniform vec3 uTipColor;
      uniform vec3 uCyanAccent;
      ${shader.fragmentShader}
    `;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      // Vertical gradient from rich green base to luminous vibrant green tip
      vec3 gradColor = mix(uBaseColor, uTipColor, smoothstep(0.05, 0.95, vHeight));

      // Cyan rim light glow on blades near the portal
      float distToPortal = clamp(length(vWorldPos - vec3(0.0, 0.0, -8.0)) / 14.0, 0.0, 1.0);
      float rimGlow = (1.0 - distToPortal) * smoothstep(0.3, 1.0, vHeight) * 0.6;
      gradColor = mix(gradColor, uCyanAccent, rimGlow);

      diffuseColor.rgb = gradColor;
      `
    );
  };

  const instancedMesh = new THREE.InstancedMesh(geom, grassMaterial, count);
  instancedMesh.receiveShadow = true;
  instancedMesh.castShadow = false;

  const dummy = new THREE.Object3D();
  let validIndex = 0;

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * hallWidth;
    const z = THREE.MathUtils.lerp(startZ, endZ, Math.random());

    // Skip stairs area
    if (z < -3.2 && Math.abs(x) < 2.8) continue;
    // Skip pillar base areas
    if (Math.hypot(x - -4.5, z - 2.0) < 1.6) continue;
    if (Math.hypot(x - 4.5, z - 2.0) < 1.6) continue;

    dummy.position.set(x, 0.0, z);
    dummy.rotation.y = Math.random() * Math.PI * 2;
    dummy.rotation.x = (Math.random() - 0.5) * 0.2;
    dummy.rotation.z = (Math.random() - 0.5) * 0.2;

    const scaleY = THREE.MathUtils.randFloat(0.85, 1.35);
    const scaleXZ = THREE.MathUtils.randFloat(0.85, 1.2);
    dummy.scale.set(scaleXZ, scaleY, scaleXZ);

    dummy.updateMatrix();
    instancedMesh.setMatrixAt(validIndex, dummy.matrix);
    validIndex++;
  }

  instancedMesh.count = validIndex;
  instancedMesh.instanceMatrix.needsUpdate = true;
  scene.add(instancedMesh);

  // ── HOA RẢI RÁC TRONG SẢNH ĐỀN (Vàng, Tím, Hồng) ──
  const flowerCount = 180;
  const flowerGeom = new THREE.OctahedronGeometry(0.09);
  const flowerColors = [0xffd700, 0xd87093, 0xba55d3, 0x00fa9a, 0xff69b4];
  const flowerGroup = new THREE.Group();

  for (let f = 0; f < flowerCount; f++) {
    const fx = (Math.random() - 0.5) * (hallWidth - 1.0);
    const fz = THREE.MathUtils.lerp(startZ, endZ, Math.random());

    if (fz < -3.0 && Math.abs(fx) < 2.5) continue;
    if (Math.hypot(fx - -4.5, fz - 2.0) < 1.4) continue;
    if (Math.hypot(fx - 4.5, fz - 2.0) < 1.4) continue;

    const col = flowerColors[Math.floor(Math.random() * flowerColors.length)];
    const fMat = new THREE.MeshStandardMaterial({
      color: col,
      emissive: new THREE.Color(col),
      emissiveIntensity: 0.35,
      roughness: 0.5
    });

    const flowerMesh = new THREE.Mesh(flowerGeom, fMat);
    flowerMesh.position.set(fx, 0.22 + Math.random() * 0.2, fz);
    flowerMesh.scale.set(1.0, 1.4, 1.0);
    flowerGroup.add(flowerMesh);
  }
  scene.add(flowerGroup);

  return {
    mesh: instancedMesh,
    update: (time) => {
      uniforms.uTime.value = time;
    }
  };
}
