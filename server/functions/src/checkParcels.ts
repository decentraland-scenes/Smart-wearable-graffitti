import { TESTS_ENABLED } from '.'

export const allowedParcels: any = {}

const serverList: any = {
  fenrir: { url: 'peer.decentraland.org' },
  hermes: { url: 'peer-ec1.decentraland.org' },
  baldr: { url: 'peer-wc1.decentraland.org' },
  hera: { url: 'peer-eu1.decentraland.org' },
  freyja: { url: 'peer-ap1.decentraland.org' },
  loki: { url: 'interconnected.online' },
  hades: { url: 'peer.decentral.games' },
  poseidon: { url: 'peer.melonwave.com' },
  cn86: { url: 'decentraland.org.cn' },
  unicorn: { url: 'peer.kyllian.me' },
  thor: { url: 'peer.uadevops.com' },
  odin: { url: 'peer.dclnodes.io' },
  //   hades: { url: 'peer.manaland.cn' },
  //   freyja: { url: 'bot1-catalyst.decentraland.org' },
  //athena: { url: 'peer.decentraland.zone' },
  hephaestus: { url: 'bot1-catalyst.decentraland.zone' },
  //hermes: { url: 'bot2-katalyst.decentraland.zone' },
  athena: { url: 'peer-testing.decentraland.org' },
}

export async function checkPlayerPos(
  id: string,
  server: string,
  realm: string,
  xCoord: number,
  yCoord: number
) {
  if (server === 'localhost' && realm === 'stub' && TESTS_ENABLED) {
    return true
  }

  let serverURL: string = serverList[server].url

  const url = 'https://' + serverURL + '/comms/layers/' + realm + '/users'
  console.log('URL being used: ', url)

  try {
    let response = await fetch(url)
    let data = await response.json()

    for (let player of data) {
      if (player.address.toLowerCase() === id.toLowerCase()) {
        console.log('found player')

        if (matchChoords(player.parcel, xCoord, yCoord, 2)) {
          return player.parcel
        }
      }
    }
  } catch (error) {
    console.log(error)
    return false
  }

  return false
}

export function matchChoords(
  coords: number[],
  xCoord: number,
  yCoord: number,
  precision: number
) {
  let xDif = Math.abs(coords[0] - xCoord)
  let yDif = Math.abs(coords[1] - yCoord)

  if (xDif + yDif < precision) {
    return true
  } else {
    console.log('player in other parcels ', coords)
    return false
  }
}
