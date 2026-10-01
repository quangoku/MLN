import assert from 'node:assert/strict'
import test from 'node:test'
import { DOORWAYS, WALLS, roomAt } from './layout.js'
import { resolveBoxes } from './collision.js'
import { PLAYER } from '../config/constants.js'

test('the entrance approach is clear in both directions', () => {
  for (const direction of [1, -1]) {
    const pos = { x: 0, z: direction === 1 ? 5.8 : 10 }
    for (let step = 0; step < 42; step++) {
      pos.z += direction * 0.1
      const expected = { ...pos }
      resolveBoxes(pos, PLAYER.radius)
      assert.ok(Math.abs(pos.x - expected.x) < 1e-8 && Math.abs(pos.z - expected.z) < 1e-8,
        `Entrance obstruction at ${JSON.stringify(expected)}`)
    }
    assert.equal(roomAt(pos.x, pos.z).id, direction === 1 ? 'vestibule' : 'lobby')
  }
})

test('partition walls stop outside the doorposts', () => {
  for (const door of DOORWAYS) {
    const along = door.axis === 'x' ? 'x' : 'z'
    const across = door.axis === 'x' ? 'z' : 'x'
    const outerPostEdge = door.width / 2 + 0.3
    const adjoining = WALLS.filter(wall => wall.axis === door.axis && wall[across] === door[across])
    for (const wall of adjoining) {
      const start = wall[along] - wall.length / 2 - door[along]
      const end = wall[along] + wall.length / 2 - door[along]
      assert.ok(end <= -outerPostEdge + 1e-8 || start >= outerPostEdge - 1e-8,
        `Wall overlaps ${door.id}'s posts`)
    }
  }
})

test('solid wall beside the entrance still blocks movement', () => {
  const pos = { x: 2, z: 7.5 }
  for (let step = 0; step < 20; step++) {
    pos.z += 0.1
    resolveBoxes(pos, PLAYER.radius)
  }
  assert.ok(pos.z < 8)
})

test('all four door openings remain traversable and their posts remain solid', () => {
  for (const door of DOORWAYS) {
    const along = door.axis === 'x' ? 'x' : 'z'
    const across = door.axis === 'x' ? 'z' : 'x'
    for (const lane of [-0.8, 0, 0.8]) {
      const pos = { x: door.x, z: door.z }
      pos[along] += lane
      pos[across] -= 0.6
      for (let step = 0; step < 12; step++) {
        pos[across] += 0.1
        const expected = { ...pos }
        resolveBoxes(pos, PLAYER.radius)
        assert.ok(Math.hypot(pos.x - expected.x, pos.z - expected.z) < 1e-8, door.id)
      }
    }
    const pos = { x: door.x, z: door.z }
    pos[along] += door.width / 2 + 0.15
    pos[across] -= 0.6
    for (let step = 0; step < 12; step++) {
      pos[across] += 0.1
      resolveBoxes(pos, PLAYER.radius)
    }
    assert.ok(pos[across] < door[across], `Walked through a post of ${door.id}`)
  }
})
