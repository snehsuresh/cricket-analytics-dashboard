const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema } = require('graphql');

const PlayerType = new GraphQLObjectType({
    name: 'Player',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        runs: { type: GraphQLInt },
    }),
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        mostRunsToday: {
            type: PlayerType,
            resolve: async () => {
                const data = await fetchMostRunsToday();
                return data;
            },
        },
    },
});

const schema = new GraphQLSchema({
    query: RootQuery,
});

const fetchMostRunsToday = async () => {
    try {
        const response = await axios.get(`${process.env.CRICKET_API_URL}/matches/today`, {
            headers: {
                'Authorization': `Bearer ${process.env.CRICKET_API_KEY}`
            },
        });
        const matches = response.data.matches;

        let topPlayer = { id: '', name: '', runs: 0 };

        // Process each match and find the player with the most runs
        matches.forEach(match => {
            match.players.forEach(player => {
                if (player.runs > topPlayer.runs) {
                    topPlayer = { id: player.id, name: player.name, runs: player.runs };
                }
            });
        });

        return topPlayer;
    } catch (error) {
        console.error('Error fetching most runs today:', error.message);
        throw new Error('Failed to fetch most runs today');
    }
};

module.exports = schema;
