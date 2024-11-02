import React, { useEffect } from 'react';
import * as d3 from 'd3';

const Scoreboard = ({ matchData }) => {
    useEffect(() => {
        if (matchData) {
            updateScoreboard(matchData);
        }
    }, [matchData]);

    const updateScoreboard = (matchData) => {
        const scoreboard = d3.select("#scoreboard").selectAll("*").remove();

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
            .attr("class", d => (d === 4 || d === 6) ? "boundary-animation" : "")
            .text(d => d);

        if (matchData.runs_scored === 4 || matchData.runs_scored === 6) {
            row.selectAll("td").filter(d => d === matchData.runs_scored)
                .classed("boundary-animation", true);
        }
    };

    return <div id="scoreboard"></div>;
};

export default Scoreboard;
