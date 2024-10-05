
const Match = require('../models/Match');

const getAllMatches = async (req, res) => {
    try {
        const matches = await Match.findAll();
        res.status(200).json(matches);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
};

const createMatch = async (req, res) => {
    const { team1, team2, score, wickets, date } = req.body;

    try {
        const match = await Match.create({ team1, team2, score, wickets, date });
        res.status(201).json(match);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create match' });
    }
};

module.exports = { getAllMatches, createMatch };
