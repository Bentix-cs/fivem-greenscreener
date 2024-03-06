/// <reference types="@citizenfx/server" />
/// <reference types="image-js" />

const imagejs = require('image-js');
const fs = require('fs');

const resName = GetCurrentResourceName();
const mainSavePath = `resources/${resName}/images`;

try {
	if (!fs.existsSync(mainSavePath)) {
		fs.mkdirSync(mainSavePath);
	}

	onNet('takeScreenshot', async (filename, type) => {
		const savePath = `${mainSavePath}/${type}`;
		if (!fs.existsSync(savePath)) {
			fs.mkdirSync(savePath);
		}
		exports['screenshot-basic'].requestClientScreenshot(
			source,
			{
				fileName: savePath + '/' + filename + '.png',
				encoding: 'png',
				quality: 1.0,
			},
			async (err, fileName) => {
				let image = await imagejs.Image.load(fileName);
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

				image.save(fileName);
			}
		);
	});
} catch (error) {
	console.error(error.message);
}
