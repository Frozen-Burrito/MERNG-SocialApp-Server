const { gql } = require('apollo-server');

module.exports = gql`
  type Post {
    id: ID!
    author: String!
    username: String!
    body: String!
    comments: [Comment]!
    commentCount: Int!
    likes: [Like]!
    likeCount: Int!
    createdAt: String!
  }
  type Comment {
    id: ID!
    author: String!
    username: String!
    body: String!
    createdAt: String!
  }
  type Like {
    id: ID!
    author: String!
    username: String!
    createdAt: String!
  }
  type User {
    id: ID!
    email: String!
    username: String!
    handle: String!
    bio: String
    profileImg: String
    followers: Int!
    token: String!
    createdAt: String!
  }
  input RegisterInput {
    email: String!
    username: String!
    password: String!
    confirmPassword: String!
  }
  type Query {
    getPosts: [Post]
    getPost(postId: ID!): Post
    userProfile(userId: ID!): User
    getPopularUsers: [User]
  }
  type Mutation {
    register(registerInput: RegisterInput): User!
    login(email: String!, password: String!): User!
    createPost(body: String!): Post!
    deletePost(postId: ID!): String!
    createComment(postId: ID!, body: String!): Post!
    deleteComment(postId: ID!, commentId: ID!): Post!
    likePost(postId: ID!): Post!
  }
  type Subscription {
    newPost: Post!
  }
`