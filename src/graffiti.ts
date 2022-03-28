import { coord, getCurrentCoords } from './coordsCheck'
import { sceneMessageBus, StencilData, stencilType } from './serverHandler'

export let mode: stencilType = stencilType.URL

export let selectedGraffiti = 0

export const nftIds: string[] = []

export const textureURLs: string[] = []
textureURLs.push('assets/dcl.jpg')
textureURLs.push('assets/icon.png')

export const textures: Texture[] = []

for (const textureURL of textureURLs) {
  textures.push(new Texture(textureURL))
}

export const materials: Material[] = []

for (const texture of textures) {
  const newMaterial = new Material()
  newMaterial.albedoTexture = texture
  materials.push(newMaterial)
}

export const graffitis: Graffiti[] = []

export class Graffiti extends Entity {
  coords: coord
  type: stencilType
  constructor(
    image: string,
    position: Vector3,
    coords: coord,
    rotation: Quaternion,
    type?: stencilType
  ) {
    super()
    engine.addEntity(this)

    this.addComponent(
      new Transform({
        position: position,
        rotation: new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
      })
    )

    if (type === stencilType.NFT) {
      this.addComponent(new NFTShape(image, { style: PictureFrameStyle.None }))
      // rotate to compensate
      this.getComponent(Transform).rotate(new Vector3(0, 0, 1), 180)
      this.type = stencilType.NFT
    } else {
      this.addComponent(new PlaneShape())
      const imageIndex = findOrAddImage(image)
      this.addComponent(materials[imageIndex])
      this.type = stencilType.URL
    }

    // if (hitNormal) {
    //   // only rotate if from messagebus, not server
    //   this.getComponent(Transform).rotate(new Vector3(0, 0, 1), 180)
    // }

    this.coords = coords
    graffitis.push(this)
  }
}

export function findOrAddImage(url: string) {
  for (let i = 0; i > textureURLs.length; i++) {
    if (url === textureURLs[i]) {
      return i
    }
  }
  // ... if not in current list
  addGraffitiImage(url)

  log('New image ', url)
  return textureURLs.length - 1
}

export function displayGraffiti(stencil: StencilData, coords: coord) {
  log('drawing graffiti at', stencil.position)

  if (stencil.type && stencil.type === stencilType.NFT && stencil.nft) {
    const graffiti = new Graffiti(
      stencil.nft,
      stencil.position,
      coords,
      stencil.rotation
    )
  } else if (stencil.url) {
    const textureId = findOrAddImage(stencil.url)
    const graffiti = new Graffiti(
      textureURLs[textureId],
      stencil.position,
      coords,
      stencil.rotation
    )
  }
}

export function addGraffitiImage(url: string, makeCurrent?: boolean) {
  textureURLs.push(url)
  textures.push(new Texture(textureURLs[textureURLs.length - 1]))
  const newMaterial = new Material()
  newMaterial.albedoTexture = textures[textures.length - 1]
  materials.push(newMaterial)

  if (makeCurrent) {
    selectedGraffiti = textureURLs.length - 1
    mode = stencilType.URL
  }
}

export function addNFT(nft: string, makeCurrent?: boolean) {
  nftIds.push(nft)

  if (makeCurrent) {
    selectedGraffiti = nftIds.length - 1
    mode = stencilType.NFT
  }
}

export function setExistingGraffiti(index: number) {
  selectedGraffiti = index
  mode = stencilType.URL
}

export class DummyEnt extends Entity {
  constructor(position: Vector3, hitNormal: Vector3) {
    super()
    engine.addEntity(this)

    this.addComponent(new Transform({}))

    this.getComponent(Transform).lookAt(hitNormal)

    this.getComponent(Transform).position = position

    this.getComponent(Transform).rotate(new Vector3(0, 0, 1), 180)
    this.getComponent(Transform).rotate(new Vector3(0, 1, 0), 180)
  }
}
