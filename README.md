# PhiloVerse 🏛️

> Bảo tàng triết học 2.5D tương tác trên web — đồ án cuối kỳ môn **Triết học Mác-Lênin (MLN111)**.
> Người chơi đi dạo qua sảnh và ba phòng trưng bày (ba chương giáo trình), rê chuột vào hiện vật để đọc khái niệm, nguyên lý và kết luận.

---

## Mục lục

1. [Tính năng](#1-tính-năng)
2. [Tech stack](#2-tech-stack)
3. [Chạy dự án](#3-chạy-dự-án)
4. [Cấu trúc thư mục](#4-cấu-trúc-thư-mục)
5. [Các khối chính và cách chúng nối với nhau](#5-các-khối-chính-và-cách-chúng-nối-với-nhau)
6. [Thêm / sửa nội dung](#6-thêm--sửa-nội-dung)
7. [Quy ước toạ độ và camera](#7-quy-ước-toạ-độ-và-camera)
8. [Hướng dẫn phong cách (Style Guide)](#8-hướng-dẫn-phong-cách-style-guide)
9. [Lộ trình phát triển](#9-lộ-trình-phát-triển)

---

## 1. Tính năng

- **Sảnh + 3 phòng** nối với nhau bằng cửa: Chương 1 (sàn gạch xanh ngọc), Chương 2 (sàn gỗ), Chương 3 (sàn đá cẩm thạch).
- **40 hiện vật** lấy từ giáo trình: 📖 *sách lơ lửng* = định nghĩa, lý thuyết; 💎 *đá quý phát sáng* = kết luận, ý nghĩa. Mỗi phòng có thêm bảng giới thiệu chương ở cửa vào.
- **Hover** để đọc, **nhấp** để ghim bảng, **Esc** hoặc nhấp ra ngoài để đóng.
- **Tiến trình khám phá**: biển trên bục chuyển vàng, thanh tiến trình theo phòng, tổng x/40, lưu vào `localStorage`, có thông báo khi hoàn thành.
- **Minimap** góc phải, **thông báo** khi sang phòng mới.
- **Khách tham quan (NPC)** đi lại, dừng ngắm từng hiện vật.
- **Đạo cụ low-poly** dựng bằng code: ghế băng, cột đèn phát sáng, chậu cây, tranh treo tường vẽ thủ tục, kiosk vé, quả địa cầu ở sảnh.
- **Âm thanh** tổng hợp bằng Web Audio (không cần file): bước chân, hover, khám phá, vào phòng, hoàn thành. Phím **M** để tắt.
- **Camera isometric** trực giao bám theo người chơi, **cuộn chuột** để phóng to/thu nhỏ.

| Phím | Tác dụng |
|---|---|
| W A S D / mũi tên | Di chuyển |
| Shift | Chạy |
| Cuộn chuột | Phóng to / thu nhỏ |
| Nhấp vào hiện vật | Ghim / bỏ ghim bảng thông tin |
| Esc | Đóng bảng đang ghim |
| M | Bật / tắt âm thanh |

---

## 2. Tech stack

| Mục đích | Thư viện |
|---|---|
| Build tool | Vite 6 (chạy được trên Node 18) |
| UI framework | React 19 |
| 3D engine | Three.js |
| React binding cho 3D | `@react-three/fiber` 9 (R3F) |
| Helper 3D | `@react-three/drei` 10 (`OrthographicCamera`, `Html`, `KeyboardControls`, `Edges`) |
| Hiệu ứng glow | `@react-three/postprocessing` + `postprocessing` (Bloom) |
| State dùng chung | `zustand` |
| Styling cho UI DOM | CSS thường (`src/styles/index.css`) |

Không dùng file model/âm thanh/font bên ngoài: mọi thứ (đồ vật, texture sàn, tranh, âm thanh) đều sinh bằng code, nên dự án chạy offline và không lo bản quyền tài nguyên.

---

## 3. Chạy dự án

```bash
npm install
```

```bash
npm run dev
```

Build bản production vào `dist/`:

```bash
npm run build
```

> Sau khi cài thêm package mà Vite báo lỗi `Outdated Optimize Dep`, tắt `npm run dev` rồi chạy lại.

### Xuất bản / nộp bài

**Cách dễ nhất — một file HTML duy nhất:**

```bash
npm run build:single
```

Lệnh này tạo `PhiloVerse.html` (~1.3 MB, đã nhúng toàn bộ JS + CSS). Gửi file này cho người khác, nhấp đúp là chơi được, không cần server hay internet.

**Hoặc host lên web:**

`philoverse.zip` là nội dung thư mục `dist/` đã nén. Bản build dùng đường dẫn tương đối (`base: './'`), nên chạy được ở bất kỳ đâu có web server:

- **Netlify Drop**: kéo thả thư mục `dist/` (hoặc giải nén zip) vào app.netlify.com/drop → có link chia sẻ ngay.
- **GitHub Pages / Vercel**: đẩy nội dung `dist/` lên, không cần cấu hình thêm.
- **Chạy thử trên máy**: `npm run preview`.

> Không mở `dist/index.html` bằng cách nhấp đúp (giao thức `file://`): trình duyệt chặn module JavaScript nên sẽ ra trang trắng. Luôn chạy qua một web server như trên.

---

## 4. Cấu trúc thư mục

```
src/
├── main.jsx               # Điểm vào, mount <App/>
├── App.jsx                # KeyboardControls + Canvas + các lớp UI DOM + phím tắt Esc/M
│
├── config/
│   ├── constants.js       # Kích thước phòng, tốc độ, camera, độ nổi hiện vật, bảng phím
│   └── theme.js           # Bảng màu, theme từng phòng, màu áo/da/tóc NPC
│
├── data/                  # NỘI DUNG — người viết nội dung chỉ cần sửa ở đây
│   ├── museum.js          # Danh sách phòng theo thứ tự tây → đông
│   ├── chapter1.js        # Chương 1: intro + exhibits[]
│   ├── chapter2.js        # Chương 2
│   └── chapter3.js        # Chương 3
│
├── world/                 # Kiến trúc tĩnh
│   ├── layout.js          # ⭐ Tính toàn bộ mặt bằng từ data: phòng, hiện vật, tường, cột,
│   │                      #    đồ trang trí, vật cản (COLLIDERS), điểm tham quan cho NPC
│   ├── collision.js       # Đẩy hình tròn ra khỏi hộp / hình tròn khác
│   ├── textures.js        # Texture sàn (tile/wood/marble/carpet) và tranh vẽ bằng canvas
│   ├── Museum.jsx         # Render sàn + tường + cột + đồ trang trí từ layout.js
│   ├── Floor.jsx, Wall.jsx, Pillar.jsx
│   └── props/             # Bench, LampPost, Plant, Painting, Kiosk, Globe (+ index.js)
│
├── exhibits/              # Mọi thứ tương tác được
│   ├── Exhibit.jsx        # Wrapper: hover, ghim, khám phá, âm thanh, bảng thông tin
│   ├── Pedestal.jsx       # Bục + biển nhỏ (vàng khi đã khám phá)
│   ├── FloatingBook.jsx   # Sách mở, có tờ giấy lật qua lại
│   ├── FloatingGem.jsx    # Đá quý rỗng, lõi phát sáng (Bloom)
│   ├── InfoBoard.jsx      # Bảng giới thiệu chương / lời chào ở sảnh
│   ├── SelectionHull.jsx  # Viền xanh khi hover (kỹ thuật inverted hull)
│   └── ExhibitPanel.jsx   # Bảng thông tin DOM qua drei <Html>
│
├── player/
│   ├── Character.jsx      # Nhân vật low-poly dùng chung cho player và NPC (vung tay chân khi đi)
│   ├── Player.jsx         # Input WASD, va chạm, tiếng bước chân, cập nhật phòng hiện tại
│   └── playerRef.js       # Ref vị trí player cho camera, đèn, minimap
│
├── npc/
│   ├── Visitors.jsx       # Sinh NPC theo số lượng `visitors` của từng phòng
│   ├── Visitor.jsx        # Máy trạng thái: đi tới hiện vật → đứng ngắm → chọn hiện vật khác
│   └── npcRegistry.js     # Danh sách NPC để player va chạm
│
├── scene/
│   ├── GameCanvas.jsx     # <Canvas> gốc, ghép mọi thứ
│   ├── CameraRig.jsx      # Camera isometric bám player, zoom bằng cuộn chuột
│   ├── Lighting.jsx       # Hemisphere + directional (vùng bóng đổ đi theo player)
│   └── Effects.jsx        # Bloom
│
├── store/useMuseumStore.js  # zustand: started, phòng hiện tại, hiện vật đã khám phá, ghim, tắt tiếng
├── audio/sfx.js             # Âm thanh Web Audio
├── ui/                      # HUD, Minimap, StartScreen, Toast
├── utils/                   # random có seed, dampAngle
└── styles/index.css
```

### Nguyên tắc chia thư mục

- **`data/`** chỉ chứa chữ. Không có toạ độ, không có code 3D.
- **`world/layout.js`** là nơi *duy nhất* tính toạ độ. Component chỉ render những gì layout đưa ra; `Player` và `Visitor` dùng chung `COLLIDERS` và `VISIT_POINTS` từ đây.
- **`exhibits/Exhibit.jsx`** là cửa ngõ duy nhất cho tương tác. Thêm loại hiện vật mới = thêm một dòng vào `TYPES`.
- Thứ cập nhật mỗi frame (vị trí player/NPC, camera, đèn, minimap) ghi thẳng vào ref/DOM, **không** qua React state, để không re-render.

---

## 5. Các khối chính và cách chúng nối với nhau

```
data/museum.js + chapterX.js
        │
        ▼
world/layout.js ──► ROOMS, EXHIBITS, WALLS, PILLARS, DECOR, COLLIDERS, VISIT_POINTS
        │
        ▼
<App>
 ├── <KeyboardControls>
 │    └── <GameCanvas>
 │         ├── <Lighting/>     ── đọc playerRef, dời vùng bóng theo player
 │         ├── <CameraRig/>    ── đọc playerRef, lerp camera; raycast lại khi camera trôi
 │         ├── <Museum/>       ── sàn, tường, cột, props
 │         ├── <Player/>       ── ghi playerRef; va chạm COLLIDERS + npcRegistry; setRoom()
 │         ├── <Visitors/>     ── đi giữa VISIT_POINTS
 │         ├── EXHIBITS.map → <Exhibit>  ── hover/click → store.discover() / togglePin()
 │         └── <Effects/>
 ├── <HUD/> (+ <Minimap/>)     ── đọc store; minimap đọc playerRef bằng rAF
 ├── <Toast/>                  ── phản ứng khi roomId / số hiện vật đã khám phá đổi
 └── <StartScreen/>            ── unlockAudio() + store.start()
```

**Luồng hover:**

1. R3F raycast → `onPointerOver` trên vật thể của `Exhibit`.
2. `Exhibit` đặt `hovered`; nếu là lần đầu → `store.discover(id)` → chuông "khám phá", biển trên bục chuyển vàng, HUD và minimap cập nhật.
3. `useFloat` tăng tốc xoay; `SelectionHull` vẽ viền xanh quanh vật thể và bục.
4. `ExhibitPanel` hiện bảng (`<Html>`) với tiêu đề, trích dẫn và các gạch đầu dòng.
5. Nhấp → ghim (`pinnedId`), bảng ở lại khi chuột rời đi. Esc / nhấp ra ngoài (`onPointerMissed`) → bỏ ghim.

**Luồng di chuyển:**

1. `Player` đọc phím → vector hướng đã xoay 45° cho khớp góc isometric.
2. Bước đi chia nhỏ 0.1 ô/lần; mỗi lần đẩy khỏi `COLLIDERS` (tường, bục, ghế, đèn…) và khỏi NPC → không đi xuyên tường kể cả khi FPS thấp.
3. Mỗi ~0.75 ô phát tiếng bước chân; khi sang phòng khác gọi `store.setRoom()`.

---

## 6. Thêm / sửa nội dung

Mở `src/data/chapterX.js` và thêm một object vào `exhibits`:

```js
{
  id: 'c2-new-idea',        // duy nhất, dùng để lưu tiến trình
  type: 'book',             // 'book' = định nghĩa/lý thuyết · 'gem' = kết luận/ý nghĩa
  title: 'Tiêu đề',
  quote: { text: '…', author: 'V.I. Lênin' },   // tuỳ chọn
  body: ['Ý 1', 'Ý 2'],     // chuỗi, hoặc mảng chuỗi → gạch đầu dòng
}
```

Không cần chỉnh gì khác: `layout.js` tự nới rộng phòng (mỗi 2 hiện vật thêm 4 ô), xếp bục zíc-zắc hai hàng, thêm tranh, ghế, đèn, vật cản và điểm tham quan cho NPC.

Muốn thêm phòng thứ tư: tạo `chapter4.js`, thêm một mục vào `data/museum.js` và một theme vào `ROOM_THEMES` trong `config/theme.js`.

> ⚠️ Nội dung 40 hiện vật được tóm tắt theo *Giáo trình Triết học Mác-Lênin* (dùng cho bậc đại học không chuyên lý luận chính trị). Nên đối chiếu lại với giáo trình và slide của lớp trước khi nộp.

---

## 7. Quy ước toạ độ và camera

- **Trục Y hướng lên**, sàn ở `y = 0`. **1 đơn vị = 1 ô gạch.**
- Các phòng xếp liền nhau dọc **trục X** (tây → đông), mọi phòng sâu 12 ô (`z` từ −6 tới 6). Cửa nằm ở giữa vách ngăn (`z ≈ 0`), trùng lối đi giữa hai hàng bục.
- **Tường phía xa camera** (bắc, tây) cao 1.4; **vách ngăn** 1.2; **tường phía gần camera** (nam, đông) chỉ 0.35 để nhìn xuyên vào (cutaway).
- **Camera**: `OrthographicCamera`, offset cố định `[10, 10, 10]` so với điểm nhìn; zoom 30–110.
- **Hướng di chuyển**: camera nhìn từ góc (+X, +Z) nên **W** = `(-1, 0, -1)`, **S** = `(1, 0, 1)`, **A** = `(-1, 0, 1)`, **D** = `(1, 0, -1)` (trước khi chuẩn hoá).

---

## 8. Hướng dẫn phong cách (Style Guide)

Tham chiếu: ảnh chụp game quản lý bảo tàng low-poly (kiểu *Two Point Museum*).

### Hình khối
- **Low-poly, flat shading**, màu phẳng, không dùng texture ảnh thật.
- **Tường thấp dạng cutaway** có viền trên màu tối.
- **Bục trưng bày**: thân xám đá, viền gỗ đỏ nâu, mặt màu cát.
- **Cột** màu đất nung ở hai bên cửa và góc phòng.
- **Nhân vật**: dáng mảnh, tay chân dài, đầu tròn không có mặt.

### Bảng màu (`config/theme.js`)

| Vai trò | Hex |
|---|---|
| Sàn sảnh (thảm) | `#C9575E` |
| Sàn phòng 1 (gạch xanh ngọc) | `#5FA8A0` |
| Sàn phòng 2 (gỗ) | `#B5664A` |
| Sàn phòng 3 (đá xám nhạt) | `#D9D6E0` |
| Tường | `#B9B6D6` / `#C6B9D9` / `#B7C3D6` / `#CFC4A6` |
| Viền tường | `#3A2A2A` |
| Cột | `#E0875A` |
| Bục – thân / viền / mặt | `#6E6F7A` / `#7A3524` / `#E7C58E` |
| Đèn / glow | `#FFE27A` |
| Viền chọn (hover) | `#39FF14` |
| Nền ngoài | `#1F4A40` |

### Ánh sáng
- Hemisphere sáng để không có góc tối đen; directional ấm có bóng mềm, vùng bóng đi theo player.
- Bloom ngưỡng 1: chỉ vật liệu `toneMapped={false}` với emissive > 1 mới phát sáng (bóng đèn, lõi đá quý), sàn/tường sáng màu không bị loá.

### Tín hiệu tương tác
- Hover → viền xanh lá quanh hiện vật + bục, vật xoay nhanh hơn.
- Bảng thông tin: nền giấy kem; viền nâu đỏ (sách), xanh ngọc (đá quý), xanh lam (bảng giới thiệu).

---

## 9. Lộ trình phát triển

- [x] **Giai đoạn 1 — Prototype**: 1 phòng, capsule WASD, camera isometric bám theo, bục + khối xoay, hover hiện text.
- [x] **Giai đoạn 2 — Hoàn thiện cơ chế**: sách lật trang, đá quý + Bloom, viền hover, bảng có nhãn loại kiến thức, va chạm.
- [x] **Giai đoạn 3 — Nội dung**: sảnh + 3 phòng theo 3 chương nối bằng cửa, 40 hiện vật + 4 bảng giới thiệu, bố cục tự sinh từ dữ liệu.
- [x] **Giai đoạn 4 — Trau chuốt**: đạo cụ low-poly, NPC, âm thanh, minimap, tiến trình khám phá, màn hình bắt đầu, ghim bảng, zoom.

Ý tưởng mở rộng nếu còn thời gian:
- Mini-quiz ở cuối mỗi phòng (đá quý "khoá" cho tới khi trả lời đúng).
- Thay đạo cụ tự dựng bằng model `.glb` (nạp bằng `useGLTF` của drei, đặt trong `public/models/`).
- Hỗ trợ điện thoại: joystick ảo, chạm để đọc.
