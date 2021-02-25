const { Schema, model } = require('mongoose');

const BookmarkListSchema = new Schema({

  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  list: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = model('BookmarkList', BookmarkListSchema);