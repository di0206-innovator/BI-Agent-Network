import React from 'react';

/**
 * StartupGraph — SVG visualization of a node-graph representing
 * interconnected startup data points. Used as the hero visual on
 * the landing page and in the "How it compounds" section.
 */
export default function StartupGraph({ className = '' }) {
  // Node definitions representing full ecosystem relationships (Audit Section 8)
  const nodes = [
    { id: 'startup', x: 300, y: 220, r: 24, fill: '#1A1A1A', label: 'STARTUP', labelX: 0, labelY: 38 },
    { id: 'founder', x: 160, y: 110, r: 12, fill: '#C8E64A', label: 'Founder', labelX: 0, labelY: -18 },
    { id: 'funding', x: 440, y: 100, r: 12, fill: '#C8E64A', label: 'Funding', labelX: 0, labelY: -18 },
    { id: 'investor', x: 490, y: 220, r: 10, fill: '#111827', label: 'VC / Angel', labelX: 15, labelY: 16 },
    { id: 'mentor', x: 430, y: 340, r: 10, fill: '#6B7280', label: 'Mentors', labelX: 0, labelY: 20 },
    { id: 'gov', x: 280, y: 370, r: 10, fill: '#C8E64A', label: 'Gov & Grants', labelX: 0, labelY: 20 },
    { id: 'univ', x: 150, y: 330, r: 10, fill: '#6B7280', label: 'University', labelX: -10, labelY: 20 },
    { id: 'accelerator', x: 110, y: 220, r: 10, fill: '#111827', label: 'Accelerator', labelX: -15, labelY: 16 },
    { id: 'tech', x: 280, y: 70, r: 8, fill: '#9CA3AF', label: 'Tech Stack', labelX: 0, labelY: -14 },
    { id: 'competitor', x: 400, y: 160, r: 8, fill: '#9CA3AF', label: 'Competitors', labelX: 15, labelY: -10 },
  ];

  // Edge connections mapping ecosystem graph relationships
  const edges = [
    ['startup', 'founder'], ['startup', 'funding'], ['startup', 'investor'],
    ['startup', 'mentor'], ['startup', 'gov'], ['startup', 'univ'],
    ['startup', 'accelerator'], ['startup', 'tech'], ['startup', 'competitor'],
    ['funding', 'investor'], ['founder', 'univ'], ['accelerator', 'startup'],
    ['gov', 'funding'], ['mentor', 'accelerator']
  ];

  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  return (
    <div className={`relative ${className}`}>
      <div className="rounded-2xl border border-light bg-card p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-outfit font-semibold tracking-[0.12em] uppercase text-text-muted">
              Live · Startup Graph
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500/100"></span>
            </span>
            <span className="text-[10px] font-semibold text-green-500 tracking-wide">synced</span>
          </div>
        </div>

        {/* SVG Graph */}
        <svg viewBox="0 0 600 440" className="w-full h-auto" aria-label="Startup Graph visualization showing interconnected startup data points">
          {/* Edges */}
          {edges.map(([from, to], i) => {
            const a = nodeMap[from];
            const b = nodeMap[to];
            return (
              <line
                key={i}
                x1={a.x} y1={a.y}
                x2={b.x} y2={b.y}
                stroke="#E5E7EB"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              {/* Glow for accent nodes */}
              {node.fill === '#C8E64A' && (
                <circle
                  cx={node.x} cy={node.y} r={node.r + 6}
                  fill="#C8E64A" opacity="0.15"
                  className="animate-pulse-soft"
                />
              )}
              <circle
                cx={node.x} cy={node.y} r={node.r}
                fill={node.fill}
                stroke={node.fill === '#1A1A1A' ? '#1A1A1A' : 'none'}
                strokeWidth="0"
              />
              {node.label && (
                <text
                  x={node.x + (node.labelX || 0)}
                  y={node.y + (node.labelY || 0)}
                  textAnchor="middle"
                  className="fill-gray-500"
                  style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}
                >
                  {node.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
