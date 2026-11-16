NotificationNormalize = {}

local TYPES <const> = { default = true, success = true, warning = true, error = true, info = true }
local IMAGE_MODES <const> = { side = true, background = true }
local POSITIONS <const> = {
  ['top-left'] = 'top-left',
  ['top-center'] = 'top-center',
  ['top-right'] = 'top-right',
  ['left'] = 'left',
  ['center'] = 'center',
  ['right'] = 'right',
  ['bottom-left'] = 'bottom-left',
  ['bottom-center'] = 'bottom-center',
  ['bottom-right'] = 'bottom-right',
  ['center-left'] = 'left',
  ['center-right'] = 'right',
}
local IMAGE_PATTERNS <const> = { '^https?://', '^nui://', '^data:image/' }

local MAX_TITLE_LENGTH <const> = 64
local MAX_DESCRIPTION_LENGTH <const> = 256
local MAX_VALUE_LENGTH <const> = 32
local FALLBACK_POSITION <const> = 'top-right'
local FALLBACK_DURATION <const> = 5000
local FALLBACK_MAX_DURATION <const> = 30000

---@param value string
---@return string
local function trim(value)
  return (value:gsub('^%s+', ''):gsub('%s+$', ''))
end

---@param value number|nil
---@return boolean
local function isPositive(value)
  return type(value) == 'number' and value > 0 and value == value and value ~= math.huge
end

---Trims a text and cuts it to a number of characters, nil when there is nothing left.
---@param value any
---@param max number
---@return string|nil
local function text(value, max)
  if type(value) ~= 'string' then
    return nil
  end

  local trimmed <const> = trim(value)

  if trimmed == '' then
    return nil
  end

  local length <const> = utf8.len(trimmed)

  if not length then
    return trimmed:sub(1, max)
  end

  if length <= max then
    return trimmed
  end

  return trimmed:sub(1, utf8.offset(trimmed, max + 1) - 1)
end

---@param value any
---@return string|nil
local function image(value)
  if type(value) ~= 'string' then
    return nil
  end

  local trimmed <const> = trim(value)

  for _, pattern in ipairs(IMAGE_PATTERNS) do
    if trimmed:lower():find(pattern) then
      return trimmed
    end
  end

  return nil
end

---The screen position a caller named, old names of the middle row included.
---@param value any
---@return string|nil
function NotificationNormalize.Position(value)
  if type(value) ~= 'string' then
    return nil
  end

  return POSITIONS[value]
end

---The defaults a notification falls back to, read from the config and made safe.
---@return { position: string, duration: number, maxDuration: number }
function NotificationNormalize.Defaults()
  local maxDuration <const> = isPositive(NotificationConfig.maxDuration) and NotificationConfig.maxDuration or FALLBACK_MAX_DURATION
  local duration <const> = isPositive(NotificationConfig.defaultDuration) and NotificationConfig.defaultDuration or FALLBACK_DURATION

  return {
    position = NotificationNormalize.Position(NotificationConfig.defaultPosition) or FALLBACK_POSITION,
    duration = math.min(duration, maxDuration),
    maxDuration = maxDuration,
  }
end

---What the interface receives for a notification call: every field checked, the
---texts trimmed and cut, an unknown type or position replaced by the default.
---@param data any The payload a caller gave.
---@param defaults { position: string, duration: number, maxDuration: number }
---@return table|nil payload The notification to send, nil when it cannot be shown.
---@return string|nil reason Why it was refused.
function NotificationNormalize.Message(data, defaults)
  if type(data) ~= 'table' then
    return nil, 'invalid_payload'
  end

  local title <const> = text(data.title, MAX_TITLE_LENGTH)
  local description <const> = text(data.description, MAX_DESCRIPTION_LENGTH)

  if not title and not description then
    return nil, 'empty'
  end

  local kind <const> = TYPES[data.type] and data.type or 'default'
  local picture <const> = image(data.image)
  local duration <const> = isPositive(data.duration) and data.duration or defaults.duration
  local icon <const> = type(data.icon) == 'string' and data.icon:match('^[%w_%-]+$') or nil

  return {
    type = kind,
    title = title,
    description = description,
    value = text(data.value or data.subtitle, MAX_VALUE_LENGTH),
    icon = icon,
    image = picture,
    imageMode = picture and IMAGE_MODES[data.imageMode] and data.imageMode or nil,
    position = NotificationNormalize.Position(data.position) or defaults.position,
    duration = math.floor(math.min(duration, defaults.maxDuration)),
  }
end
