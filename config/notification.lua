NotificationConfig = {
  --- Maximum notifications shown at once per screen position.
  ---
  --- Extra notifications wait in a queue and appear as slots free up; a
  --- small counter under the stack says how many are waiting.
  ---
  --- Default: 5
  maxVisiblePerPosition = 5,

  --- Default position used when a notification does not specify one.
  ---
  --- Available: 'top-left', 'top-center', 'top-right', 'left', 'center',
  --- 'right', 'bottom-left', 'bottom-center', 'bottom-right'
  ---
  --- Default: 'top-right'
  defaultPosition = 'top-right',

  --- Default lifetime in milliseconds used when a notification does not
  --- specify one. Every notification expires: an invalid duration falls
  --- back to this value.
  ---
  --- Default: 5000
  defaultDuration = 5000,

  --- Longest lifetime a caller can ask for, in milliseconds. Anything above
  --- is brought down to this value so a stack can never stall.
  ---
  --- Default: 30000
  maxDuration = 30000,

  --- Merge a notification into the identical one already on screen, with a
  --- ×N counter and a fresh timer, instead of stacking the same card twice.
  ---
  --- Default: true
  coalesce = true,
}
