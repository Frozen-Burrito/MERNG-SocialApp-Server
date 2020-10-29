const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const { SECRET_KEY } = require('../../config');
const { validateRegisterInput, validateLoginInput } = require('../../util/validators');
const User = require('../../models/User');

const generateToken = ( user ) => {
  return jwt.sign({
    id: user.id,
    username: user.username,
    email: user.email
  }, SECRET_KEY, { expiresIn: '1h'});
}

module.exports = {
  Mutation: {
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);
      const user = await User.findOne({ username });

      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }

      if (!user) {
        errors.general = 'Username not found';
        throw new UserInputError('User not found', { errors });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        errors.general = 'Incorrect password';
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
      const user = await User.findOne({ username });

      if (user) {
        throw new UserInputError('Username is taken', {
          errors: {
            username: 'This username is already taken'
          }
        })
      }

      // hash password and create auth token
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username,
        password,
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