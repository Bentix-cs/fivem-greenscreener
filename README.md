# fivem-greenscreener

A small script that allows you to take screenshots of every gta clothing, prop/object or vehicle against a greenscreen.
You can use them for example in your inventory, clothing store or vehicle store.

## Using the images

You are granted the freedom to utilize the images in your open-source projects with proper accreditation.
For commercial usage, please reach out to me on Discord to discuss the conditions.

## Key Features

- Capture screenshots of every GTA clothing item, including addon clothing
- Capture screenshots of all objects and props in GTA, including addon props
- Capture screenshots of every vehicle in GTA, including addon vehicles
- Screenshots are labeled comprehensively for seamless integration into your scripts
- Minimalistic progress UI for user convenience
- Hides the HUD and radar during capture sessions
- Almost completely invisible ped
- Customizable camera positions through configuration settings
- Configurable delay between clothing screenshots
- Pause, resume, and stop controls for long capture sessions
- Configurable output directory, including an optional server convar override
- Scans every clothing and prop texture variation by default
- Automatic removal of the greenscreen backdrop (courtesy of [@hakanesnn](https://github.com/hakanesnn))
- Utilizes a large greenscreen box (thanks to [@jimgordon20](https://github.com/jimgordon20/jim_g_green_screen))

## Planned Updates

- Feel free to share any ideas or suggestions for future enhancements!

## Installation

Simply clone the repository and place the resource in your resources folder.

**Do not use a subfolder like `resources/[scripts]` as it will cause the script to malfunction.**

## Dependencies

- [screenshot-basic](https://github.com/citizenfx/screenshot-basic)
- yarn

## Usage

### Screenshot all clothing

Execute the command `/screenshot` to initiate the clothing screenshot process.
Be patient as it may take some time to complete, and it's advisable not to interfere with your PC during this operation.

The HUD and radar are hidden automatically while a screenshot capture is running, then restored when the capture finishes or is stopped.

### Screenshot specific clothing

Utilize the command `/customscreenshot` to capture a specific clothing item, with optional custom camera settings specified in the format outlined in `config.json`.

`/customscreenshot [component] [drawable/all] [props/clothing] [male/female/both] [camerasettings(optional)]`

`/customscreenshot 11 17 clothing male {"fov": 55, "rotation": { "x": 0, "y": 0, "z": 15}, "zPos": 0.26}`

`/customscreenshot 11 all clothing male {"fov": 55, "rotation": { "x": 0, "y": 0, "z": 15}, "zPos": 0.26}`

### Screenshot objects/props

To screenshot objects or props, employ the command `/screenshotobject [hash]`.

Example Usage:
`/screenshotobject 2240524752`

### Screenshot vehicles

Capture screenshots of vehicles using `/screenshotvehicle [model/all] [primarycolor(optional)] [secondarycolor(optional)]`.

Example Usage:
`/screenshotvehicle all 1 1`

`/screenshotvehicle zentorno 1 1`

## Capture controls

While a long capture is running, you can use these commands:

- `/screenshotpause` pauses the active capture after the current screenshot step.
- `/screenshotresume` resumes a paused capture.
- `/screenshotstop` requests a clean stop, closes the progress UI, and restores the HUD/radar.

## Configuration

### Screenshot delay

You can adjust `clothingScreenshotDelay` in `config.json` to control how long the scanner waits after each clothing or prop screenshot before moving to the next variation. Lower values scan faster, while higher values can help if screenshots are captured before clothing finishes rendering.

```json
{
  "clothingScreenshotDelay": 150
}
```

### Texture variations

Texture scanning is enabled by default. With `includeTextures` set to `true`, clothing and prop captures iterate through every available texture variation for each drawable or prop. Set it to `false` if you only want the first texture for a faster scan.

```json
{
  "includeTextures": true
}
```

### Output path

By default, screenshots are saved inside the resource's `images` folder. You can set `outputPath` in `config.json`, or override it externally with the convar configured by `outputPathConvar`.

```json
{
  "outputPath": "",
  "outputPathConvar": "fivem_greenscreener_output_path"
}
```

For example, with the default convar name:

```cfg
setr fivem_greenscreener_output_path "/absolute/path/to/screenshots"
```

## Examples

<img src="https://i.imgur.com/2WJyGgy.png" width="200"> <img src="https://i.imgur.com/aAQwU4d.png" width="200">
<img src="https://i.imgur.com/EqY5Inu.png" width="200"> <img src="https://i.imgur.com/ctTF9M9.png" width="200">
<img src="https://i.imgur.com/6qD7hF3.png" width="200"> <img src="https://i.imgur.com/xdMyGyk.png" width="200">

## Support

For support just join my [discord](https://discord.gg/yN96thgggk).

## Support the Project

If you wish to support this project, consider buying me a coffee on [ko-fi](https://ko-fi.com/bentix). Your support is greatly appreciated! ❤️​

