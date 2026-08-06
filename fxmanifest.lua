fx_version 'cerulean'
game 'gta5'

author 'Chaos Studio'
description 'The official notification system of the SIKU ecosystem — a modern, modular and high-performance resource delivering immersive, consistent, and seamlessly integrated player notifications.'
version '0.0.1'

name 'siku_notification'

lua54 'yes'

shared_scripts {
  '@siku_core/init.lua',
  'config/notification.lua',
  'config/translation.lua',
  'shared/utils/locale.lua',
}

server_scripts {
  'server/init.lua',
  'server/main.lua',
}

client_scripts {
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
