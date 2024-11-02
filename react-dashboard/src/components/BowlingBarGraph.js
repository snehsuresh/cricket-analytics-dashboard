import React, { useEffect } from 'react';
import * as d3 from 'd3';

const BarChart = ({ matchData }) => {
    useEffect(() => {
        if (matchData) {
            updateBowlingPerformance();
        }
    }, [matchData]);

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
            .attr("x", d => xScale(d.bowler) + 50)
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

    return <div id="bowling-bar-graph"></div>;
};

export default BarChart;
