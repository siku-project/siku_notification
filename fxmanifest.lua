fx_version 'cerulean'
game 'gta5'

author 'Siku Studio'
description 'The official notification system of the SIKU ecosystem: nine screen positions, a queue per position, merged repeats, images and a design-system interface shared with every SIKU resource.'
version '2.0.0'

name 'siku_notification'

lua54 'yes'

shared_scripts {
  '@siku_core/init.lua',
  'config/*.lua',
  'shared/normalize.lua',
}

server_scripts {
  'server/init.lua',
  'server/main.lua',
}

client_scripts {
  'client/siku_ui.lua',
  'client/nui.lua',
  'client/main.lua',
}

ui_page 'web/dist/index.html'

files {
  'translations/*.lua',
  'web/dist/**/*',
}

dependencies {
  'siku_core',
}
