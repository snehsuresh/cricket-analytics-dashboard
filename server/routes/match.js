const express = require('express');
const { getAllMatches, createMatch } = require('../controllers/matchController');
const router = express.Router();

router.get('/', getAllMatches);
router.post('/', createMatch);

module.exports = router;
