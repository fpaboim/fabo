const mongoose = require('mongoose')

const NotificationSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
})


module.exports = mongoose.model('Notification', NotificationSchema)
