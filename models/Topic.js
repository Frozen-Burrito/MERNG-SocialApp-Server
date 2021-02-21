const { Schema, model } = require('mongoose');

const TopicSchema = new Schema({

  name: String,
  description: String,

  createdAt: String
});

module.exports= model('Topic', TopicSchema);