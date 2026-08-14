--- Loads the full translation table for the active language.
---@return table<string, string>
local function loadTranslations()
  local file <const> =
    LoadResourceFile(GetCurrentResourceName(), ('translations/%s.lua'):format(TranslationConfig.language))
  if not file then
    Siku.print.warn(('No translation file found for language %q'):format(TranslationConfig.language))
    return {}
  end

  local fn <const> = load(file)
  if not fn then
    Siku.print.error(('Unable to compile the translation file for language %q'):format(TranslationConfig.language))
    return {}
  end

  return fn() or {}
end

--- Pushes the active language and its translations to the NUI.
---@return nil
local function sendLocale()
  SendNUIMessage({
    action = 'siku_notification:nui:setLocale',
    locale = {
      language = TranslationConfig.language,
      translations = loadTranslations(),
    },
  })
end

--- Pushes the notification configuration to the NUI.
---@return nil
local function sendConfig()
  SendNUIMessage({
    action = 'siku_notification:nui:setConfig',
    config = {
      maxVisiblePerPosition = NotificationConfig.maxVisiblePerPosition,
      defaultPosition = NotificationConfig.defaultPosition,
      defaultDuration = NotificationConfig.defaultDuration,
    },
  })
end

RegisterNUICallback('siku_notification:nui:ready', function(_, cb)
  sendLocale()
  sendConfig()
  cb({})
end)

--- Displays a notification on this client.
---@param data table The notification payload forwarded to the NUI.
---@return nil
local function showNotification(data)
  if type(data) ~= 'table' then
    Siku.print.error(('show expected a table payload, got %s'):format(type(data)))
    return
  end

  SendNUIMessage({
    action = 'siku_notification:nui:show',
    notification = data,
  })
end

--- Hides every notification on this client.
---@return nil
local function hideNotifications()
  SendNUIMessage({
    action = 'siku_notification:nui:hide',
  })
end

RegisterNetEvent('siku_notification:client:show', function(data)
  showNotification(data)
end)

RegisterNetEvent('siku_notification:client:hide', function()
  hideNotifications()
end)

exports('show', showNotification)
exports('hide', hideNotifications)
