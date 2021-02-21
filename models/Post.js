const { model, Schema } = require('mongoose');

const postSchema = new Schema({
  body: String,
  username: String,
  
  topicID: {
    type: Schema.Types.ObjectId,
    ref: 'Topic'
  },
  topic: String,

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
  },

  createdAt: String
})

module.exports = model('Post', postSchema);