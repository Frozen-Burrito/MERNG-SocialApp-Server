const { AuthenticationError, UserInputError } = require('apollo-server');
const { versionInfo } = require('graphql');

const Post = require('../../models/Post');
const verifyAuth = require('../../util/verifyAuth');

module.exports = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (error) {
        throw new Error(error);
      }
    },

    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);

        if (post) {
          return post;
        } else {
          throw new Error('Post not found');
        }
        
      } catch (error) {
        throw new Error(error);
      }
    }
  }, 
  Mutation: {
    async createPost(_, { body }, context) {
      const user = verifyAuth(context);
      
      if(body.trim() === '') {
        throw new Error('Post body must not be empty');
      }

      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString()
      });

      const post = await newPost.save();

      context.pubsub.publish('NEW_POST', {
        newPost: post,
      })

      return post;
    },
    async deletePost(_, {postId}, context) {
      const user = verifyAuth(context);

      try {
        const post = await Post.findById(postId);
        if (user.username === post.username) {
          await post.delete();
          return 'Post was deleted!';
        } else {
          throw new AuthenticationError('Not allowed to delete this post');
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    async likePost(_, { postId }, context) {
      const { username } = verifyAuth(context);

      const post = await Post.findById(postId);
      if (post) {
        if (post.likes.find(like => like.username === username)) {
          // Post already liked by the user
          post.likes = post.likes.filter(like => like.username !== username);
        } else {
          // Not liked yet by the user
          post.likes.push({
            username,
            createdAt: new Date().toISOString()
          })
        }

        await post.save();
        return post;
      } else throw new UserInputError('Post not found');
    }
  },
  Subscription: {
    newPost: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST')
    }
  }
}