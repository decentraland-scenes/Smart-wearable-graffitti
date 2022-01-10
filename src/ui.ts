import * as ui from '@dcl/ui-scene-utils'
import { addGraffitiImage, addNFT, mode, setExistingGraffiti } from './graffiti'
import { fetchFromOpenSea, stencilType } from './serverHandler'

export function addUI() {
  let uiHint = new ui.SmallIcon('assets/icon.png', -50, 350, 50, 50, {
    sourceWidth: 256,
    sourceHeight: 256,
  })

  uiHint.image.onClick = new OnClick(() => {
    // new ui.FillInPrompt('Set the Contract/id of NFT to show', async (e) => {
    //   let newURL = await fetchFromOpenSea(e)
    //   addGraffitiImage(newURL, true)
    // })
    graffitiUi.show()
  })
}

let graffitiUi = new ui.CustomPrompt(
  ui.PromptStyles.DARKLARGE,
  undefined,
  undefined,
  true
)
graffitiUi.addText('CHANGE STENCILS', 0, 180, Color4.Red(), 20)
graffitiUi.addText(
  'Choose a new image to use on your graffitis',
  0,
  160,
  Color4.Gray(),
  16
)
let chb1 = graffitiUi.addButton('Default1', 0, 100, () => {
  setExistingGraffiti(0)
  graffitiUi.hide()
})
let chb2 = graffitiUi.addButton('Default2', 0, 30, () => {
  setExistingGraffiti(1)
  graffitiUi.hide()
})

let URLMenuButton = graffitiUi.addButton('From URL', 0, -40, () => {
  chb1.hide()
  chb2.hide()
  URLMenuButton.hide()
  NFTMenuButton.hide()

  let URLText = graffitiUi.addTextBox(0, 50, 'Image URL', (e: any) => {
    currentURLText = e
  })
  URLText.fillInBox.textWrapping = true
  let currentURLText = ''
  let URLButton = graffitiUi.addButton('Set URL', 0, -50, () => {
    addGraffitiImage(currentURLText, true)

    URLText.hide()
    URLButton.hide()
    graffitiUi.hide()
  })
})

let NFTMenuButton = graffitiUi.addButton('From NFT', 0, -100, () => {
  chb1.hide()
  chb2.hide()
  URLMenuButton.hide()
  NFTMenuButton.hide()

  let NFTText1 = graffitiUi.addTextBox(0, 50, 'NFT contract', (e: any) => {
    currentNFTText1 = e
  })

  let NFTText2 = graffitiUi.addTextBox(0, -30, 'NFT id', (e: any) => {
    currentNFTText2 = e
  })
  NFTText1.fillInBox.textWrapping = true
  NFTText2.fillInBox.textWrapping = true
  NFTText1.fillInBox.fontSize = 10
  NFTText2.fillInBox.fontSize = 10
  let currentNFTText1 = ''
  let currentNFTText2 = ''
  let NFTButton = graffitiUi.addButton('Set NFT', 0, -110, () => {
    addNFT('ethereum://' + currentNFTText1 + '/' + currentNFTText2, true)
    NFTText1.hide()
    NFTText2.hide()
    NFTButton.hide()
    graffitiUi.hide()
  })
})
