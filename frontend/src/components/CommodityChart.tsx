"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export interface HistoryPoint {
  date: string;
  price: number;
}

interface CommodityChartProps {
  data: HistoryPoint[];
  unit: string;
  /** Quando true, aplica paleta de cores de previsão (roxo) em vez de histórico (ciano) */
  isForecast?: boolean;
}

export default function CommodityChart({ data, unit, isForecast = false }: CommodityChartProps) {
  const accentColor = isForecast ? '#a78bfa' : '#00c6ff';
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '12px',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>{label}</p>
          <p style={{ margin: '4px 0 0', fontWeight: 'bold', fontSize: '1.1rem', color: accentColor }}>
            R$ {payload[0].value.toFixed(2)} <span style={{fontSize:'0.8rem', color: '#cbd5e1', fontWeight: 'normal'}}>/{unit}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: '350px', marginTop: '1.5rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={accentColor} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={accentColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            // Gives some padding mathematically so the line doesn't hit the top/bottom literally
            domain={['dataMin - (dataMin * 0.05)', 'dataMax + (dataMax * 0.05)']}
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            tickFormatter={(value) => `R$${value.toFixed(0)}`}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={accentColor} 
            strokeWidth={3}
            strokeDasharray={isForecast ? '6 3' : undefined}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            animationDuration={1500}
            activeDot={{ r: 6, fill: accentColor, stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
