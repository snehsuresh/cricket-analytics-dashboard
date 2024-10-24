import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import * as d3 from 'd3';
import './App.css'; // Import CSS file for animations

const App = () => {
  const [matchData, setMatchData] = useState(null);
  const [batsmenStats, setBatsmenStats] = useState({});
  const [inningsData, setInningsData] = useState({});
  const [currentInnings, setCurrentInnings] = useState('1');

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

  useEffect(() => {
    if (matchData) {
      updateVisualizations();
    }
  }, [matchData, currentInnings]);

  const handleInningsChange = (event) => {
    setCurrentInnings(event.target.value);
  };

  const updateVisualizations = () => {
    updateScoreboard(matchData);
    updateBattingPerformance();
    updateBowlingPerformance();
  };

  const updateScoreboard = (matchData) => {
    const scoreboard = d3.select("#scoreboard").selectAll("*").remove();

    // Create a table for the scoreboard
    const table = d3.select("#scoreboard")
      .append("table")
      .attr("class", "scoreboard-table");

    const header = table.append("thead").append("tr");
    header.selectAll("th")
      .data(["Team", "Innings", "Over", "Ball", "Runs Scored", "Batsman", "Bowler", "Total Runs", "Total Wickets"])
      .enter()
      .append("th")
      .text(d => d);

    const row = table.append("tbody").append("tr");
    row.selectAll("td")
      .data([
        matchData.team,
        matchData.innings,
        matchData.over,
        matchData.ball,
        matchData.runs_scored,
        matchData.batsman,
        matchData.bowler,
        matchData.total_runs,
        matchData.total_wickets
      ])
      .enter()
      .append("td")
      .attr("class", d => (d === 4 || d === 6) ? "boundary-animation" : "") // Add animation class if runs scored is a boundary
      .text(d => d);

    // Highlight boundaries
    if (matchData.runs_scored === 4 || matchData.runs_scored === 6) {
      row.selectAll("td").filter(d => d === matchData.runs_scored)
        .classed("boundary-animation", true);
    }
  };

  const updateBattingPerformance = () => {
    d3.select("#batting-line-graph").selectAll("*").remove();

    const svgWidth = 600;
    const svgHeight = 400;

    const svg = d3.select("#batting-line-graph")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);

    const inningsOversData = inningsData[currentInnings];

    if (!inningsOversData) {
      return;
    }

    const uniqueBatsmen = [...new Set(inningsOversData.map((data) => data.batsman))];
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const runsByBall = {};
    const totalBalls = inningsOversData.length;

    uniqueBatsmen.forEach(batsman => {
      runsByBall[batsman] = Array(totalBalls).fill(0);
    });

    inningsOversData.forEach((data, index) => {
      const batsman = data.batsman;
      const runsScored = data.runs_scored;

      if (runsByBall[batsman]) {
        runsByBall[batsman][index] = runsScored;
      }
    });

    uniqueBatsmen.forEach(batsman => {
      for (let i = 1; i < totalBalls; i++) {
        runsByBall[batsman][i] += runsByBall[batsman][i - 1];
      }
    });

    const xScale = d3.scaleLinear()
      .domain([0, totalBalls])
      .range([50, svgWidth - 50]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(Object.values(runsByBall).flat())])
      .range([svgHeight - 50, 50]);

    uniqueBatsmen.forEach((batsman) => {
      const dataPoints = runsByBall[batsman];

      if (!dataPoints || dataPoints.length === 0) {
        console.warn(`No data points for batsman: ${batsman}`);
        return;
      }

      const formattedDataPoints = dataPoints.map((runs, index) => ({
        runs,
        ball: index + 1
      }));

      const line = d3.line()
        .x(d => xScale(d.ball))
        .y(d => yScale(d.runs));

      svg.append("path")
        .datum(formattedDataPoints)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", colorScale(batsman))
        .attr("stroke-width", 2)
        .attr("class", `line-${batsman}`);

      svg.selectAll(`circle-${batsman}`)
        .data(formattedDataPoints)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.ball))
        .attr("cy", d => yScale(d.runs))
        .attr("r", 4)
        .attr("fill", colorScale(batsman));
    });

    const legend = svg.append("g")
      .attr("transform", `translate(${svgWidth - 120}, 20)`);

    uniqueBatsmen.forEach((batsman, index) => {
      legend.append("rect")
        .attr("x", 0)
        .attr("y", index * 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colorScale(batsman));

      legend.append("text")
        .attr("x", 20)
        .attr("y", index * 20 + 12)
        .text(batsman);
    });

    const xAxis = d3.axisBottom(xScale).ticks(30);
    const yAxis = d3.axisLeft(yScale).ticks(7);

    svg.append("g")
      .attr("transform", `translate(0, ${svgHeight - 50})`)
      .call(xAxis)
      .append("text")
      .attr("x", svgWidth / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .text("Balls");

    svg.append("g")
      .attr("transform", "translate(50, 0)")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -svgHeight / 2)
      .attr("y", -40)
      .attr("fill", "black")
      .text("Cumulative Runs");
  };

  const updateBowlingPerformance = () => {
    d3.select("#bowling-bar-graph").selectAll("*").remove();

    const svgWidth = window.innerWidth * 0.9;
    const svgHeight = 300;

    const svg = d3.select("#bowling-bar-graph")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);

    const bowlingStats = matchData.bowling_stats;

    const bowlersData = Object.entries(bowlingStats).map(([bowler, stats]) => {
      const economy = stats.runs_conceded / stats.overs;
      return { bowler, economy };
    });

    bowlersData.sort((a, b) => a.economy - b.economy);

    const xScale = d3.scaleBand()
      .domain(bowlersData.map(d => d.bowler))
      .range([0, svgWidth - 100])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bowlersData, d => d.economy) + 1])
      .range([svgHeight - 50, 50]);

    svg.selectAll(".bar")
      .data(bowlersData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.bowler) + 50) // Move bars slightly to the right
      .attr("y", d => yScale(d.economy))
      .attr("width", xScale.bandwidth())
      .attr("height", d => svgHeight - 50 - yScale(d.economy))
      .attr("fill", "#69b3a2");

    const xAxis = d3.axisBottom(xScale);
    svg.append("g")
      .attr("transform", `translate(0, ${svgHeight - 50})`)
      .call(xAxis);

    const yAxis = d3.axisLeft(yScale).ticks(5);
    svg.append("g")
      .attr("transform", "translate(50, 0)")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Economy Rate");
  };

  return (
    <div>
      <h1>Live Cricket Scoreboard</h1>
      <div id="scoreboard"></div>
      <div id="batting-line-graph"></div>
      <div id="bowling-bar-graph"></div>
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
