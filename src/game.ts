import {
  checkDistance,
  coord,
  currentCoords,
  getCurrentCoords,
} from './coordsCheck'
import {
  DummyEnt,
  Graffiti,
  mode,
  nftIds,
  selectedGraffiti,
  textures,
  textureURLs,
} from './graffiti'
import { postStencil, sceneMessageBus, stencilType } from './serverHandler'
import { addUI } from './ui'

Input.instance.subscribe('BUTTON_DOWN', ActionButton.PRIMARY, true, (event) => {
  if (event.hit && event.hit.entityId !== '' && event.hit.length < 8) {
    let offset = Vector3.Normalize(
      Camera.instance.position.clone().subtract(event.hit.hitPoint.clone())
    ).scale(0.1)

    let finalPosition = event.hit.hitPoint.add(offset)

    let dummy = new DummyEnt(finalPosition, event.hit.normal)

    sceneMessageBus.emit('paintGraffiti', {
      position: dummy.getComponent(Transform).position,
      rotation: dummy.getComponent(Transform).rotation,
      coords: currentCoords,
      type: mode,
      image:
        mode === stencilType.URL
          ? textureURLs[selectedGraffiti]
          : nftIds[selectedGraffiti],
    })

    postStencil(
      mode === stencilType.URL ? textureURLs[selectedGraffiti] : undefined,
      mode === stencilType.NFT ? nftIds[selectedGraffiti] : undefined,
      mode,
      currentCoords.x,
      currentCoords.y,
      dummy.getComponent(Transform).position,
      dummy.getComponent(Transform).rotation
    )
  } else {
    log('No wall to paint on')
  }

  //   log(
  //     'OFFSET:',
  //     offset,
  //     'PLAYER: ',
  //     Camera.instance.position,
  //     'HIT: ',
  //     event.hit.hitPoint
  //   )
})

sceneMessageBus.on('paintGraffiti', (e) => {
  if (checkDistance(e.coords, currentCoords) > 6) return

  const graffiti = new Graffiti(
    e.image,
    e.position,
    e.coords,
    e.rotation,
    e.type
  )
})

addUI()

let testCube = new Entity()
testCube.addComponent(
  new Transform({ position: new Vector3(4, 2, 4), scale: new Vector3(8, 8, 8) })
)
testCube.addComponent(new BoxShape())
engine.addEntity(testCube)
