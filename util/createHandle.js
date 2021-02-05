module.exports.createHandle = (username) => {
  return username.toLowerCase().replace(' ', '-');
}