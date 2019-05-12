var pushoverNotifications = require('pushover-notifications')

var push = new pushoverNotifications({
    user: '######SECRET#####',
    token: '#####SECRET#####',
    onerror: function(error) {
        log.error(error)
    },
})

module.exports = exports = function pushover(msg) {
    if (typeof msg !== 'object' || typeof msg.message !== 'string')
        msg = { message: '' + msg }
    msg.title = msg.title || 'Ha4us meldet'
    msg.priority = msg.priority || -1
    msg.device = msg.device || 'iphone7'
    push.send(msg, function(err, result) {
        if (err) {
            log.error(err)
        }
    })
}
