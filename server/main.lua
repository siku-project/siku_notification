local EVERYONE <const> = -1

local nextId = 0

---@return string
local function nextNotificationId()
  nextId = nextId + 1

  return ('s:%d'):format(nextId)
end

---@param source any
---@return boolean
local function isTarget(source)
  if type(source) ~= 'number' then
    return false
  end

  return source == EVERYONE or GetPlayerName(tostring(source)) ~= nil
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

---Shows a notification to a player, or to everyone with -1.
---@param source number The player's server id, or -1 for everyone.
---@param data table The notification: type, title, description, value, icon, image, imageMode, position, duration.
---@return string|nil id The id to dismiss it with, nil when the call was refused.
local function show(source, data)
  if not isTarget(source) then
    refuse('show', 'target_invalid', 'target must be a connected player or -1')
    return nil
  end

  local payload <const>, reason <const> = NotificationNormalize.Message(data, NotificationNormalize.Defaults())

  if not payload then
    refuse('show', reason, reason == 'empty' and 'a title or a description is required' or 'payload must be a table')
    return nil
  end

  payload.id = nextNotificationId()

  TriggerClientEvent('siku_notification:client:show', source, payload)

  return payload.id
end

---Removes one notification, on screen or still waiting.
---@param source number The player's server id, or -1 for everyone.
---@param id string The id `show` returned.
local function dismiss(source, id)
  if not isTarget(source) then
    refuse('dismiss', 'target_invalid', 'target must be a connected player or -1')
    return
  end

  if type(id) ~= 'string' or id == '' then
    refuse('dismiss', 'id_invalid', 'id must be the string show returned')
    return
  end

  TriggerClientEvent('siku_notification:client:dismiss', source, id)
end

---Clears the notifications of a player, one position or all of them, queue included.
---@param source number The player's server id, or -1 for everyone.
---@param position string|nil A position to clear, every position when nil.
local function hide(source, position)
  if not isTarget(source) then
    refuse('hide', 'target_invalid', 'target must be a connected player or -1')
    return
  end

  if position ~= nil and not NotificationNormalize.Position(position) then
    refuse('hide', 'position_invalid', ('%s is not a position'):format(tostring(position)))
    return
  end

  TriggerClientEvent('siku_notification:client:clear', source, NotificationNormalize.Position(position))
end

exports('show', show)
exports('dismiss', dismiss)
exports('hide', hide)
