NotificationConfig = {
  --- Maximum notifications shown at once per screen position.
  ---
  --- Extra notifications wait in a queue and appear as slots free up.
  ---
  --- Default: 5
  maxVisiblePerPosition = 5,

  --- Default position used when a notification does not specify one.
  ---
  --- Available: 'top-left', 'top-center', 'top-right', 'center-left',
  --- 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'
  ---
  --- Default: 'top-right'
  defaultPosition = 'top-right',

  --- Default lifetime in milliseconds used when a notification does not
  --- specify one. 0 keeps the notification until it is hidden.
  ---
  --- Default: 5000
  defaultDuration = 5000,
}
