--- Sends a notification to a player.
---@param source number The player's server id.
---@param data table The notification payload (type, title, subtitle, description, icon, image, imageMode, position, duration).
---@return nil
local function showNotification(source, data)
  if type(source) ~= 'number' or type(data) ~= 'table' then
    Siku.print.error(
      ('show expected a numeric source and a table payload, got %s and %s'):format(type(source), type(data))
    )
    return
  end

  TriggerClientEvent('siku:notification:show', source, data)
end

--- Hides every notification for a player.
---@param source number The player's server id.
---@return nil
local function hideNotifications(source)
  if type(source) ~= 'number' then
    Siku.print.error(('hide expected a numeric source, got %s'):format(type(source)))
    return
  end

  TriggerClientEvent('siku:notification:hide', source)
end

exports('show', showNotification)
exports('hide', hideNotifications)
