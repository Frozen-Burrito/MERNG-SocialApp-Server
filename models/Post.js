const { model, Schema } = require('mongoose');

const postSchema = new Schema({
  body: String,
  username: String,
  createdAt: String,
  comments: [
    {
      author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      body: String,
      username: String,
      createdAt: String,
    }
  ],
  likes: [
    {
      author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      username: String,
      createdAt: String
    }
  ],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  }
})

module.exports = model('Post', postSchema);