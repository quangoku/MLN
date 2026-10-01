// 1 đơn vị = 1 ô gạch. Trục Y hướng lên, sàn ở y = 0.

export const LAYOUT = {
 depth: 12, // chiều sâu (trục Z) của mọi phòng
 spacingX: 4, // khoảng cách giữa hai cột hiện vật
 rowZ: 2.6, // hai hàng hiện vật ở z = ±rowZ, lối đi ở giữa
 margin: 1.5, // khoảng trống hai đầu phòng
 doorWidth: 2.4,
 wallThickness: 0.3,
 backWallHeight: 1.4, // tường phía xa camera (bắc, tây)
 partitionHeight: 1.2, // vách ngăn giữa các phòng
 frontWallHeight: 0.35, // tường phía gần camera, thấp để nhìn xuyên vào (cutaway)
};

export const DOOR_FRAME = {
 postWidth: 0.3,
 postDepth: LAYOUT.wallThickness + 0.1, // covers the wall cap (wall thickness + 0.06)
};

export const PLAYER = {
 startOffset: [6, 3], // so với góc tây của sảnh (x0 + 6, z = 3)
 speed: 4.5, // ô / giây
 sprintSpeed: 8,
 radius: 0.28,
};

export const NPC = {
 radius: 0.25,
};

export const CAMERA = {
 offset: [10, 10, 10],
 zoom: 55,
 minZoom: 30,
 maxZoom: 110,
 followSmoothing: 5, // càng lớn camera bám càng sát
};

export const PEDESTAL = {
 size: 1.2,
 height: 1,
};

export const FLOAT = {
 height: 1.7, // độ cao tâm vật thể so với sàn
 amplitude: 0.12,
 bobSpeed: 2,
 spinSpeed: 0.6, // rad / giây
 hoverSpinSpeed: 3,
};

export const INTERACTION = {
 radius: 2, // đủ gần để đọc hiện vật từ lối đi giữa hai hàng bục
};

export const KEYMAP = [
 { name: "forward", keys: ["KeyW", "ArrowUp"] },
 { name: "backward", keys: ["KeyS", "ArrowDown"] },
 { name: "left", keys: ["KeyA", "ArrowLeft"] },
 { name: "right", keys: ["KeyD", "ArrowRight"] },
 { name: "sprint", keys: ["ShiftLeft", "ShiftRight"] },
];
