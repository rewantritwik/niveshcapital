import React, { useState, useCallback, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function PortfolioChart({ data = [] }) {
  const [width, setWidth] = useState(0);
  const observerRef = useRef(null);

  const containerRef = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (node !== null) {
      const observer = new ResizeObserver((entries) => {
        if (entries[0]) {
          setWidth(entries[0].contentRect.width);
        }
      });
      observer.observe(node);
      observerRef.current = observer;
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full mt-4" style={{ height: '280px' }} data-testid="portfolio-chart">
      {width > 0 && (
        <AreaChart width={width} height={280} data={data}>
          <XAxis dataKey="name" stroke="#6b7280" tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
          <YAxis stroke="#6b7280" tickLine={false} axisLine={false} domain={['dataMin - 1000', 'dataMax + 1000']} style={{ fontSize: '12px' }} />
          <Tooltip contentStyle={{ backgroundColor: '#0a0f1d', borderColor: '#1f2937', borderRadius: '12px', color: '#fff' }} />
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#chartGradient)" />
        </AreaChart>
      )}
    </div>
  );
}
