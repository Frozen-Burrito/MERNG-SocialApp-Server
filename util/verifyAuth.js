const { AuthenticationError } = require('apollo-server');

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = process.env.SECRET_KEY || require('../config');

module.exports = (context) => {
  const authHeader = context.req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split('Bearer ')[1];

    if (token) {
      try {
        const user = jwt.verify(token, SECRET_KEY);
        console.log(user)
        return user;
      } catch (error) {
        throw new AuthenticationError('Invalid authentication token');
      }
    }

    throw new Error('Authentication token must be \'Bearer [token]\'');
  }

  throw new Error('Authorization header must be provided');
}