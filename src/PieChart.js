import React, { useState, useEffect } from 'react';
import './PieChart.css';

const PieChart = ({ data, width, height }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const [animatedPaths, setAnimatedPaths] = useState([]);
    const [highlightedIndex] = useState(null);
    const [detachedIndex, setDetachedIndex] = useState(null);
    const [detachedOffset] = useState(12);
    let startAngle = 0;

    useEffect(() => {
        const animatePaths = () => {
            const animatedPathsData = data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const angle = (percentage * 360) / 100;
                const endAngle = startAngle + angle;
                startAngle = endAngle;

                return {
                    index,
                    angle,
                };
            });
            setAnimatedPaths(animatedPathsData);
        };

        animatePaths();
    }, [data, total]);

    const toRadians = (deg) => (deg * Math.PI) / 180;

    const radius = Math.min(width, height) / 2.5;
    const centerX = width / 2;
    const centerY = height / 2;

    const calculateCoordinates = (angle, radiusOffset) => {
        const x = centerX + Math.cos(toRadians(angle)) * radiusOffset;
        const y = centerY + Math.sin(toRadians(angle)) * radiusOffset;
        return { x, y };
    };

    const getPathData = (startX, startY, endX, endY, radius, largeArcFlag) => {
        return `
            M ${centerX},${centerY}
            L ${startX},${startY}
            A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY}
            Z
        `;
    };

    const handleSectorClick = (index) => {
        if (detachedIndex === index) {
            setDetachedIndex(null);
        } else {
            setDetachedIndex(index);
        }
    };

    return (
        <svg width={width} height={height}>
            <defs>
                <filter id="drop-shadow">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
                    <feOffset dx="0" dy="2" result="offsetblur" />
                    <feFlood floodColor="rgba(0,0,0,0.1)" />
                    <feComposite in2="offsetblur" operator="in" />
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            {animatedPaths.map(({ index, angle }) => {
                const midAngle = startAngle + angle / 2;
                const isDetached = detachedIndex === index;
                const isHighlighted = highlightedIndex === index;
                const detachedRadius = radius + (isDetached ? detachedOffset : 0);

                const { x: startX, y: startY } = calculateCoordinates(startAngle, isDetached ? detachedRadius : radius);
                const { x: endX, y: endY } = calculateCoordinates(startAngle + angle, isDetached ? detachedRadius : radius);

                const largeArcFlag = angle <= 180 ? '0' : '1';

                const gradientId = `gradient-${index}`;
                const gradientColors = [`hsl(${index * (360 / data.length)}, 70%, 60%)`, `hsl(${(index + 1) * (360 / data.length)}, 70%, 60%)`];

                const pathData = getPathData(startX, startY, endX, endY, isDetached ? detachedRadius : radius, largeArcFlag);

                startAngle += angle;

                const transform = isDetached ? `translate(${Math.cos(toRadians(midAngle)) * detachedOffset}, ${Math.sin(toRadians(midAngle)) * detachedOffset})` : '';

                return (
                    <g
                        key={index}
                        onClick={() => handleSectorClick(index)}
                        className={`sector ${isHighlighted ? 'highlighted' : ''} ${isDetached ? 'detached' : ''}`}
                    >
                        <defs>
                            <linearGradient id={gradientId}>
                                <stop offset="0%" stopColor={gradientColors[0]} />
                                <stop offset="100%" stopColor={gradientColors[1]} />
                            </linearGradient>
                        </defs>
                        <path
                            d={pathData}
                            fill={`url(#${gradientId})`}
                            transform={transform}
                            className={`sector-path ${isHighlighted ? 'highlighted' : ''} ${isDetached ? 'detached' : ''}`}
                            style={{
                                filter: isHighlighted || isDetached ? 'url(#drop-shadow)' : 'none',
                            }}
                        />
                        <text
                            x={centerX + Math.cos(toRadians(midAngle)) * (radius * 0.6)}
                            y={centerY + Math.sin(toRadians(midAngle)) * (radius * 0.6)}
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            className={`sector-text ${isHighlighted ? 'highlighted' : ''} ${isDetached ? 'detached' : ''}`}
                            style={{
                                filter: isHighlighted || isDetached ? 'url(#drop-shadow)' : 'none',
                                transition: '0.3s',
                            }}
                        >
                            {`${data[index].name} (${(data[index].value / total * 100).toFixed(1)}%)`}
                        </text>
                        <style>
                            {`@keyframes fade-in-${index} {
                                to {
                                    opacity: 1;
                                }
                            }`}
                        </style>
                    </g>
                );
            })}
        </svg>
    );
};

export default PieChart;
