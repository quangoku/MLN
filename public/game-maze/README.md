# Sảnh Đền Cổ — Cổng Thiên Cầu (Three.js + Vite)

Dự án 3D scene tương tác thời gian thực tái hiện hoàn chỉnh sảnh đền cổ huyền bí trong rừng ban đêm với Cổng Thiên Cầu rực rỡ năng lượng Cyan/Teal, cỏ InstancedMesh đung đưa theo gió, nhân vật góc nhìn thứ 3 / thứ 1, và hệ thống ánh sáng UnrealBloomPass đạt 60+ FPS.

---

## 🚀 Cách chạy dự án

### 1. Chạy độc lập (Standalone Dev Server)
Di chuyển vào thư mục `game-maze`:
```bash
cd public/game-maze
npm install
npm run dev
```
Trình duyệt sẽ tự động mở tại `http://localhost:5174/` với đầy đủ tính năng.

### 2. Chạy qua ứng dụng chính (Philoverse)
Ở thư mục gốc dự án:
```bash
npm run dev
```
Mở menu hoặc chọn **Mê Cung Kinh Tế**, màn hình sẽ nhúng game từ `public/game-maze/index.html`.

---

## 🎮 Phím điều khiển
- **W, A, S, D**: Di chuyển nhân vật (hướng tương đối theo camera).
- **Shift (giữ)**: Chạy nhanh (Sprint).
- **Space**: Nhảy (Jump).
- **Chuột**: Xoay tự do góc nhìn 360°.
- **Phím V**: Chuyển đổi giữa **Góc nhìn thứ ba (TPS)** và **Góc nhìn thứ nhất (FPS)**.
- **Phím E**: Tương tác kích hoạt Cổng Thiên Cầu khi tiến lại gần bục đá (< 3.2m).

---

## 📁 Cấu trúc mã nguồn

```
public/game-maze/
├── package.json          # Cấu hình dependency Three.js, Cannon-es, Vite
├── vite.config.js        # Config Vite server (port 5174, base: ./)
├── index.html            # Giao diện HUD, Start screen, Canvas, Importmap
└── src/
    ├── main.js           # Khởi tạo Scene, Renderer, Vòng lặp game, Âm thanh synth Web Audio
    ├── character.js      # Model nhân vật nữ explorer, procedural animation, loadCharacter() GLB
    ├── controls.js       # Bộ điều khiển camera 3rd/1st person, chống xuyên tường (collision)
    ├── effects.js        # Post-processing: UnrealBloomPass, Vignette, Color grading teal
    ├── physics.js        # Vật lý va chạm cột, tường, bục đá, leo bậc thang mượt mà
    └── scene/
        ├── temple.js     # Sảnh đền, 2 cột đá lớn, trần đá hình học, dây leo, bục & cầu thang 6 bậc
        ├── grass.js      # Thảm cỏ 42.000 lá InstancedMesh + Vertex Shader gió đung đưa
        ├── portal.js     # Cổng Thiên Cầu: 3 vòng armillary, quả cầu năng lượng cyan, đom đóm
        └── textures.js   # Procedural Canvas Textures: đá viền sáng, rêu, phù điêu xoắn ốc, banner
```

---

## 🎨 Hướng dẫn tinh chỉnh

### 1. Tinh chỉnh màu sắc & sương mù (Fog / Ambient)
Mở file `src/main.js`:
- **Màu nền & sương mù huyền bí**:
  ```javascript
  scene.background = new THREE.Color(0x010c0e); // Màu nền đêm xanh đen
  scene.fog = new THREE.FogExp2(0x021318, 0.038); // Mật độ sương mù
  ```
- **Ánh sáng PointLight tại Cổng**:
  Mở `src/scene/portal.js`:
  ```javascript
  const portalLight = new THREE.PointLight(0x00ffcc, 5.0, 22.0, 1.8);
  // Thay 0x00ffcc thành màu bạn muốn (vd: 0x9900ff cho tím, 0xffaa00 cho vàng kim)
  ```

### 2. Tinh chỉnh độ sáng Bloom & Glow
Mở file `src/effects.js`:
```javascript
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(width, height),
  1.35,  // Cường độ phát sáng (Bloom strength) - tăng lên 2.0 nếu muốn sáng rực rỡ hơn
  0.55,  // Bán kính hào quang (Bloom radius)
  0.68   // Ngưỡng phát sáng (Threshold) - chỉ các vật liệu emissive mới phát sáng
);
```

### 3. Tinh chỉnh thảm cỏ đung đưa
Mở file `src/scene/grass.js`:
- Thay đổi số lượng lá cỏ: `const count = 42000;` (có thể tăng lên 55000 nếu máy mạnh).
- Thay đổi tốc độ gió: tìm dòng `uTime * 2.2` trong vertex shader để tăng/giảm độ lắc.
- Thay đổi màu gradient cỏ:
  ```javascript
  uBaseColor: { value: new THREE.Color(0x05231c) }, // Xanh đậm ở gốc
  uTipColor: { value: new THREE.Color(0x27e39a) }   // Xanh sáng ngọc ở ngọn
  ```

### 4. Cách thay thế bằng Model 3D `.glb` (Mixamo / Quaternius)
Hàm `loadCharacter(url)` đã được viết sẵn trong `src/character.js` và gắn vào `window.loadCharacter`:
1. Tải model `.glb` từ [Mixamo](https://www.mixamo.com) hoặc [Quaternius](https://quaternius.com).
2. Đặt file vào `public/game-maze/models/character.glb`.
3. Trong `src/main.js` (hoặc mở Console trình duyệt gõ trực tiếp):
   ```javascript
   loadCharacter('./models/character.glb').then(() => {
     console.log('Model nhân vật mới đã được áp dụng!');
   });
   ```
   Hàm sẽ tự động ẩn model sơ cấp ban đầu, gắn animation mixer và chuyển động mượt mà.

---

## 🌐 Các nguồn tài nguyên 3D miễn phí chất lượng cao
- **[Poly Haven](https://polyhaven.com)**: Texture PBR đá, rêu, đất, HDRI hoàn toàn miễn phí (CC0).
- **[Quaternius](https://quaternius.com)**: Gói nhân vật low-poly/stylized, tàn tích đền thờ, thiên nhiên (Animated Ruins, Medieval, Adventurers).
- **[Kenney.nl](https://kenney.nl)**: Hàng nghìn model 3D CC0 nhẹ và tối ưu cho web game.
- **[Mixamo](https://www.mixamo.com)**: Nhân vật và hàng nghìn animation đi bộ, chạy, nhảy miễn phí của Adobe.
- **[Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets)**: Thư viện mô hình chuẩn glTF để test render PBR.

