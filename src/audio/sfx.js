import { useMuseumStore } from '../store/useMuseumStore.js'

// Âm thanh tổng hợp bằng Web Audio — không cần file âm thanh.
// Trình duyệt chỉ cho phát sau thao tác của người dùng → gọi unlockAudio() khi bấm "Vào bảo tàng".
let ctx = null
let master = null

export function unlockAudio() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    ctx = new AudioCtx()
    master = ctx.createGain()
    master.gain.value = 0.6
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
}

function ready() {
  return ctx && ctx.state === 'running' && !useMuseumStore.getState().muted
}

function tone({ freq, duration = 0.2, type = 'sine', gain = 0.06, delay = 0, slideTo }) {
  const t = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + duration)
  amp.gain.setValueAtTime(0, t)
  amp.gain.linearRampToValueAtTime(gain, t + 0.01)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.connect(amp).connect(master)
  osc.start(t)
  osc.stop(t + duration + 0.05)
}

export function playHover() {
  if (!ready()) return
  tone({ freq: 880, duration: 0.12, gain: 0.025 })
}

export function playDiscover() {
  if (!ready()) return
  ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
    tone({ freq, duration: 0.4, gain: 0.045, delay: i * 0.07, type: 'triangle' }),
  )
}

export function playClick() {
  if (!ready()) return
  tone({ freq: 440, slideTo: 660, duration: 0.1, gain: 0.04, type: 'triangle' })
}

export function playRoomEnter() {
  if (!ready()) return
  tone({ freq: 392, duration: 0.6, gain: 0.03 })
  tone({ freq: 587.33, duration: 0.8, gain: 0.03, delay: 0.12 })
}

export function playComplete() {
  if (!ready()) return
  ;[523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) =>
    tone({ freq, duration: 0.7, gain: 0.05, delay: i * 0.12, type: 'triangle' }),
  )
}

// Tiếng bước chân: một nhát nhiễu trắng ngắn qua lọc thông thấp
let noiseBuffer = null
export function playStep() {
  if (!ready()) return
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  }
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer
  src.playbackRate.value = 0.8 + Math.random() * 0.4
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 700
  const amp = ctx.createGain()
  amp.gain.value = 0.12
  src.connect(filter).connect(amp).connect(master)
  src.start()
}

// Âm thanh dịch chuyển không gian vũ trụ (Warp Sound)
export function playSpaceWarp() {
  if (!ready()) return
  // Dải hợp âm vũ trụ quét tần số mở ra không gian
  ;[220, 329.63, 440, 659.25, 880, 1318.5].forEach((freq, i) => {
    tone({
      freq,
      slideTo: freq * 1.8,
      duration: 1.2,
      gain: 0.04,
      delay: i * 0.08,
      type: 'sine',
    })
  })
}

// Âm thanh khi nhấp chọn hành tinh trong Space Scene
export function playPlanetSelect() {
  if (!ready()) return
  tone({ freq: 587.33, duration: 0.25, gain: 0.04, type: 'triangle' })
  tone({ freq: 880, duration: 0.45, gain: 0.035, delay: 0.08, type: 'sine' })
}
