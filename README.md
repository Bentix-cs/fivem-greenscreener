# fivem-greenscreener

A small script that allows you to take screenshots of every gta clothing, prop/object or vehicle against a greenscreen.
You can use them for example in your inventory, clothing store or vehicle store.

## Using the images
You are granted the freedom to utilize the images in your open-source projects with proper accreditation.
For commercial usage, please reach out to me on Discord to discuss the conditions.

## Services Offered
For a fee, I offer a service where I generate the images for you. You can also send me your custom clothing, vehicles or props, and I will include them.
Contact me on Discord at **ben.001** for inquiries.

## Key Features
- Capture screenshots of every GTA clothing item, including addon clothing
- Capture screenshots of all objects and props in GTA, including addon props
- Capture screenshots of every vehicle in GTA, including addon vehicles
- Screenshots are labeled comprehensively for seamless integration into your scripts
- Minimalistic progress UI for user convenience
- Almost completely invisible ped
- Customizable camera positions through configuration settings
- Option to enable cycling through texture variations
- Automatic removal of the greenscreen backdrop (courtesy of [@hakanesnn](https://github.com/hakanesnn))
- Utilizes a large greenscreen box (thanks to [@jimgordon20](https://github.com/jimgordon20/jim_g_green_screen))

## Planned Updates
- Feel free to share any ideas or suggestions for future enhancements!

## Installation
**Dependencies**
- [screenshot-basic](https://github.com/citizenfx/screenshot-basic)
- yarn

### Step 1
Simply place the resource in your resources folder.

**Do not use a subfolder like `resources/[scripts]` as it will cause the script to malfunction.**

## Usage
### Screenshot all clothing
Execute the command `/screenshot` to initiate the clothing screenshot process.
Be patient as it may take some time to complete, and it's advisable not to interfere with your PC during this operation.


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

## Examples
<img src="https://i.imgur.com/2WJyGgy.png" width="200"> <img src="https://i.imgur.com/aAQwU4d.png" width="200">
<img src="https://i.imgur.com/EqY5Inu.png" width="200"> <img src="https://i.imgur.com/ctTF9M9.png" width="200">
<img src="https://i.imgur.com/6qD7hF3.png" width="200"> <img src="https://i.imgur.com/xdMyGyk.png" width="200">

## Support
For assistance or further inquiries, you can reach me on Discord **ben.001**.

## Support the Project
If you wish to support this project, consider buying me a coffee on [ko-fi](https://ko-fi.com/bentix). Your support is greatly appreciated! ❤️​

