const { model, Schema } = require('mongoose');

const userSchema = new Schema({
  email: String,
  password: String,
  username: String,
  handle: String,
  bio: {
    type: String,
    default: ''
  },
  profileImg: {
    type: String,
    default: 'https://react.semantic-ui.com/images/avatar/large/jenny.jpg'
  },
  followers: {
    type: Number,
    default: 0
  },
  createdAt: String
})

module.exports = model('User', userSchema);