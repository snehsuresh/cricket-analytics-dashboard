
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./graphql/schema'); // Import the GraphQL schema
require('dotenv').config();

const app = express();

app.use(express.json());

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true,
}));


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
