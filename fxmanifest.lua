fx_version 'cerulean'
game 'gta5'

author 'Ben'
description 'fivem-greenscreener'
version '1.0.0'

ui_page 'html/index.html'


files {
    'config.json',
    'html/*'
}

client_script 'client.js'

server_script 'server.js'

dependencies {
	'screenshot-basic',
    'yarn'
}
