import { getUserData, UserData } from '@decentraland/Identity'
import {
  getCurrentRealm,
  isPreviewMode,
  Realm
} from '@decentraland/EnvironmentAPI'

export const sceneMessageBus = new MessageBus()

export let userData: UserData
export let playerRealm: Realm

export type StencilData = {
  url?: string
  author: string
  timeStamp: number
  position: Vector3
  rotation: Quaternion
  type?: stencilType
  nft?: string
}

export enum stencilType {
  NFT = 'nft',
  URL = 'url'
}

export const fireBaseServer =
  'https://us-central1-dclportableexp.cloudfunctions.net/app/'

export async function setUserData() {
  const data = await getUserData()
  if (!data) return
  log(data.publicKey)
  userData = data
}

// fetch the player's realm
export async function setRealm() {
  const realm = await getCurrentRealm()
  if (!realm) return
  log(`You are in the realm: ${JSON.stringify(realm.displayName)}`)
  playerRealm = realm
}

export async function getStencils(
  x: number,
  y: number
): Promise<StencilData[]> {
  if (!playerRealm) {
    await setRealm()
  }
  const url =
    fireBaseServer +
    'get-stencils/?xcoord=' +
    x +
    '&ycoord=' +
    y +
    '&server=' +
    playerRealm.serverName +
    '&realm=' +
    playerRealm.layer
  try {
    const response = await fetch(url)
    const json = await response.json()
    log('New stencils: ', json, ' from URL: ', url)
    if (json.success) {
      return json.stencils.stencils
    } else {
      return []
    }
  } catch {
    log('error fetching from token server ', url)
    return []
  }
}

export async function postStencil(
  stencilURL: string | undefined,
  stencilNFT: string | undefined,
  type: stencilType,
  x: number,
  y: number,
  position: Vector3,
  rotation: Quaternion
) {
  if (!userData) {
    await setUserData()
  }
  if (!playerRealm) {
    await setRealm()
  }

  const url = fireBaseServer + 'add-stencil'

  const body = {
    url: stencilURL,
    nft: stencilNFT,
    type: type,
    position: { x: position.x, y: position.y, z: position.z },
    rotation: { x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w },
    xCoord: x,
    yCoord: y,
    author: userData.displayName,
    timeStamp: Date.now(),
    server: playerRealm.serverName,
    realm: playerRealm.layer
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const json = await response.json()
    log('New stencils: ', json)
    return json
  } catch {
    log('error posting stencil ', url)
  }
}

export async function fetchFromOpenSea(contractAndId: string) {
  const url = 'https://api.opensea.io/api/v1/asset/' + contractAndId + '/'
  try {
    const response = await fetch(url)
    const json = await response.json()

    if (json.image_preview_url) {
      return json.image_preview_url
    } else {
      return null
    }
  } catch {
    log('error fetching from OpenSea API ', url)
  }
}
