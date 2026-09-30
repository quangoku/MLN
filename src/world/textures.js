import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { mulberry32 } from '../utils/random.js'

const SIZE = 128
const cache = new Map()

function canvas2d(w = SIZE, h = SIZE) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  return [canvas, canvas.getContext('2d')]
}

function diamond(ctx, color, inset) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(SIZE / 2, SIZE * inset)
  ctx.lineTo(SIZE * (1 - inset), SIZE / 2)
  ctx.lineTo(SIZE / 2, SIZE * (1 - inset))
  ctx.lineTo(SIZE * inset, SIZE / 2)
  ctx.closePath()
  ctx.fill()
}

// Mỗi hàm vẽ đúng 1 ô gạch (1 đơn vị thế giới), texture sẽ được lặp lại
const PAINTERS = {
  tile(ctx) {
    ctx.fillStyle = '#5FA8A0'
    ctx.fillRect(0, 0, SIZE, SIZE)
    diamond(ctx, '#6BB5AC', 0.2)
    ctx.strokeStyle = '#E8F4F1'
    ctx.lineWidth = 4
    ctx.strokeRect(0, 0, SIZE, SIZE)
  },
  wood(ctx) {
    const planks = ['#B5664A', '#A95C42', '#BD6E51', '#AF6147']
    const h = SIZE / 4
    planks.forEach((color, i) => {
      ctx.fillStyle = color
      ctx.fillRect(0, i * h, SIZE, h)
      ctx.fillStyle = '#8A4633'
      ctx.fillRect(0, i * h, SIZE, 2)
      // mối nối đầu ván so le
      ctx.fillRect(((i * 37) % SIZE) + 10, i * h, 2, h)
    })
  },
  marble(ctx) {
    ctx.fillStyle = '#D9D6E0'
    ctx.fillRect(0, 0, SIZE, SIZE)
    ctx.fillStyle = '#E4E2EA'
    ctx.fillRect(12, 12, SIZE - 24, SIZE - 24)
    ctx.strokeStyle = '#BDB9C8'
    ctx.lineWidth = 4
    ctx.strokeRect(0, 0, SIZE, SIZE)
  },
  carpet(ctx) {
    ctx.fillStyle = '#C9575E'
    ctx.fillRect(0, 0, SIZE, SIZE)
    diamond(ctx, '#D2666C', 0.08)
    diamond(ctx, '#C9575E', 0.3)
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, SIZE, SIZE)
  },
}

export function floorTexture(kind, width, depth) {
  const [canvas, ctx] = canvas2d()
  PAINTERS[kind](ctx)
  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  texture.repeat.set(width, depth)
  return texture
}

// Tranh treo tường vẽ thủ tục theo seed: núi, cành hoa, hoặc hình khối trừu tượng
export function paintingTexture(seed) {
  if (cache.has(seed)) return cache.get(seed)
  const rng = mulberry32(seed + 1)
  const [canvas, ctx] = canvas2d(192, 108)
  const W = 192
  const H = 108
  ctx.fillStyle = '#EFE3C8'
  ctx.fillRect(0, 0, W, H)

  const style = seed % 3
  if (style === 0) {
    const layers = ['#A7B8A0', '#7E9A83', '#56736A']
    layers.forEach((color, i) => {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(0, H)
      for (let x = 0; x <= W; x += 16) ctx.lineTo(x, H * (0.45 + i * 0.15) - rng() * 26)
      ctx.lineTo(W, H)
      ctx.fill()
    })
    ctx.fillStyle = '#D9534F'
    ctx.beginPath()
    ctx.arc(W * (0.2 + rng() * 0.6), H * 0.28, 9, 0, Math.PI * 2)
    ctx.fill()
  } else if (style === 1) {
    ctx.strokeStyle = '#5C4033'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(10, H - 10)
    let x = 10
    let y = H - 10
    for (let i = 0; i < 6; i++) {
      x += 20 + rng() * 14
      y -= 8 + rng() * 10
      ctx.lineTo(x, y)
    }
    ctx.stroke()
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = rng() > 0.5 ? '#E8A1B0' : '#F6D1D9'
      ctx.beginPath()
      ctx.arc(20 + rng() * (W - 40), 20 + rng() * (H - 40), 4 + rng() * 4, 0, Math.PI * 2)
      ctx.fill()
    }
  } else {
    const palette = ['#D1495B', '#EDAE49', '#00798C', '#30638E', '#003D5B']
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = palette[Math.floor(rng() * palette.length)]
      if (rng() > 0.5) {
        ctx.fillRect(rng() * W * 0.8, rng() * H * 0.8, 20 + rng() * 40, 14 + rng() * 30)
      } else {
        ctx.beginPath()
        ctx.arc(rng() * W, rng() * H, 8 + rng() * 18, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  cache.set(seed, texture)
  return texture
}
