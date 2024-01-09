/// <reference types="@citizenfx/client" />

Delay = ms => new Promise(res => setTimeout(res, ms))

let cam = null
let camInfo = null

const cameraSettings = {
  CLOTHING: {
    [1]: {
      fov: 30,
      rotation: { x: 0, y: 0, z: -200 },
      zPos: 0.65
    },
    [3]: {
      fov: 45,
      rotation: { x: 0, y: 0, z: -165 },
      zPos: 0.3
    },
    [4]: {
      fov: 60,
      rotation: { x: 0, y: 0, z: -165 },
      zPos: -0.3
    },
    [5]: {
      fov: 40,
      rotation: { x: 0, y: 0, z: -345 },
      zPos: 0.3
    },
    [6]: {
      fov: 40,
      rotation: { x: 0, y: 0, z: -165 },
      zPos: -0.85
    },
    [7]: {
      fov: 45,
      rotation: { x: 0, y: 0, z: -165 },
      zPos: 0.3
    },
    [8]: {
      fov: 45,
      rotation: { x: 0, y: 0, z: -165 },
      zPos: 0.3
    },
    [9]: {
      fov: 45,
      rotation: { x: 0, y: 0, z: -165 },
      zPos: 0.3
    },
    [11]: {
      fov: 45,
      rotation: { x: 0, y: 0, z: -165 },
      zPos: 0.3
    }
  },
  PROPS: {
    [0]: {
      fov: 30,
      rotation: { x: 0, y: 0, z: -200 },
      zPos: 0.65
    },
    [1]: {
      fov: 20,
      rotation: { x: 0, y: 0, z: -200 },
      zPos: 0.8
    },
    [2]: {
      fov: 20,
      rotation: { x: 0, y: 0, z: -82.5 },
      zPos: 0.675
    },
    [6]: {
      fov: 20,
      rotation: { x: 0, y: 0, z: -247.5 },
      zPos: 0
    },
    [7]: {
      fov: 20,
      rotation: { x: 0, y: 0, z: -82.5 },
      zPos: -0.05
    }
  }
}

const greenScreenPosition = {
  x: -1159.2740478515625,
  y: -468.6954650878906,
  z: 55.2
}
const greenScreenRotation = { x: 0, y: 0, z: -165 }

async function takeScreenshotForComponent (pedType, type, component, drawable) {
  const cameraInfo = cameraSettings[type][component]

  if (!camInfo || camInfo.zPos !== cameraInfo.zPos) {
    camInfo = cameraInfo

    if (cam) {
      DestroyAllCams(true)
      DestroyCam(cam, true)
      cam = null
    }

    FreezeEntityPosition(PlayerPedId(), false)
    SetEntityCoordsNoOffset(
      PlayerPedId(),
      greenScreenPosition.x,
      greenScreenPosition.y,
      greenScreenPosition.z,
      false,
      false,
      false
    )

    SetEntityRotation(
      PlayerPedId(),
      greenScreenRotation.x,
      greenScreenRotation.y,
      greenScreenRotation.z,
      2,
      false
    )

    FreezeEntityPosition(PlayerPedId(), true)

    const [playerX, playerY, playerZ] = GetEntityCoords(PlayerPedId())

    const [fwdX, fwdY, fwdZ] = GetEntityForwardVector(PlayerPedId())

    const fwdPos = {
      x: playerX + fwdX * 1.2,
      y: playerY + fwdY * 1.2,
      z: playerZ + fwdZ + camInfo.zPos
    }

    cam = CreateCamWithParams(
      'DEFAULT_SCRIPTED_CAMERA',
      fwdPos.x,
      fwdPos.y,
      fwdPos.z,
      0,
      0,
      0,
      camInfo.fov,
      true,
      0
    )

    PointCamAtCoord(cam, playerX, playerY, playerZ + camInfo.zPos)

    SetCamActive(cam, true)
    RenderScriptCams(true, false, 0, true, false, 0)
  }

  await Delay(50)

  FreezeEntityPosition(PlayerPedId(), false)

  SetEntityCoordsNoOffset(
    PlayerPedId(),
    greenScreenPosition.x,
    greenScreenPosition.y,
    greenScreenPosition.z,
    false,
    false,
    false
  )

  SetEntityRotation(
    PlayerPedId(),
    camInfo.rotation.x,
    camInfo.rotation.y,
    camInfo.rotation.z,
    2,
    false
  )

  FreezeEntityPosition(PlayerPedId(), true)
  if (type === 'PROPS') {
    emitNet('takeScreenshot', pedType + '_prop_' + component + '_' + drawable)
    await Delay(2000)
    return
  }
  emitNet('takeScreenshot', pedType + '_' + component + '_' + drawable)
  await Delay(2000)
  return
}

function ClearAllPedProps () {
  for (const prop of Object.keys(cameraSettings.PROPS)) {
    ClearPedProp(PlayerPedId(), parseInt(prop))
  }
}

function ResetPed (gender) {
  if (gender == 'male') {
    SetPedHeadBlendData(0, 0, 0, 31, 31, 31, 1, 1, 1)
    SetPedComponentVariation(PlayerPedId(), 1, 0, 0, 0) // Mask
    SetPedComponentVariation(PlayerPedId(), 2, 0, 0, 0) // Hair
    SetPedComponentVariation(PlayerPedId(), 7, 0, 0, 0) // Accessories
    SetPedComponentVariation(PlayerPedId(), 5, 0, 0, 0) // Bags
    SetPedComponentVariation(PlayerPedId(), 6, 5, 0, 0) // Shoes
    SetPedComponentVariation(PlayerPedId(), 9, 0, 0, 0) // Armor
    SetPedComponentVariation(PlayerPedId(), 3, 3, 0, 0) // Torso
    SetPedComponentVariation(PlayerPedId(), 8, 15, 0, 0) // Undershirt
    SetPedComponentVariation(PlayerPedId(), 4, 11, 0, 0) // Legs
    SetPedComponentVariation(PlayerPedId(), 11, 15, 0, 0) // Top
    SetPedHairColor(PlayerPedId(), 45, 15)
  } else {
    SetPedHeadBlendData(45, 45, 45, 31, 31, 31, 1, 1, 1)
    SetPedComponentVariation(PlayerPedId(), 1, 0, 0, 0) // Mask
    SetPedComponentVariation(PlayerPedId(), 2, 0, 0, 0) // Hair
    SetPedComponentVariation(PlayerPedId(), 5, 0, 0, 0) // Bags
    SetPedComponentVariation(PlayerPedId(), 9, 0, 0, 0) // Armor
    SetPedComponentVariation(PlayerPedId(), 7, 0, 0, 0) // Accessories
    SetPedComponentVariation(PlayerPedId(), 6, 5, 0, 0) // Shoes
    SetPedComponentVariation(PlayerPedId(), 3, 8, 0, 0) // Torso
    SetPedComponentVariation(PlayerPedId(), 8, 10, 0, 0) // Undershirt
    SetPedComponentVariation(PlayerPedId(), 4, 13, 0, 0) // Legs
    SetPedComponentVariation(PlayerPedId(), 11, 82, 0, 0) // Top
    SetPedHairColor(PlayerPedId(), 45, 15)
  }
  ClearAllPedProps()
}

RegisterCommand('screenshot', async (source, args) => {
  const modelHashes = [
    GetHashKey('mp_m_freemode_01'),
    GetHashKey('mp_f_freemode_01')
  ]

  NetworkOverrideClockTime(14, 0, 0)
  NetworkOverrideClockMillisecondsPerGameMinute(1000000)

  for (const modelHash of modelHashes) {
    if (IsModelInCdimage(modelHash)) {
      RequestModel(modelHash)
      while (!HasModelLoaded(modelHash)) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const pedType =
        modelHash === GetHashKey('mp_m_freemode_01') ? 'male' : 'female'

      SetEntityRotation(
        PlayerPedId(),
        greenScreenRotation.x,
        greenScreenRotation.y,
        greenScreenRotation.z,
        0,
        false
      )

      SetEntityCoordsNoOffset(
        PlayerPedId(),
        greenScreenPosition.x,
        greenScreenPosition.y,
        greenScreenPosition.z,
        false,
        false,
        false
      )

      await Delay(50)

      SetPlayerModel(PlayerId(), modelHash)

      await Delay(15)

      for (const type of Object.keys(cameraSettings)) {
        for (const stringComponent of Object.keys(cameraSettings[type])) {
          ResetPed(pedType)
          const component = parseInt(stringComponent)
          if (type === 'CLOTHING') {
            const drawableVariationCount = GetNumberOfPedDrawableVariations(
              PlayerPedId(),
              component
            )
            for (
              let drawable = 0;
              drawable < drawableVariationCount;
              drawable++
            ) {
              SetPedComponentVariation(PlayerPedId(), component, drawable, 0, 0)
              await takeScreenshotForComponent(
                pedType,
                type,
                component,
                drawable
              )
            }
          } else if (type === 'PROPS') {
            const propVariationCount = GetNumberOfPedPropDrawableVariations(
              PlayerPedId(),
              component
            )
            for (let prop = 0; prop < propVariationCount; prop++) {
              ClearPedProp(PlayerPedId(), component)
              SetPedPropIndex(PlayerPedId(), component, prop, 0, 0)
              await takeScreenshotForComponent(pedType, type, component, prop)
            }
          }
        }
      }

      SetModelAsNoLongerNeeded(modelHash)
    }
  }
})
