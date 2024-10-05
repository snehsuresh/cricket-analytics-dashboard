// backend/services/cricketAPI.js
const axios = require('axios');

const cricketApi = axios.create({
    baseURL: process.env.CRICKET_API_URL,
    headers: {
        'Authorization': `Bearer ${process.env.CRICKET_API_KEY}`
    }
});

// Fetch live matches
const getLiveMatches = async () => {
    try {
        const response = await cricketApi.get('/matches/live');
        return response.data;
    } catch (error) {
        console.error('Error fetching live matches:', error.message);
        throw error;
    }
};

// Fetch player statistics
const getPlayerStats = async (playerId) => {
    try {
        const response = await cricketApi.get(`/players/${playerId}/stats`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching stats for player ${playerId}:`, error.message);
        throw error;
    }
};

module.exports = { getLiveMatches, getPlayerStats };
