/// <reference types="@citizenfx/server" />
/// <reference types="image-js" />

const imagejs = require('image-js')

Delay = ms => new Promise(res => setTimeout(res, ms))

onNet('takeScreenshot', async filename => {
  exports['screenshot-basic'].requestClientScreenshot(source, {
    fileName: 'resources/fivem-greenscreener/images/' + filename + '.png',
    encoding: 'png',
    quality: 1.0
  })

  await Delay(2000)

  let image = await imagejs.Image.load(
    'resources/fivem-greenscreener/images/' + filename + '.png'
  )
  const coppedImage = image.crop({ x: image.width / 4.5, width: image.height })

  image.data = coppedImage.data
  image.width = coppedImage.width
  image.height = coppedImage.height

  await image.save(
    'resources/fivem-greenscreener-js/images/' + filename + '.png'
  )
})
