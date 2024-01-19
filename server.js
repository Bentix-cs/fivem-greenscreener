/// <reference types="@citizenfx/server" />
/// <reference types="image-js" />

const imagejs = require('image-js');
const fs = require('fs');

const resName = GetCurrentResourceName();
const savePath = `resources/${resName}/images`;

try {
	if (!fs.existsSync(savePath)) {
		fs.mkdirSync(savePath);
	}

	const Delay = (ms) => new Promise((res) => setTimeout(res, ms));

	onNet('takeScreenshot', async (filename) => {
		exports['screenshot-basic'].requestClientScreenshot(source, {
			fileName: savePath + '/' + filename + '.png',
			encoding: 'png',
			quality: 1.0,
		});

		await Delay(2000);

		let image = await imagejs.Image.load(savePath + '/' + filename + '.png');
		const coppedImage = image.crop({ x: image.width / 4.5, width: image.height });

		image.data = coppedImage.data;
		image.width = coppedImage.width;
		image.height = coppedImage.height;

		for (let x = 0; x < image.width; x++) {
			for (let y = 0; y < image.height; y++) {
				const pixelArr = image.getPixelXY(x, y);
				const r = pixelArr[0];
				const g = pixelArr[1];
				const b = pixelArr[2];

				if (g > r + b) {
					image.setPixelXY(x, y, [255, 255, 255, 0]);
				}
			}
		}

		await image.save(savePath + '/' + filename + '.png');
	});
} catch (error) {
	console.error(error.message);
}
