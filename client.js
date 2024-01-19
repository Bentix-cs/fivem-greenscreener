/// <reference types="@citizenfx/client" />

const config = JSON.parse(LoadResourceFile(GetCurrentResourceName(), 'config.json'));

const Delay = (ms) => new Promise((res) => setTimeout(res, ms));

let cam;
let camInfo;
let ped;
const playerId = PlayerId();

async function takeScreenshotForComponent(pedType, type, component, drawable, texture) {
	const cameraInfo = config.cameraSettings[type][component];

	if (!camInfo) {
		camInfo = cameraInfo;

		if (cam) {
			DestroyAllCams(true);
			DestroyCam(cam, true);
			cam = null;
		}

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
	} else if (camInfo.zPos !== cameraInfo.zPos || camInfo.fov !== cameraInfo.fov) {
		camInfo = cameraInfo;
		const [playerX, playerY, playerZ] = GetEntityCoords(ped);
		PointCamAtCoord(cam, playerX, playerY, playerZ + camInfo.zPos);
		SetCamFov(cam, camInfo.fov);
	}

	await Delay(50);

	SetEntityHeading(ped, camInfo.rotation.z);
	setWeatherTime();

	emitNet('takeScreenshot', `${pedType}_${type == 'PROPS' ? 'prop_' : ''}${component}_${drawable}${texture ? `_${texture}`: ''}`);
	await Delay(2000);
	return;
}

function ClearAllPedProps() {
	for (const prop of Object.keys(config.cameraSettings.PROPS)) {
		ClearPedProp(ped, parseInt(prop));
	}
}

function ResetPed(gender) {
	if (gender == 'male') {
		SetPedHeadBlendData(0, 0, 0, 31, 31, 31, 1, 1, 1);
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
	} else {
		SetPedHeadBlendData(45, 45, 45, 31, 31, 31, 1, 1, 1);
		SetPedComponentVariation(ped, 0, 0, 1, 0); // Head
		SetPedComponentVariation(ped, 1, 0, 0, 0); // Mask
		SetPedComponentVariation(ped, 2, -1, 0, 0); // Hair
		SetPedComponentVariation(ped, 5, 0, 0, 0); // Bags
		SetPedComponentVariation(ped, 9, 0, 0, 0); // Armor
		SetPedComponentVariation(ped, 7, 0, 0, 0); // Accessories
		SetPedComponentVariation(ped, 6, -1, 0, 0); // Shoes
		SetPedComponentVariation(ped, 3, -1, 0, 0); // Torso
		SetPedComponentVariation(ped, 8, -1, 0, 0); // Undershirt
		SetPedComponentVariation(ped, 4, -1, 0, 0); // Legs
		SetPedComponentVariation(ped, 11, -1, 0, 0); // Top
		SetPedHairColor(ped, 45, 15);
	}
	ClearAllPedProps();
}

function setWeatherTime() {
	SetRainLevel(0.0);
	SetWeatherTypePersist('EXTRASUNNY');
	SetWeatherTypeNow('EXTRASUNNY');
	SetWeatherTypeNowPersist('EXTRASUNNY');
	NetworkOverrideClockTime(14, 0, 0);
	NetworkOverrideClockMillisecondsPerGameMinute(1000000);
}

RegisterCommand('screenshot', async (source, args) => {
	ped = PlayerPedId();
	const modelHashes = [GetHashKey('mp_m_freemode_01'), GetHashKey('mp_f_freemode_01')];

	SendNUIMessage({
		start: true,
	});

	if (
		GetResourceState('qb-weathersync') == 'started' ||
		GetResourceState('qbx_weathersync') == 'started' ||
		GetResourceState('weathersync') == 'started' ||
		GetResourceState('esx_wsync') == 'started' ||
		GetResourceState('cd_easytime') == 'started' ||
		GetResourceState('Renewed-Weathersync') == 'started'
	) {
		SendNUIMessage({
			error: 'weathersync',
		});
		return;
	}

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

			const pedType = modelHash === GetHashKey('mp_m_freemode_01') ? 'male' : 'female';
			SetEntityRotation(ped, config.greenScreenRotation.x, config.greenScreenRotation.y, config.greenScreenRotation.z, 0, false);
			SetEntityCoordsNoOffset(ped, config.greenScreenPosition.x, config.greenScreenPosition.y, config.greenScreenPosition.z, false, false, false);
			FreezeEntityPosition(ped, true);
			await Delay(50);
			SetPlayerModel(playerId, modelHash);
			await Delay(15);
			SetPlayerControl(playerId, false);
			ped = PlayerPedId();

			for (const type of Object.keys(config.cameraSettings)) {
				for (const stringComponent of Object.keys(config.cameraSettings[type])) {
					ResetPed(pedType);
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
									SetPedComponentVariation(ped, component, drawable, texture, 0);
									await takeScreenshotForComponent(pedType, type, component, drawable, texture);
								}
							} else {
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
									ClearPedProp(ped, component);
									SetPedPropIndex(ped, component, prop, texture, 0);
									await takeScreenshotForComponent(pedType, type, component, prop, texture);
								}
							} else {
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
			SendNUIMessage({
				end: true,
			});
		}
	}
});

on('onResourceStop', (resName) => {
	if (GetCurrentResourceName() != resName) return;

	SetPlayerControl(playerId, true);
	FreezeEntityPosition(ped, false);
});
