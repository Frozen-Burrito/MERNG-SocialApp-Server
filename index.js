const { ApolloServer, PubSub } = require('apollo-server');
const mongoose = require('mongoose');

const typeDefs = require('./graphql/typedefs');
const resolvers = require('./graphql/resolvers');
const { MONGODB_URL } = require('./config');

const pubsub = new PubSub();

const PORT = process.env.PORT || 5000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({req}) => ({req, pubsub})
});

mongoose.connect(MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => {
    return server.listen({ port: PORT });
  })
  .then(res => {
    console.log(`Server running at ${res.url}`);
  })
  .catch(error => console.log(error));

  