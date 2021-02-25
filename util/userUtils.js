const jwt = require('jsonwebtoken');

module.exports.createHandle = (username) => {
  return username.toLowerCase().replace(' ', '-');
}

module.exports.generateToken = ( user, secret, duration='1h' ) => {
  return jwt.sign({
    id: user.id,
    username: user.username,
    email: user.email
  }, secret, { expiresIn: duration });
}