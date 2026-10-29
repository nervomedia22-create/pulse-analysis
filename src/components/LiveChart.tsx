import React, { useState, useMemo } from 'react';
import { useAnalytics } from '../services/analyticsStore';

type ChartMetric = 'activeUsers' | 'eventsPerSec' | 'avgDwellSec';

export const LiveChart: React.FC = () => {
  const { timeSeries, config } = useAnalytics();
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>('activeUsers');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const metricConfig = {
    activeUsers: {
      label: 'Concurrent Active Visitors',
      unit: 'visitors',
      color: '#6366f1', // Indigo
      gradientId: 'indigoGrad',
      formatter: (v: number) => `${v.toLocaleString()} users`,
    },
    eventsPerSec: {
      label: 'Event Ingestion Rate',
      unit: 'ev/sec',
      color: '#06b6d4', // Cyan
      gradientId: 'cyanGrad',
      formatter: (v: number) => `${v.toLocaleString()} ev/s`,
    },
    avgDwellSec: {
      label: 'Average Active Dwell Time',
      unit: 'sec',
      color: '#10b981', // Emerald
      gradientId: 'emeraldGrad',
      formatter: (v: number) => `${v}s on page`,
    },
  };

  const currentCfg = metricConfig[selectedMetric];

  // SVG dimensions
  const width = 850;
  const height = 260;
  const padding = { top: 20, right: 30, bottom: 35, left: 55 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales and coordinates
  const { points, minVal, maxVal, avgVal, pathD, areaD } = useMemo(() => {
    if (!timeSeries.length) {
      return { points: [], minVal: 0, maxVal: 100, avgVal: 50, pathD: '', areaD: '' };
    }

    const values = timeSeries.map((d) => d[selectedMetric]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

    // Add 10% breathing room to min and max
    const range = max - min || 1;
    const yMin = Math.max(0, Math.floor(min - range * 0.15));
    const yMax = Math.ceil(max + range * 0.15);

    const stepX = chartWidth / (timeSeries.length - 1 || 1);

    const coords = timeSeries.map((d, i) => {
      const x = padding.left + i * stepX;
      const normalizedY = (d[selectedMetric] - yMin) / (yMax - yMin || 1);
      const y = padding.top + chartHeight - normalizedY * chartHeight;
      return { x, y, data: d, val: d[selectedMetric] };
    });

    // Generate smooth SVG curve using cubic bezier control points
    let pD = '';
    let aD = '';
    if (coords.length > 0) {
      pD = `M ${coords[0].x} ${coords[0].y}`;
      for (let i = 0; i < coords.length - 1; i++) {
        const p0 = coords[i === 0 ? 0 : i - 1];
        const p1 = coords[i];
        const p2 = coords[i + 1];
        const p3 = coords[i + 2] || p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        pD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }

      const lastX = coords[coords.length - 1].x;
      const bottomY = padding.top + chartHeight;
      aD = `${pD} L ${lastX} ${bottomY} L ${coords[0].x} ${bottomY} Z`;
    }

    return { points: coords, minVal: min, maxVal: max, avgVal: avg, pathD: pD, areaD: aD };
  }, [timeSeries, selectedMetric, chartWidth, chartHeight]);

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="p-6 mx-6 rounded-xl bg-slate-900/60 border border-slate-800/80 mb-6">
      {/* Chart Top Header & Metric Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Real-Time Engagement Timeline</span>
            <span className="text-xs text-slate-500 font-normal">·</span>
            <span className="text-xs font-mono text-slate-400">
              {config.isPaused ? 'Paused' : 'Streaming 1s intervals'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous telemetry feed displaying concurrent active participants and interaction intensity.
          </p>
        </div>

        {/* Metric Segmented Control */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => setSelectedMetric('activeUsers')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              selectedMetric === 'activeUsers'
                ? 'bg-indigo-600/90 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Visitors
          </button>
          <button
            onClick={() => setSelectedMetric('eventsPerSec')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              selectedMetric === 'eventsPerSec'
                ? 'bg-cyan-600/90 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Events / Sec
          </button>
          <button
            onClick={() => setSelectedMetric('avgDwellSec')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              selectedMetric === 'avgDwellSec'
                ? 'bg-emerald-600/90 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dwell Time
          </button>
        </div>
      </div>

      {/* Summary Stat Ribbon */}
      <div className="flex items-center gap-6 text-xs text-slate-400 pb-3 border-b border-slate-800/60">
        <div>
          <span className="text-slate-500">Current: </span>
          <span className="font-mono tabular-nums font-semibold text-white">
            {activePoint ? currentCfg.formatter(activePoint.val) : '--'}
          </span>
        </div>
        <div className="hidden sm:block text-slate-700">|</div>
        <div>
          <span className="text-slate-500">Peak: </span>
          <span className="font-mono tabular-nums text-slate-300">
            {currentCfg.formatter(maxVal)}
          </span>
        </div>
        <div className="hidden sm:block text-slate-700">|</div>
        <div>
          <span className="text-slate-500">Trough: </span>
          <span className="font-mono tabular-nums text-slate-300">
            {currentCfg.formatter(minVal)}
          </span>
        </div>
        <div className="hidden sm:block text-slate-700">|</div>
        <div>
          <span className="text-slate-500">Window Avg: </span>
          <span className="font-mono tabular-nums text-slate-300">
            {currentCfg.formatter(avgVal)}
          </span>
        </div>
      </div>

      {/* SVG Canvas Chart */}
      <div className="relative mt-4 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + chartHeight * pct;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Area Fill */}
          {areaD && (
            <path
              d={areaD}
              fill={`url(#${currentCfg.gradientId})`}
              className="transition-all duration-300"
            />
          )}

          {/* Spline Path */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={currentCfg.color}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          )}

          {/* Interactive Mouse Hover Crosshair and Dot */}
          {points.map((pt, idx) => {
            const isLatest = idx === points.length - 1;
            const isHovered = hoverIndex === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoverIndex(idx)}
                className="cursor-pointer"
              >
                {/* Hit target zone */}
                <rect
                  x={pt.x - chartWidth / points.length / 2}
                  y={padding.top}
                  width={chartWidth / points.length}
                  height={chartHeight}
                  fill="transparent"
                />

                {/* Vertical cursor guideline when hovered */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={padding.top}
                    x2={pt.x}
                    y2={padding.top + chartHeight}
                    stroke="#475569"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Leading pulse indicator on the latest live point */}
                {isLatest && !isHovered && (
                  <g>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="6"
                      fill={currentCfg.color}
                      opacity="0.3"
                      className="animate-ping"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="3.5"
                      fill={currentCfg.color}
                    />
                  </g>
                )}

                {/* Point dot when hovered */}
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    fill="#ffffff"
                    stroke={currentCfg.color}
                    strokeWidth="2.5"
                  />
                )}
              </g>
            );
          })}

          {/* X Axis Time Labels */}
          {points.length > 0 &&
            [0, Math.floor(points.length / 4), Math.floor(points.length / 2), Math.floor((points.length * 3) / 4), points.length - 1].map(
              (idx) => {
                const pt = points[idx];
                if (!pt) return null;
                return (
                  <text
                    key={idx}
                    x={pt.x}
                    y={height - 10}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {pt.data.label}
                  </text>
                );
              }
            )}

          {/* Left Y Axis Labels */}
          <text
            x={padding.left - 10}
            y={padding.top + 5}
            textAnchor="end"
            fill="#64748b"
            fontSize="10"
            fontFamily="monospace"
          >
            {maxVal}
          </text>
          <text
            x={padding.left - 10}
            y={padding.top + chartHeight / 2 + 3}
            textAnchor="end"
            fill="#64748b"
            fontSize="10"
            fontFamily="monospace"
          >
            {avgVal}
          </text>
          <text
            x={padding.left - 10}
            y={padding.top + chartHeight}
            textAnchor="end"
            fill="#64748b"
            fontSize="10"
            fontFamily="monospace"
          >
            {minVal}
          </text>
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div
            className="absolute pointer-events-none px-3 py-2 rounded-lg bg-slate-950/95 border border-slate-700/80 shadow-xl text-xs z-20 backdrop-blur-sm"
            style={{
              left: `${Math.min(width - 150, Math.max(20, points[hoverIndex].x))}px`,
              top: `${Math.max(10, points[hoverIndex].y - 65)}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="text-[10px] text-slate-400 font-mono">
              {points[hoverIndex].data.label}
            </div>
            <div className="font-semibold text-white font-mono tabular-nums mt-0.5">
              {currentCfg.formatter(points[hoverIndex].val)}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1 border-t border-slate-800 pt-1">
              <span>Bounce: {points[hoverIndex].data.bounceRatePct}%</span>
              <span>·</span>
              <span>Rate: {points[hoverIndex].data.eventsPerSec} ev/s</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
