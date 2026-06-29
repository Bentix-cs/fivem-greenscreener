/// <reference types="@citizenfx/server" />
/// <reference types="image-js" />

const imagejs = require('image-js');
const fs = require('fs');

const resName = GetCurrentResourceName();
const config = JSON.parse(LoadResourceFile(GetCurrentResourceName(), "config.json"));
const configuredSavePath = config.outputPathConvar
	? GetConvar(config.outputPathConvar, '')
	: '';
const mainSavePath = configuredSavePath && configuredSavePath.trim().length > 0
	? configuredSavePath
	: config.outputPath && config.outputPath.trim().length > 0
		? config.outputPath
		: `resources/${resName}/images`;

function ensureDirectory(path) {
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path, { recursive: true });
	}
}

try {
	ensureDirectory(mainSavePath);

	onNet('takeScreenshot', async (filename, type) => {
		const savePath = `${mainSavePath}/${type}`;
		ensureDirectory(savePath);

		const fullFilePath = savePath + "/" + filename + ".png";

		// Check if file exists and overwrite is disabled
		if (!config.overwriteExistingImages && fs.existsSync(fullFilePath)) {
			if (config.debug) {
				console.log(
					`DEBUG: Skipping existing file: ${filename}.png (overwriteExistingImages = false)`
				);
			}
			return;
		}

		if (config.debug) {
			console.log(`DEBUG: Processing screenshot: ${filename}.png`);
		}

		// Note: we intentionally do NOT pass `fileName` to screenshot-basic.
		// With a fileName set, screenshot-basic moves the staged upload into this
		// resource's folder, which trips FiveM's cross-resource fs.write permission
		// check on recent FXServer builds. Instead we request the screenshot as a
		// base64 data URI and write it ourselves, since a resource is always allowed
		// to write to its own folder.
		exports['screenshot-basic'].requestClientScreenshot(
			source,
			{
				encoding: 'png',
				quality: 1.0,
			},
			async (err, data) => {
				if (err) {
					console.error(`Screenshot failed for ${filename}.png: ${err}`);
					return;
				}

				let image = await imagejs.Image.load(data);

				// Apply greenscreen removal
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

				// Cop image
				let minX = image.width;
				let maxX = -1;
				let minY = image.height;
				let maxY = -1;

				for (let x = 0; x < image.width; x++) {
					for (let y = 0; y < image.height; y++) {
						const pixelArr = image.getPixelXY(x, y);
						const alpha = pixelArr[3];

						if (alpha > 0) {
							minX = Math.min(minX, x);
							maxX = Math.max(maxX, x);
							minY = Math.min(minY, y);
							maxY = Math.max(maxY, y);
						}
					}
				}


				// Save image
				if (maxX >= minX && maxY >= minY) {
					const contentWidth = maxX - minX + 1;
					const contentHeight = maxY - minY + 1;

					const croppedImage = image.crop({
						x: minX,
						y: minY,
						width: contentWidth,
						height: contentHeight
					});

					image.data = croppedImage.data;
					image.width = croppedImage.width;
					image.height = croppedImage.height;
				}

				image.save(fullFilePath);
			}
		);
	});
} catch (error) {
	console.error(error.message);
}
