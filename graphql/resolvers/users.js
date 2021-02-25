const bcrypt = require('bcryptjs');
const { UserInputError } = require('apollo-server');

const { SECRET_KEY } = process.env.SECRET_KEY || require('../../config');
const { validateRegisterInput, validateLoginInput } = require('../../util/validators');
const { createHandle, generateToken } = require('../../util/userUtils');

const { User } = require('../../models');

module.exports = {
  Query: {
    async getPopularUsers() {
      try {
        const popularUsers = await User.find();
        return popularUsers;
      } catch (error) {
        throw new Error(error);
      }
    },
    async userProfile(_, { userId }) {
      try {
        const user = await User.findById(userId);
        return user;
      } catch (error) {
        throw new Error(error);
      }
    }
  },
  Mutation: {
    async login(_, { email, password }) {
      const { errors, valid } = validateLoginInput(email, password);
      const user = await User.findOne({ email });

      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }

      if (!user) {
        throw new UserInputError('Email is incorrect', { errors });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        throw new UserInputError('Incorrect password', { errors });
      }

      const token = generateToken(user, SECRET_KEY);

      return {
        ...user._doc,
        id: user._id,
        token
      }
    },

    async register(_, { registerInput : { username, email, password, confirmPassword}}) {
      const { valid, errors } = validateRegisterInput( username, email, password, confirmPassword);

      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }

      // Check if user already exists
      const user = await User.findOne({ email });

      if (user) {
        throw new UserInputError('Email is already taken', {
          errors: {
            username: 'Email is already linked to an account'
          }
        })
      }

      // Hash password & create auth token
      password = await bcrypt.hash(password, 12);

      let handle = createHandle(username);

      const newUser = new User({
        email,
        username,
        password,
        handle,
        createdAt: new Date().toISOString()
      });

      const res = await newUser.save();
      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token
      }
    }
  }
}