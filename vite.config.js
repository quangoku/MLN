import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Đường dẫn tương đối để bản build chạy được cả khi host trong thư mục con (vd. GitHub Pages)
  base: './',
  build: {
    chunkSizeWarningLimit: 1500, // three.js vốn đã nặng, cảnh báo 500 kB mặc định không có ý nghĩa ở đây
  },
})
