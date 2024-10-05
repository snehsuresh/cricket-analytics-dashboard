const express = require('express');
const { connectDB } = require('./config/db');
require('dotenv').config();

const app = express();

app.use(express.json());

app.use('/api/matches', require('./routes/matches'));
app.use('/api/players', require('./routes/players'));

const PORT = process.env.PORT || 5001;
connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
