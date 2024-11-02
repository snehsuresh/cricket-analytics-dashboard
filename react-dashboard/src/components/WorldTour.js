import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import worldData from '../data/countries.geo.json'; // Import GeoJSON data for the world

const WorldTour = ({ matches }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const width = 960;
        const height = Math.min(width, 720);
        const dpr = window.devicePixelRatio ?? 1;

        // Prepare a canvas
        const canvas = d3.create('canvas')
            .attr('width', dpr * width)
            .attr('height', dpr * height)
            .style('width', `${width}px`);
        const context = canvas.node().getContext('2d');
        context.scale(dpr, dpr);

        // Create a projection and a path generator
        const projection = d3.geoOrthographic().fitExtent([[10, 10], [width - 10, height - 10]], { type: 'Sphere' });
        const path = d3.geoPath(projection, context);
        const tilt = 20;

        const render = (country, arc) => {
            context.clearRect(0, 0, width, height);
            context.beginPath();
            path({ type: 'Sphere' });
            context.fillStyle = '#ccc';
            context.fill();
            context.beginPath();
            path(country);
            context.fillStyle = '#f00';
            context.fill();
            context.beginPath();
            path({ type: 'Sphere' });
            context.strokeStyle = '#000';
            context.lineWidth = 1.5;
            context.stroke();
            context.beginPath();
            path(arc);
            context.stroke();
        };

        // Directly use the features from the GeoJSON
        const countries = worldData.features;

        const drawTour = async () => {
            let p1, p2 = [0, 0], r1, r2 = [0, 0, 0];
            for (const match of matches) {
                // Find the country by matching the 'name' property
                const country = countries.find(c => c.properties.name === match.location);
                if (!country) continue;

                p1 = p2;
                p2 = d3.geoCentroid(country);
                r1 = r2;
                r2 = [-p2[0], tilt - p2[1], 0];

                const ip = d3.geoInterpolate(p1, p2);
                const iv = Versor.interpolateAngles(r1, r2);

                await d3.transition()
                    .duration(1250)
                    .tween('render', () => t => {
                        projection.rotate(iv(t));
                        render(country.geometry, { type: 'LineString', coordinates: [p1, ip(t)] });
                    })
                    .transition()
                    .tween('render', () => t => {
                        render(country.geometry, { type: 'LineString', coordinates: [ip(t), p2] });
                    })
                    .end();
            }
        };

        drawTour();

        // Append the canvas to the ref
        canvasRef.current.appendChild(canvas.node());

        // Clean up on unmount
        return () => {
            canvas.remove();
        };
    }, [matches]);

    return <div ref={canvasRef}></div>;
};

// Versor class as defined in your template
class Versor {
    static fromAngles([l, p, g]) {
        l *= Math.PI / 360;
        p *= Math.PI / 360;
        g *= Math.PI / 360;
        const sl = Math.sin(l), cl = Math.cos(l);
        const sp = Math.sin(p), cp = Math.cos(p);
        const sg = Math.sin(g), cg = Math.cos(g);
        return [
            cl * cp * cg + sl * sp * sg,
            sl * cp * cg - cl * sp * sg,
            cl * sp * cg + sl * cp * sg,
            cl * cp * sg - sl * sp * cg
        ];
    }
    static toAngles([a, b, c, d]) {
        return [
            Math.atan2(2 * (a * b + c * d), 1 - 2 * (b * b + c * c)) * 180 / Math.PI,
            Math.asin(Math.max(-1, Math.min(1, 2 * (a * c - d * b)))) * 180 / Math.PI,
            Math.atan2(2 * (a * d + b * c), 1 - 2 * (c * c + d * d)) * 180 / Math.PI
        ];
    }
    static interpolateAngles(a, b) {
        const i = Versor.interpolate(Versor.fromAngles(a), Versor.fromAngles(b));
        return t => Versor.toAngles(i(t));
    }
    static interpolateLinear([a1, b1, c1, d1], [a2, b2, c2, d2]) {
        a2 -= a1, b2 -= b1, c2 -= c1, d2 -= d1;  // eslint-disable-line no-unused-expressions
        const x = new Array(4);
        return t => {
            const l = Math.hypot(x[0] = a1 + a2 * t, x[1] = b1 + b2 * t, x[2] = c1 + c2 * t, x[3] = d1 + d2 * t);
            x[0] /= l, x[1] /= l, x[2] /= l, x[3] /= l;  // eslint-disable-line no-unused-expressions
            return x;
        };
    }
    static interpolate([a1, b1, c1, d1], [a2, b2, c2, d2]) {
        let dot = a1 * a2 + b1 * b2 + c1 * c2 + d1 * d2;
        if (dot < 0) a2 = -a2, b2 = -b2, c2 = -c2, d2 = -d2, dot = -dot;  // eslint-disable-line no-unused-expressions
        if (dot > 0.9995) return Versor.interpolateLinear([a1, b1, c1, d1], [a2, b2, c2, d2]);
        const theta0 = Math.acos(Math.max(-1, Math.min(1, dot)));
        const x = new Array(4);
        const l = Math.hypot(a2 -= a1 * dot, b2 -= b1 * dot, c2 -= c1 * dot, d2 -= d1 * dot);
        a2 /= l, b2 /= l, c2 /= l, d2 /= l;  // eslint-disable-line no-unused-expressions
        return t => {
            const theta = theta0 * t;
            const s = Math.sin(theta);
            const c = Math.cos(theta);
            x[0] = a1 * c + a2 * s;
            x[1] = b1 * c + b2 * s;
            x[2] = c1 * c + c2 * s;
            x[3] = d1 * c + d2 * s;
            return x;
        };
    }
}

export default WorldTour;
