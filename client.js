/// <reference types="@citizenfx/client" />

const config = JSON.parse(LoadResourceFile(GetCurrentResourceName(), 'config.json'));

const Delay = (ms) => new Promise((res) => setTimeout(res, ms));

let cam;
let camInfo;
let ped;
let interval;
const playerId = PlayerId();

async function takeScreenshotForComponent(pedType, type, component, drawable, texture, cameraSettings) {
	const cameraInfo = cameraSettings ? cameraSettings : config.cameraSettings[type][component];

	setWeatherTime();

	await Delay(500);

	if (!camInfo || camInfo.zPos !== cameraInfo.zPos || camInfo.fov !== cameraInfo.fov) {
		camInfo = cameraInfo;

		if (cam) {
			DestroyAllCams(true);
			DestroyCam(cam, true);
			cam = null;
		}

		SetEntityRotation(ped, config.greenScreenRotation.x, config.greenScreenRotation.y, config.greenScreenRotation.z, 0, false);
		SetEntityCoordsNoOffset(ped, config.greenScreenPosition.x, config.greenScreenPosition.y, config.greenScreenPosition.z, false, false, false);

		await Delay(50);

		const [playerX, playerY, playerZ] = GetEntityCoords(ped);
		const [fwdX, fwdY, fwdZ] = GetEntityForwardVector(ped);

		const fwdPos = {
			x: playerX + fwdX * 1.2,
			y: playerY + fwdY * 1.2,
			z: playerZ + fwdZ + camInfo.zPos,
		};

		cam = CreateCamWithParams('DEFAULT_SCRIPTED_CAMERA', fwdPos.x, fwdPos.y, fwdPos.z, 0, 0, 0, camInfo.fov, true, 0);

		PointCamAtCoord(cam, playerX, playerY, playerZ + camInfo.zPos);
		SetCamActive(cam, true);
		RenderScriptCams(true, false, 0, true, false, 0);
	}

	await Delay(50);

	SetEntityHeading(ped, camInfo.rotation.z);

	emitNet('takeScreenshot', `${pedType}_${type == 'PROPS' ? 'prop_' : ''}${component}_${drawable}${texture ? `_${texture}`: ''}`);
	await Delay(2000);
	return;
}

async function takeScreenshotForObject(object, hash) {

	setWeatherTime();

	await Delay(500);

	if (cam) {
		DestroyAllCams(true);
		DestroyCam(cam, true);
		cam = null;
	}

	let [[minDimX, minDimY, minDimZ], [maxDimX, maxDimY, maxDimZ]] = GetModelDimensions(hash);
	let modelSize = {
		x: maxDimX - minDimX,
		y: maxDimY - minDimY,
		z: maxDimZ - minDimZ
	}
	let fov = Math.max(modelSize.x, modelSize.z) / 0.15 * 10;


	const [objectX, objectY, objectZ] = GetEntityCoords(object, false);
	const [fwdX, fwdY, fwdZ] = GetEntityForwardVector(object);

	const center = {
		x: objectX + (minDimX + maxDimX) / 2,
		y: objectY + (minDimY + maxDimY) / 2,
		z: objectZ + (minDimZ + maxDimZ) / 2,
	}

	const fwdPos = {
		x: center.x + fwdX * 1.2,
		y: center.y + fwdY * 1.2,
		z: center.z + fwdZ,
	};

	cam = CreateCamWithParams('DEFAULT_SCRIPTED_CAMERA', fwdPos.x, fwdPos.y, fwdPos.z, 0, 0, 0, fov, true, 0);

	PointCamAtCoord(cam, center.x, center.y, center.z);
	SetCamActive(cam, true);
	RenderScriptCams(true, false, 0, true, false, 0);

	await Delay(50);

	emitNet('takeScreenshot', `${hash}`);

	await Delay(2000);

	return;

}

function ClearAllPedProps() {
	for (const prop of Object.keys(config.cameraSettings.PROPS)) {
		ClearPedProp(ped, parseInt(prop));
	}
}

async function ResetPedComponents() {

	SetPedComponentVariation(ped, 0, 1, 1, 0); // Head
	SetPedComponentVariation(ped, 1, 1, 0, 0); // Mask
	SetPedComponentVariation(ped, 2, 1, 0, 0); // Hair
	SetPedComponentVariation(ped, 7, 1, 0, 0); // Accessories
	SetPedComponentVariation(ped, 5, 1, 0, 0); // Bags
	SetPedComponentVariation(ped, 6, 1, 0, 0); // Shoes
	SetPedComponentVariation(ped, 9, 1, 0, 0); // Armor
	SetPedComponentVariation(ped, 3, 1, 0, 0); // Torso
	SetPedComponentVariation(ped, 8, 1, 0, 0); // Undershirt
	SetPedComponentVariation(ped, 4, 1, 0, 0); // Legs
	SetPedComponentVariation(ped, 11, 1, 0, 0); // Top
	SetPedHairColor(ped, 2, 4);


	await Delay(50);

	SetPedComponentVariation(ped, 0, 0, 1, 0); // Head
	SetPedComponentVariation(ped, 1, 0, 0, 0); // Mask
	SetPedComponentVariation(ped, 2, -1, 0, 0); // Hair
	SetPedComponentVariation(ped, 7, 0, 0, 0); // Accessories
	SetPedComponentVariation(ped, 5, 0, 0, 0); // Bags
	SetPedComponentVariation(ped, 6, -1, 0, 0); // Shoes
	SetPedComponentVariation(ped, 9, 0, 0, 0); // Armor
	SetPedComponentVariation(ped, 3, -1, 0, 0); // Torso
	SetPedComponentVariation(ped, 8, -1, 0, 0); // Undershirt
	SetPedComponentVariation(ped, 4, -1, 0, 0); // Legs
	SetPedComponentVariation(ped, 11, -1, 0, 0); // Top
	SetPedHairColor(ped, 45, 15);

	ClearAllPedProps();

	return;
}

function setWeatherTime() {
	SetRainLevel(0.0);
	SetWeatherTypePersist('EXTRASUNNY');
	SetWeatherTypeNow('EXTRASUNNY');
	SetWeatherTypeNowPersist('EXTRASUNNY');
	NetworkOverrideClockTime(14, 0, 0);
	NetworkOverrideClockMillisecondsPerGameMinute(1000000);
}

function stopWeatherResource() {
	if ((GetResourceState('qb-weathersync') == 'started') || (GetResourceState('qbx_weathersync') == 'started')) {
		TriggerEvent('qb-weathersync:client:DisableSync');
		return true
	} else if (GetResourceState('weathersync') == 'started') {
		TriggerEvent('weathersync:toggleSync')
		return true
	} else if (GetResourceState('esx_wsync') == 'started') {
		SendNUIMessage({
			error: 'weathersync',
		});
		return false
	} else if (GetResourceState('cd_easytime') == 'started') {
		TriggerEvent('cd_easytime:PauseSync', false)
		return true
	} else if (GetResourceState('vSync') == 'started' || GetResourceState('Renewed-Weathersync') == 'started') {
		TriggerEvent('vSync:toggle', false)
		return true
	}
	return true
}

function startWeatherResource() {
	if ((GetResourceState('qb-weathersync') == 'started') || (GetResourceState('qbx_weathersync') == 'started')) {
		TriggerEvent('qb-weathersync:client:EnableSync');
	} else if (GetResourceState('weathersync') == 'started') {
		TriggerEvent('weathersync:toggleSync')
	} else if (GetResourceState('cd_easytime') == 'started') {
		TriggerEvent('cd_easytime:PauseSync', true)
	} else if (GetResourceState('vSync') == 'started' || GetResourceState('Renewed-Weathersync') == 'started') {
		TriggerEvent('vSync:toggle', true)
	}
}

RegisterCommand('screenshot', async (source, args) => {
	const modelHashes = [GetHashKey('mp_m_freemode_01'), GetHashKey('mp_f_freemode_01')];

	SendNUIMessage({
		start: true,
	});

	if (!stopWeatherResource()) return;

	DisableIdleCamera(true);


	await Delay(100);

	for (const modelHash of modelHashes) {
		if (IsModelValid(modelHash)) {
			if (!HasModelLoaded(modelHash)) {
				RequestModel(modelHash);
				while (!HasModelLoaded(modelHash)) {
					await Delay(100);
				}
			}

			SetPlayerModel(playerId, modelHash);
			await Delay(150);
			SetModelAsNoLongerNeeded(modelHash);

			ped = PlayerPedId();

			const pedType = modelHash === GetHashKey('mp_m_freemode_01') ? 'male' : 'female';
			SetEntityRotation(ped, config.greenScreenRotation.x, config.greenScreenRotation.y, config.greenScreenRotation.z, 0, false);
			SetEntityCoordsNoOffset(ped, config.greenScreenPosition.x, config.greenScreenPosition.y, config.greenScreenPosition.z, false, false, false);
			FreezeEntityPosition(ped, true);
			await Delay(50);
			SetPlayerControl(playerId, false);

			interval = setInterval(() => {
				ClearPedTasksImmediately(ped);
			}, 1);

			for (const type of Object.keys(config.cameraSettings)) {
				for (const stringComponent of Object.keys(config.cameraSettings[type])) {
					await ResetPedComponents();
					const component = parseInt(stringComponent);
					if (type === 'CLOTHING') {
						const drawableVariationCount = GetNumberOfPedDrawableVariations(ped, component);
						for (let drawable = 0; drawable < drawableVariationCount; drawable++) {
							const textureVariationCount = GetNumberOfPedTextureVariations(ped, component, drawable);
							SendNUIMessage({
								type: config.cameraSettings[type][component].name,
								value: drawable,
								max: drawableVariationCount,
							});
							if (config.includeTextures) {
								for (let texture = 0; texture < textureVariationCount; texture++) {
									SetPedPreloadVariationData(ped, component, drawable, texture);
									while (!HasPedPreloadVariationDataFinished(ped)) {
										await Delay(50);
									}
									SetPedComponentVariation(ped, component, drawable, texture, 0);
									await takeScreenshotForComponent(pedType, type, component, drawable, texture);
								}
							} else {
								SetPedPreloadVariationData(ped, component, drawable, 0);
								while (!HasPedPreloadVariationDataFinished(ped)) {
									await Delay(50);
								}
								SetPedComponentVariation(ped, component, drawable, 0, 0);
								await takeScreenshotForComponent(pedType, type, component, drawable);
							}
						}
					} else if (type === 'PROPS') {
						const propVariationCount = GetNumberOfPedPropDrawableVariations(ped, component);
						for (let prop = 0; prop < propVariationCount; prop++) {
							const textureVariationCount = GetNumberOfPedPropTextureVariations(ped, component, prop);
							SendNUIMessage({
								type: config.cameraSettings[type][component].name,
								value: prop,
								max: propVariationCount,
							});

							if (config.includeTextures) {
								for (let texture = 0; texture < textureVariationCount; texture++) {
									SetPedPreloadPropData(ped, component, drawable, texture);
									while (!HasPedPreloadPropDataFinished(ped)) {
										await Delay(50);
									}
									ClearPedProp(ped, component);
									SetPedPropIndex(ped, component, prop, texture, 0);
									await takeScreenshotForComponent(pedType, type, component, prop, texture);
								}
							} else {
								SetPedPreloadPropData(ped, component, drawable, 0);
								while (!HasPedPreloadPropDataFinished(ped)) {
									await Delay(50);
								}
								ClearPedProp(ped, component);
								SetPedPropIndex(ped, component, prop, 0, 0);
								await takeScreenshotForComponent(pedType, type, component, prop);
							}
						}
					}
				}
			}
			SetModelAsNoLongerNeeded(modelHash);
			SetPlayerControl(playerId, true);
			FreezeEntityPosition(ped, false);
			clearInterval(interval);
		}
	}
	startWeatherResource();
	SendNUIMessage({
		end: true,
	});
	DestroyAllCams(true);
	DestroyCam(cam, true);
	RenderScriptCams(false, false, 0, true, false, 0);
	camInfo = null;
	cam = null;
});

RegisterCommand('customscreenshot', async (source, args) => {

	const type = args[2].toUpperCase();
	const component = parseInt(args[0]);
	let drawable = args[1].toLowerCase() == 'all' ? args[1].toLowerCase() : parseInt(args[1]);
	let prop = args[1].toLowerCase() == 'all' ? args[1].toLowerCase() : parseInt(args[1]);
	const gender = args[3].toLowerCase();
	let cameraSettings;


	let modelHashes;

	if (gender == 'male') {
		modelHashes = [GetHashKey('mp_m_freemode_01')];
	} else if (gender == 'female') {
		modelHashes = [GetHashKey('mp_f_freemode_01')];
	} else {
		modelHashes = [GetHashKey('mp_m_freemode_01'), GetHashKey('mp_f_freemode_01')];
	}

	if (args[4] != null) {
		for (let i = 3; i < args.length; i++) {
			cameraSettings += args[i] + ' ';
		}

		cameraSettings = JSON.parse(cameraSettings);
	}


	if (!stopWeatherResource()) return;

	DisableIdleCamera(true);


	await Delay(100);

	for (const modelHash of modelHashes) {
		if (IsModelValid(modelHash)) {
			if (!HasModelLoaded(modelHash)) {
				RequestModel(modelHash);
				while (!HasModelLoaded(modelHash)) {
					await Delay(100);
				}
			}

			SetPlayerModel(playerId, modelHash);

			await Delay(50);

			ped = PlayerPedId();

			interval = setInterval(() => {
				ClearPedTasksImmediately(ped);
			}, 1);

			const pedType = modelHash === GetHashKey('mp_m_freemode_01') ? 'male' : 'female';
			SetEntityRotation(ped, config.greenScreenRotation.x, config.greenScreenRotation.y, config.greenScreenRotation.z, 0, false);
			SetEntityCoordsNoOffset(ped, config.greenScreenPosition.x, config.greenScreenPosition.y, config.greenScreenPosition.z, false, false, false);
			FreezeEntityPosition(ped, true);
			await Delay(50);
			SetPlayerControl(playerId, false);

			ResetPedComponents();

			if (drawable == 'all') {
				SendNUIMessage({
					start: true,
				});
				if (type === 'CLOTHING') {
					const drawableVariationCount = GetNumberOfPedDrawableVariations(ped, component);
					for (drawable = 0; drawable < drawableVariationCount; drawable++) {
						const textureVariationCount = GetNumberOfPedTextureVariations(ped, component, drawable);
						SendNUIMessage({
							type: config.cameraSettings[type][component].name,
							value: drawable,
							max: drawableVariationCount,
						});
						if (config.includeTextures) {
							for (let texture = 0; texture < textureVariationCount; texture++) {
								SetPedPreloadVariationData(ped, component, drawable, texture);
								while (!HasPedPreloadVariationDataFinished(ped)) {
									await Delay(50);
								}
								SetPedComponentVariation(ped, component, drawable, texture, 0);
								await takeScreenshotForComponent(pedType, type, component, drawable, texture, cameraSettings);
							}
						} else {
							SetPedPreloadVariationData(ped, component, drawable, 0);
							while (!HasPedPreloadVariationDataFinished(ped)) {
								await Delay(50);
							}
							SetPedComponentVariation(ped, component, drawable, 0, 0);
							await takeScreenshotForComponent(pedType, type, component, drawable, null, cameraSettings);
						}
					}
				} else if (type === 'PROPS') {
					const propVariationCount = GetNumberOfPedPropDrawableVariations(ped, component);
					for (prop = 0; prop < propVariationCount; prop++) {
						const textureVariationCount = GetNumberOfPedPropTextureVariations(ped, component, prop);
						SendNUIMessage({
							type: config.cameraSettings[type][component].name,
							value: prop,
							max: propVariationCount,
						});

						if (config.includeTextures) {
							for (let texture = 0; texture < textureVariationCount; texture++) {
								SetPedPreloadPropData(ped, component, drawable, texture);
								while (!HasPedPreloadPropDataFinished(ped)) {
									await Delay(50);
								}
								ClearPedProp(ped, component);
								SetPedPropIndex(ped, component, prop, texture, 0);
								await takeScreenshotForComponent(pedType, type, component, prop, texture, cameraSettings);
							}
						} else {
							SetPedPreloadPropData(ped, component, drawable, 0);
								while (!HasPedPreloadPropDataFinished(ped)) {
									await Delay(50);
								}
							ClearPedProp(ped, component);
							SetPedPropIndex(ped, component, prop, 0, 0);
							await takeScreenshotForComponent(pedType, type, component, prop, null, cameraSettings);
						}
					}
				}
			} else if (!isNaN(drawable)) {
				if (type === 'CLOTHING') {
					const textureVariationCount = GetNumberOfPedTextureVariations(ped, component, drawable);

					if (config.includeTextures) {
						for (let texture = 0; texture < textureVariationCount; texture++) {
							SetPedPreloadVariationData(ped, component, drawable, texture);
							while (!HasPedPreloadVariationDataFinished(ped)) {
								await Delay(50);
							}
							SetPedComponentVariation(ped, component, drawable, texture, 0);
							await takeScreenshotForComponent(pedType, type, component, drawable, texture, cameraSettings);
						}
					} else {
						SetPedPreloadVariationData(ped, component, drawable, 0);
						while (!HasPedPreloadVariationDataFinished(ped)) {
							await Delay(50);
						}
						SetPedComponentVariation(ped, component, drawable, 0, 0);
						await takeScreenshotForComponent(pedType, type, component, drawable, null, cameraSettings);
					}
				} else if (type === 'PROPS') {
					const textureVariationCount = GetNumberOfPedPropTextureVariations(ped, component, prop);

					if (config.includeTextures) {
						for (let texture = 0; texture < textureVariationCount; texture++) {
							SetPedPreloadPropData(ped, component, drawable, texture);
							while (!HasPedPreloadPropDataFinished(ped)) {
								await Delay(50);
							}
							ClearPedProp(ped, component);
							SetPedPropIndex(ped, component, prop, texture, 0);
							await takeScreenshotForComponent(pedType, type, component, prop, texture, cameraSettings);
						}
					} else {
						SetPedPreloadPropData(ped, component, drawable, 0);
						while (!HasPedPreloadPropDataFinished(ped)) {
							await Delay(50);
						}
						ClearPedProp(ped, component);
						SetPedPropIndex(ped, component, prop, 0, 0);
						await takeScreenshotForComponent(pedType, type, component, prop, null, cameraSettings);
					}
				}
			}
			SetModelAsNoLongerNeeded(modelHash);
			SetPlayerControl(playerId, true);
			FreezeEntityPosition(ped, false);
			clearInterval(interval);
		}
	}
	startWeatherResource();
	SendNUIMessage({
		end: true,
	});
	DestroyAllCams(true);
	DestroyCam(cam, true);
	RenderScriptCams(false, false, 0, true, false, 0);
	camInfo = null;
	cam = null;
});

RegisterCommand('screenshotobject', async (source, args) => {
	const modelHash = Number(args[0]);
	const ped = PlayerPedId();

	if (!stopWeatherResource()) return;

	DisableIdleCamera(true);


	await Delay(100);

	if (IsModelValid(modelHash)) {
		if (!HasModelLoaded(modelHash)) {
			RequestModel(modelHash);
			while (!HasModelLoaded(modelHash)) {
				await Delay(100);
			}
		}

		SetEntityCoordsNoOffset(ped, config.greenScreenPosition.x, config.greenScreenPosition.y - 2, config.greenScreenPosition.z - 2, false, false, false);

		SetPlayerControl(playerId, false);

		const object = CreateObjectNoOffset(modelHash, config.greenScreenPosition.x, config.greenScreenPosition.y, config.greenScreenPosition.z, false, true, true);

		SetEntityRotation(object, config.greenScreenRotation.x, config.greenScreenRotation.y, config.greenScreenRotation.z, 0, false);

		FreezeEntityPosition(object, true);

		await Delay(50);

		await takeScreenshotForObject(object, modelHash);


		DeleteEntity(object);
		SetPlayerControl(playerId, true);
		SetModelAsNoLongerNeeded(modelHash);
		startWeatherResource();
		DestroyAllCams(true);
		DestroyCam(cam, true);
		RenderScriptCams(false, false, 0, true, false, 0);
		cam = null;


	};
});

setImmediate(() => {
	emit('chat:addSuggestions', [
		{
			name: '/screenshot',
			help: 'generate clothing screenshots',
		},
		{
			name: '/customscreenshot',
			help: 'generate custom cloting screenshots',
			params: [
				{name:"component", help:"The clothing component to take a screenshot of"},
				{name:"drawable/all", help:"The drawable variation to take a screenshot of"},
				{name:"props/clothing", help:"PROPS or CLOTHING"},
				{name:"male/female/both", help:"The gender to take a screenshot of"},
				{name:"camera settings", help:"The camera settings to use for the screenshot (optional)"},
			]
		},
		{
			name: '/screenshotobject',
			help: 'generate object screenshots',
			params: [
				{name:"object", help:"The object hash to take a screenshot of"},
			]
		},
	])
  });

on('onResourceStop', (resName) => {
	if (GetCurrentResourceName() != resName) return;

	startWeatherResource();
	clearInterval(interval);
	SetPlayerControl(playerId, true);
	FreezeEntityPosition(ped, false);
});
