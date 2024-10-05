import React, { useState, useEffect } from 'react';
import MatchProgress from './components/MatchProgress';
import PlayerStats from './components/PlayerStats';
import axios from 'axios';

function App() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      const res = await axios.get('/api/matches');
      setMatches(res.data);
    };
    fetchMatches();
  }, []);

  return (
    <div>
      <h1>Cricket Analytics Dashboard</h1>
      <MatchProgress matches={matches} />
      <PlayerStats />
    </div>
  );
}

export default App;
