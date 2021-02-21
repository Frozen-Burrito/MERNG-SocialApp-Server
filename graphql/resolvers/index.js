const postResolvers = require('./posts');
const userResolvers = require('./users');
const commentResolvers = require('./comments');
const topicResolvers = require('./topics');

module.exports = {
  Post: {
    likeCount: (parent) => parent.likes.length,
    commentCount: (parent) => parent.comments.length
  },
  Query: {
    ...postResolvers.Query,
    ...userResolvers.Query,
    ...topicResolvers.Query
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...commentResolvers.Mutation,
    ...topicResolvers.Mutation
  },
  Subscription: {
    ...postResolvers.Subscription
  }
}