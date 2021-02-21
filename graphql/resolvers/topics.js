const { AuthenticationError, UserInputError } = require('apollo-server');

const Topic = require('../../models/Topic');
const verifyAuth = require('../../util/verifyAuth');

module.exports = {
  Query: {
    async getTopics() {
      try {
        const topics = await Topic.find();
        return topics;
      } catch(error) {
        return new Error(error);
      }
    }
  },
  Mutation: {
    async createTopic(_, { topicName, description='' }, context) {
      const user = verifyAuth(context);
      
      if(topicName.trim() === '') {
        throw new UserInputError('Topic name must not be empty');
      }

      const newTopic = new Topic({
        name: topicName,
        description,
        createdAt: new Date().toISOString()
      });

      const topic = await newTopic.save();

      return topic;
    }
  }
}