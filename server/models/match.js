const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Match = sequelize.define('Match', {
    team1: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    team2: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    score: {
        type: DataTypes.JSON, // Store scores as JSON
        allowNull: false,
    },
    wickets: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    result: {
        type: DataTypes.STRING,
    }
});

module.exports = Match;
