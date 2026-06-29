/// <reference types="@citizenfx/server" />
/// <reference types="image-js" />

const imagejs = require('image-js');
const fs = require('fs');

const resName = GetCurrentResourceName();
const mainSavePath = `resources/${resName}/images`;
const config = JSON.parse(LoadResourceFile(GetCurrentResourceName(), "config.json"));

try {
	if (!fs.existsSync(mainSavePath)) {
		fs.mkdirSync(mainSavePath);
	}

	onNet('takeScreenshot', async (filename, type) => {
		const savePath = `${mainSavePath}/${type}`;
		if (!fs.existsSync(savePath)) {
			fs.mkdirSync(savePath);
		}

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
		// Doing so would make screenshot-basic move the file into this resource's
		// folder, which trips FiveM's cross-resource fs.write permission check.
		// Instead we request the screenshot as a base64 data URI and write it
		// ourselves, since a resource is always allowed to write to its own folder.
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

	// --- /clothes panel support ------------------------------------------------
	// Clothing and props are both written into images/clothing.
	const clothingPath = `${mainSavePath}/clothing`;

	// Returns the PNG filenames already on disk so the panel can show how many
	// are done and skip them when resuming a run. The client matches these names
	// against the ones it is about to capture.
	onNet('greenscreener:requestState', () => {
		const src = source; // capture before any await/emit
		let existing = [];
		try {
			if (fs.existsSync(clothingPath)) {
				existing = fs.readdirSync(clothingPath).filter((f) => f.toLowerCase().endsWith('.png'));
			}
		} catch (e) {
			console.error(`greenscreener: error reading state: ${e.message}`);
		}
		emitNet('greenscreener:state', src, { existing });
	});
} catch (error) {
	console.error(error.message);
}
