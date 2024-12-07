import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';
import './App.css';
import Scoreboard from './components/Scoreboard';
import BarChart from './components/BowlingBarGraph';
import LineGraph from './components/BattingLineGraph';
import WorldTour from './components/WorldTour';
import TossPage from './pages/Toss'; // Import TossPage component
import * as d3 from 'd3';

const App = () => {
  const [matchData, setMatchData] = useState(null);
  const [inningsData, setInningsData] = useState({});
  const [currentInnings, setCurrentInnings] = useState('1');
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await d3.csv('../data/ipl_matches_2024_with_coordinates.csv');
        const parsedData = data.map(d => ({
          match_id: d.match_id,
          date: new Date(d.date),
          team1: d.team1,
          team2: d.team2,
          location: d.location,
          latitude: +d.latitude,
          longitude: +d.longitude
        }));
        setMatches(parsedData);
      } catch (error) {
        console.error('Error loading or parsing CSV data:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:4000');

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('match-update', (data) => {
      console.log('Received match update:', data);
      setMatchData(data);
      updateInningsData(data);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const updateInningsData = (data) => {
    const newOver = {
      over: data.over,
      runs_scored: data.runs_scored,
      batsman: data.batsman,
      ball: data.ball,
      total_runs: data.total_runs,
    };

    setInningsData((prevData) => {
      const inningsNumber = data.innings;
      const updatedInningsData = prevData[inningsNumber]
        ? [...prevData[inningsNumber], newOver]
        : [newOver];

      return {
        ...prevData,
        [inningsNumber]: updatedInningsData,
      };
    });
  };

  const handleInningsChange = (event) => {
    setCurrentInnings(event.target.value);
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route
            path="/"
            element={
              <div className="main-content">
                <h1 className="title">Live Cricket Scoreboard</h1>
                <Scoreboard matchData={matchData} />
                <LineGraph inningsData={inningsData} currentInnings={currentInnings} />
                <BarChart matchData={matchData} />
                {/* <WorldTour matches={matches} /> */}
                <div className="innings-selector">
                  <label htmlFor="innings">Select Innings:</label>
                  <select id="innings" value={currentInnings} onChange={handleInningsChange}>
                    <option value="1">Innings 1</option>
                    <option value="2">Innings 2</option>
                  </select>
                </div>
              </div>
            }
          />
          <Route path="/toss" element={<TossPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
