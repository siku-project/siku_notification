local nextId = 0

---@return string
local function nextNotificationId()
  nextId = nextId + 1

  return ('c:%d'):format(nextId)
end

---@return table
local function configPayload()
  local defaults <const> = NotificationNormalize.Defaults()

  return {
    maxVisiblePerPosition = NotificationConfig.maxVisiblePerPosition,
    defaultPosition = defaults.position,
    defaultDuration = defaults.duration,
    maxDuration = defaults.maxDuration,
    coalesce = NotificationConfig.coalesce ~= false,
  }
end

---@param export string
---@param reason string
---@param detail string
local function refuse(export, reason, detail)
  local resource <const> = GetInvokingResource() or Siku.name

  Siku.log.warn('notification.rejected', ('%s from %s refused: %s'):format(export, resource, detail), {
    export = export,
    resource = resource,
    reason = reason,
  }, { entities = { { type = 'resource', id = resource, role = 'subject', label = resource } } })
end

---Shows a notification on this client.
---@param data table The notification: type, title, description, value, icon, image, imageMode, position, duration.
---@return string|nil id The id to dismiss it with, nil when the call was refused.
local function show(data)
  local payload <const>, reason <const> = NotificationNormalize.Message(data, NotificationNormalize.Defaults())

  if not payload then
    refuse('show', reason, reason == 'empty' and 'a title or a description is required' or 'payload must be a table')
    return nil
  end

  payload.id = nextNotificationId()

  Nui.send('show', { notification = payload })

  return payload.id
end

---Removes one notification, on screen or still waiting.
---@param id string The id `show` returned.
local function dismiss(id)
  if type(id) ~= 'string' or id == '' then
    refuse('dismiss', 'id_invalid', 'id must be the string show returned')
    return
  end

  Nui.send('dismiss', { id = id })
end

---Clears the notifications, one position or all of them, queue included.
---@param position string|nil A position to clear, every position when nil.
local function hide(position)
  if position ~= nil and not NotificationNormalize.Position(position) then
    refuse('hide', 'position_invalid', ('%s is not a position'):format(tostring(position)))
    return
  end

  Nui.send('clear', { position = NotificationNormalize.Position(position) })
end

Nui.reply('ready', function()
  return {
    locale = {
      language = TranslationConfig.language,
      translations = { web = Siku.locale.translations().web },
    },
    config = configPayload(),
  }
end)

RegisterNetEvent('siku_notification:client:show', function(payload)
  if type(payload) ~= 'table' then
    return
  end

  Nui.send('show', { notification = payload })
end)

RegisterNetEvent('siku_notification:client:dismiss', function(id)
  if type(id) ~= 'string' then
    return
  end

  Nui.send('dismiss', { id = id })
end)

RegisterNetEvent('siku_notification:client:clear', function(position)
  Nui.send('clear', { position = NotificationNormalize.Position(position) })
end)

exports('show', show)
exports('dismiss', dismiss)
exports('hide', hide)
