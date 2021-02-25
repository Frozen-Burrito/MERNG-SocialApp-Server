const { AuthenticationError, UserInputError } = require('apollo-server');
const verifyAuth = require('../../util/verifyAuth');

const { Post } = require('../../models');
const { Topic } = require('../../models');
const { BookmarkList } = require('../../models');

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

    async getPostsByTopic(_, { topicId }) {
      try {
        await Topic.findById(topicId);

        try {
          const posts = await Post.find();
          const postsInTopic = posts.filter(post => post.topicID == topicId);
          return postsInTopic;
        } catch (error) {
          throw new Error(error);
        }
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
    },

    async getBookmarkedPosts(_, {} ,context) {
      try {
        const { id } = verifyAuth(context);

        let userBookmarks = await BookmarkList.findOne({ user: id });

        if (!userBookmarks) {
          userBookmarks = new BookmarkList({
            user: id,
            list: []
          });
          await userBookmarks.save();
        }

        let posts = [];

        for (const id of userBookmarks.list) {
          try {
            const post = await Post.findById(id);
            posts.push(post);
          } catch (error) {
            posts.push({ error: true, msg: 'Post not found' });
            continue;
          }
        }
        
        return posts;
      } catch (error) {
        throw new Error('Failed to load bookmarks for the user');
      }
    }
  }, 
  Mutation: {
    async createPost(_, { body, topicID='' }, context) {
      const user = verifyAuth(context);
      
      if(body.trim() === '') {
        throw new Error('Post body must not be empty');
      }

      const topic = topicID ? (await Topic.findById(topicID)).name : '';

      const newPost = new Post({
        author: user.id,
        username: user.username,
        body,
        topicID,
        topic,
        createdAt: new Date().toISOString()
      });

      const post = await newPost.save();

      context.pubsub.publish('NEW_POST', {
        newPost: post,
      })

      return post;
    },
    async deletePost(_, {postId}, context) {
      const { id } = verifyAuth(context);

      try {
        const post = await Post.findById(postId);
        if (id == post.author) {
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
      const { id, username } = verifyAuth(context);

      const post = await Post.findById(postId);

      if (post) {
        if (post.likes.find(like => like.author == id)) {
          post.likes = post.likes.filter(like => like.author != id);
        } else {
          post.likes.push({
            author: id,
            username,
            createdAt: new Date().toISOString()
          });
        }

        await post.save();
        return post;
      } else throw new UserInputError('Post not found');
    },

    async bookmarkPost(_, { postID }, context) {
      const { id } = verifyAuth(context);

      try {
        await Post.findById(postID);
      } catch (error) {
        throw new Error('Post not found');
      }

      const userBookmarks = await BookmarkList.findOne({ user: id });

      if (userBookmarks.list.find(bookmark => bookmark == postID)) {
        userBookmarks.list = userBookmarks.list.filter(bookmark => bookmark != postID);
      } else {
        userBookmarks.list.push( postID );
      }

      await userBookmarks.save();
      return userBookmarks.list.includes(postID);
    }
  },
  Subscription: {
    newPost: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST')
    }
  }
}