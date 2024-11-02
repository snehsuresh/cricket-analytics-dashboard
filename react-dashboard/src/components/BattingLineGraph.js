import React, { useEffect } from 'react';
import * as d3 from 'd3';

const LineGraph = ({ inningsData, currentInnings }) => {
    useEffect(() => {
        updateBattingPerformance();
    }, [inningsData, currentInnings]);

    const updateBattingPerformance = () => {
        d3.select("#batting-line-graph").selectAll("*").remove();

        const svgWidth = 600;
        const svgHeight = 400;
        const margin = { top: 20, right: 30, bottom: 50, left: 50 };

        const svg = d3.select("#batting-line-graph")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

        const inningsOversData = inningsData[currentInnings];

        if (!inningsOversData) return;

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

        // Define the scales
        const xScale = d3.scaleLinear()
            .domain([0, totalBalls])
            .range([margin.left, svgWidth - margin.right]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(Object.values(runsByBall).flat())])
            .range([svgHeight - margin.bottom, margin.top]);

        // Add X and Y axes
        const xAxis = d3.axisBottom(xScale).ticks(10);
        const yAxis = d3.axisLeft(yScale).ticks(5);

        svg.append("g")
            .attr("transform", `translate(0, ${svgHeight - margin.bottom})`)
            .call(xAxis);

        svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(yAxis);

        // Draw the line for each batsman
        uniqueBatsmen.forEach((batsman) => {
            const dataPoints = runsByBall[batsman];

            if (!dataPoints.length) return;

            const line = d3.line()
                .x((d, i) => xScale(i + 1)) // Adjusting the ball index
                .y(d => yScale(d));

            svg.append("path")
                .datum(dataPoints)
                .attr("d", line)
                .attr("fill", "none")
                .attr("stroke", colorScale(batsman))
                .attr("stroke-width", 2);

            svg.selectAll(`circle-${batsman}`)
                .data(dataPoints.map((runs, index) => ({ runs, ball: index + 1 })))
                .enter()
                .append("circle")
                .attr("cx", d => xScale(d.ball))
                .attr("cy", d => yScale(d.runs))
                .attr("r", 4)
                .attr("fill", colorScale(batsman));
        });

        // Add a legend to differentiate batsmen
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

        // Add labels to the axes
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", svgWidth / 2)
            .attr("y", svgHeight - 10)
            .text("Balls");

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", -(svgHeight / 2))
            .attr("y", 15)
            .attr("transform", "rotate(-90)")
            .text("Runs Scored");
    };

    return <div id="batting-line-graph"></div>;
};

export default LineGraph;
