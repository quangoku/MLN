import { createRef } from 'react'

// Player ghi vào đây; CameraRig, Lighting, Minimap đọc ra — tránh re-render mỗi frame.
export const playerRef = createRef()
