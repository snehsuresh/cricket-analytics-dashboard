import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css'; // Import CSS file for animations
import Scoreboard from './components/Scoreboard';
import BarChart from './components/BowlingBarGraph';
import LineGraph from './components/BattingLineGraph';
import WorldTour from './components/WorldTour';
import * as d3 from 'd3';
const App = () => {
  const [matchData, setMatchData] = useState(null);
  const [inningsData, setInningsData] = useState({});
  const [currentInnings, setCurrentInnings] = useState('1');
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    // Load and parse the CSV file
    const loadData = async () => {
      try {
        const data = await d3.csv('../data/ipl_matches_2024_with_coordinates.csv'); // Update with your file path
        // Convert data to an array of objects
        const parsedData = data.map(d => ({
          match_id: d.match_id,
          date: new Date(d.date), // Convert date string to Date object
          team1: d.team1,
          team2: d.team2,
          location: d.location, // country
          latitude: +d.latitude, // Convert to number
          longitude: +d.longitude  // Convert to number
        }));
        setMatches(parsedData); // Set the matches state
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
    <div>
      <h1>Live Cricket Scoreboard</h1>
      <Scoreboard matchData={matchData} />
      <LineGraph inningsData={inningsData} currentInnings={currentInnings} />
      <BarChart matchData={matchData} />
      <WorldTour matches={matches} />
      <div>
        <label htmlFor="innings">Select Innings:</label>
        <select id="innings" value={currentInnings} onChange={handleInningsChange}>
          <option value="1">Innings 1</option>
          <option value="2">Innings 2</option>
        </select>
      </div>
    </div>
  );
};

export default App;
