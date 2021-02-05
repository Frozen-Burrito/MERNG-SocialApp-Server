const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const { SECRET_KEY } = process.env.SECRET_KEY || require('../../config');
const { validateRegisterInput, validateLoginInput } = require('../../util/validators');
const { createHandle } = require('../../util/createHandle');
const User = require('../../models/User');

const generateToken = ( user ) => {
  return jwt.sign({
    id: user.id,
    username: user.username,
    email: user.email
  }, SECRET_KEY, { expiresIn: '1h'});
}

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

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token
      }
    },

    async register(_, { registerInput : { username, email, password, confirmPassword}}) {
      // TODO: Validate user input
      const { valid, errors } = validateRegisterInput( username, email, password, confirmPassword);

      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }

      // Make sure user doesn't already exist
      const user = await User.findOne({ email });

      if (user) {
        throw new UserInputError('Email is already taken', {
          errors: {
            username: 'Email is already linked to an account'
          }
        })
      }

      // hash password and create auth token
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