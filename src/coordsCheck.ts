import {
  displayGraffiti,
  findOrAddImage,
  Graffiti,
  graffitis,
  textures,
} from './graffiti'
import { getStencils } from './serverHandler'

// export let xCoord: number = 0
// export let yCoord: number = 0
export let currentCoords: coord = { x: 0, y: 0 }

export let fieldOfView: coord[] = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
  { x: -1, y: 1 },
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 1, y: -1 },
  { x: 0, y: -1 },
  { x: -1, y: -1 },
]

let MAX_RANGE = 4

export type coord = { x: number; y: number }

export let loadedCoords: coord[] = []

// system

export class CoordsCheck implements ISystem {
  timer: number = 0
  interval: number
  constructor(interval: number) {
    this.interval = interval
  }
  async update(dt: number) {
    this.timer += dt

    if (this.timer >= this.interval) {
      this.timer = 0
      currentCoords = getCurrentCoords()

      // remove far away stuff
      for (let i = 0; i < loadedCoords.length; i++) {
        if (checkDistance(currentCoords, loadedCoords[i]) > MAX_RANGE) {
          for (let j = 0; j < graffitis.length; j++) {
            if (graffitis[j].coords === loadedCoords[i]) {
              log('REMOVING LOADED GRAFFITIS')
              // remove paintings
              engine.removeEntity(graffitis[j])
              graffitis.splice(j)
            }
          }
          // remove coordinate from loadedCoords
          loadedCoords.splice(i)
        }
      }

      // check field of view
      for (let visibleCoord of fieldOfView) {
        let resultingCoord: coord = {
          x: (currentCoords.x += visibleCoord.x),
          y: (currentCoords.y += visibleCoord.y),
        }
        let coordIsNew: boolean = true
        for (let coordinate of loadedCoords) {
          if (
            currentCoords.x === coordinate.x &&
            currentCoords.y === coordinate.y
          ) {
            coordIsNew = false
            break
          }
        }
        if (coordIsNew) {
          loadedCoords.push({ x: resultingCoord.x, y: resultingCoord.y })
          let response = await getStencils(currentCoords.x, currentCoords.y)

          // paint
          if (response) {
            for (let stencil of response) {
              displayGraffiti(stencil, currentCoords)
            }
          }
        }
      }
    }
  }
}
engine.addSystem(new CoordsCheck(3))

// remove far away coords from loadedcords

export function getCurrentCoords() {
  let pos = Camera.instance.position.clone()

  let coords: coord = { x: Math.floor(pos.x / 16), y: Math.floor(pos.z / 16) }

  return coords
}

export function checkDistance(coordsA: coord, coordsB: coord) {
  let totalDist = Math.abs(coordsA.x - coordsB.x)
  totalDist += Math.abs(coordsA.y - coordsB.y)
  return totalDist
}
