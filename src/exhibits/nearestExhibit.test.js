import assert from 'node:assert/strict'
import test from 'node:test'
import { nearestExhibitId } from './nearestExhibit.js'

const exhibits = [
  { id: 'book', position: [2, 0, -2.6] },
  { id: 'gem', position: [6, 0, -2.6] },
]

test('shows no exhibit outside interaction range', () => {
  assert.equal(nearestExhibitId({ x: 2, z: 1 }, exhibits, 3), null)
})

test('selects the nearest exhibit within range, including from the center aisle', () => {
  assert.equal(nearestExhibitId({ x: 2, z: 0 }, exhibits, 3), 'book')
  assert.equal(nearestExhibitId({ x: 5, z: -2.6 }, exhibits, 3), 'gem')
})

test('uses horizontal distance independent of exhibit height', () => {
  assert.equal(nearestExhibitId({ x: 2, y: 0, z: -2.6 }, [{ id: 'sign', position: [2, 1.5, -2.6] }], 1), 'sign')
})
