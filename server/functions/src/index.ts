import firebase from 'firebase'
import * as functions from 'firebase-functions'
import { checkPlayerPos } from './checkParcels'
const express = require('express')
const cors = require('cors')

var admin = require('firebase-admin')

var serviceAccount = require('./../keys/permissions.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

export const TESTS_ENABLED = true

const blackListedIPS = [
  `14.161.47.252`,
  `170.233.124.66`,
  `2001:818:db0f:7500:3576:469a:760a:8ded`,
  `85.158.181.20`,
  `185.39.220.232`,
  `178.250.10.230`,
  `185.39.220.156`,
]

type Position = { x: number; y: number; z: number }

type Quaternion = { x: number; y: number; z: number; w: number }

type StencilData = {
  url?: string
  author: string
  timeStamp: number
  position: Position
  rotation: Quaternion
  type?: stencilType
  nft?: string
}

enum stencilType {
  NFT = 'nft',
  URL = 'url',
}

//type DBData = { stencils: StencilData[] }

export function checkBannedIPs(req: any, res: any) {
  for (let ip of blackListedIPS) {
    if (req.header('X-Forwarded-For') === ip)
      return res.status(200).send({ success: false, reason: 'Blocked IP' })
  }

  if (
    req.header('origin') != 'https://play.decentraland.org' &&
    req.header('origin') != 'https://play.decentraland.zone' &&
    !TESTS_ENABLED
  ) {
    return res.status(200).send({ success: false, reason: 'Blocked Domain' })
  }
}

const db = admin.firestore()

const app = express()
app.use(cors({ origin: true }))

app.get('/hello-world', (req: any, res: any) => {
  return res.status(200).send('Hello World!')
})

app.get('/get-stencils', async (req: any, res: any) => {
  const xcoord: number = req.query.xcoord
  const ycoord: number = req.query.ycoord
  const server: string = req.query.server
  const realm: string = req.query.realm

  let coords = String(xcoord) + ',' + String(ycoord)

  let dbName = 'graffiti-' + server + '-' + realm
  checkBannedIPs(req, res)

  try {
    console.log('Fetching from ', dbName, ' coords ', coords)

    let docRef = await db.collection(dbName).doc(coords)
    docRef.get().then((doc: any) => {
      if (doc.exists) {
        return res.status(200).send({
          success: true,
          stencils: doc.data(),
        })
      } else {
        return res.status(200).send({
          success: true,
          stencils: null,
        })
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ success: false, error })
  }
})

app.post('/add-stencil', async (req: any, res: any) => {
  const url: string = req.body.url ? req.body.url : null
  const nft: string = req.body.nft ? req.body.nft : null
  const type: stencilType = req.body.type
  const position: Position = req.body.position
  const rotation: Quaternion = req.body.rotation
  //const timeStamp: number = req.body.timeStamp
  const author: string = req.body.author
  const xCoord: number = req.body.xCoord
  const yCoord: number = req.body.yCoord
  const server: string = req.body.server
  const realm: string = req.body.realm

  let dbName = 'graffiti-' + server + '-' + realm
  checkBannedIPs(req, res)

  try {
    if (!TESTS_ENABLED) {
      let parcel = await checkPlayerPos(author, server, realm, xCoord, yCoord)

      if (parcel === false) {
        return res
          .status(500)
          .send({ success: false, reason: 'player not in reported location' })
      }
    }

    let graffitiDB = db.collection(dbName)

    let newStencil: StencilData = {
      author: author,
      position: position,
      rotation: rotation,
      timeStamp: Date.now(),
      url: url,
      nft: nft,
      type: type,
    }

    let coordName = '/' + String(xCoord) + ',' + String(yCoord) + '/'

    let coordinates = await graffitiDB.doc(coordName).get()

    if (!coordinates.exists) {
      console.log('creating new doc, ', coordName, ' in ', dbName)
      await graffitiDB.doc(coordName).create({ stencils: [newStencil] })
    } // if ((await coordinates.stencils.get().length) < 10)
    else {
      await graffitiDB.doc(coordName).update({
        stencils: firebase.firestore.FieldValue.arrayUnion(newStencil),
      })
      return res.status(200).send({ success: true, msg: 'Added stencil!' })
    }
    // else {
    //   return res.status(200).send({ success: false, msg: 'Area too crowded!' })
    // }
  } catch (error) {
    console.log(error)
    return res.status(500).send({ success: false, error: error })
  }
})

// cleanup function run regularly to remove if timestamp older than 1 day

exports.app = functions.https.onRequest(app)
