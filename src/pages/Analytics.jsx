// src/pages/Analytics.jsx
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { getTransactions, getCategoryColors, CATEGORIES } from '../lib/store';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d0820', border: '1px solid rgba(124,58,237,0.4)', padding: '8px 12px', borderRadius: '4px' }}>
      <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: '#9d5eff', marginBottom: '4px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontFamily: 'Orbitron, monospace', fontSize: '12px', color: p.color }}>₹{p.value?.toLocaleString('en-IN')}</p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [transactions, setTransactions] = useState([]);
  const catColors = getCategoryColors();

  useEffect(() => { setTransactions(getTransactions()); }, []);

  const total = transactions.reduce((s, t) => s + t.amount, 0);

  // Category pie data
  const catData = CATEGORIES.map(cat => ({
    name: cat,
    value: transactions.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0),
    color: catColors[cat],
  })).filter(d => d.value > 0);

  // Daily spending (last 14 days)
  const dayMap = {};
  transactions.forEach(t => {
    dayMap[t.date] = (dayMap[t.date] || 0) + t.amount;
  });
  const dailyData = Object.entries(dayMap).sort((a,b) => a[0].localeCompare(b[0])).slice(-14).map(([date, amount]) => ({
    date: date.slice(5), amount,
  }));

  // Hour heatmap
  const hourMap = Array(24).fill(0);
  transactions.forEach(t => {
    if (t.time) {
      const h = parseInt(t.time.split(':')[0]);
      hourMap[h] += t.amount;
    }
  });
  const hourData = hourMap.map((amt, h) => ({ hour: `${h.toString().padStart(2,'0')}:00`, amount: amt }));

  // Top vendors
  const vendorMap = {};
  transactions.forEach(t => {
    const key = t.nickname || t.vendor;
    vendorMap[key] = (vendorMap[key] || 0) + t.amount;
  });
  const topVendors = Object.entries(vendorMap).sort((a,b) => b[1]-a[1]).slice(0,8).map(([name, amount]) => ({ name, amount }));

  // Payment methods
  const payMap = {};
  transactions.forEach(t => { payMap[t.paymentMethod || 'Unknown'] = (payMap[t.paymentMethod] || 0) + 1; });
  const payData = Object.entries(payMap).map(([name, count]) => ({ name, count }));

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.headerSub}>// BEHAVIORAL ANALYSIS ENGINE</p>
        <h1 style={styles.headerTitle}>ANALYTICS</h1>
      </div>

      {/* Summary */}
      <div style={styles.summaryRow}>
        {[
          { label: 'TOTAL ANALYZED', value: `₹${total.toLocaleString('en-IN')}`, color: '#ff4444' },
          { label: 'AVG PER TXN', value: `₹${transactions.length ? Math.round(total/transactions.length).toLocaleString('en-IN') : 0}`, color: '#9d5eff' },
          { label: 'TOP CATEGORY', value: catData[0]?.name || '—', color: catColors[catData[0]?.name] || '#00d4ff' },
          { label: 'TOP VENDOR', value: topVendors[0]?.name || '—', color: '#00ff88' },
        ].map((s, i) => (
          <div key={i} style={styles.summaryCard}>
            <span style={styles.summaryLabel}>{s.label}</span>
            <span style={{ ...styles.summaryValue, color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={styles.chartsRow}>
        {/* Daily Spending */}
        <div style={styles.chartPanel}>
          <div style={styles.chartTitle}>DAILY SPENDING TREND</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
              <XAxis dataKey="date" tick={{ fontFamily: 'Share Tech Mono', fontSize: 9, fill: '#4a3570' }} />
              <YAxis tick={{ fontFamily: 'Share Tech Mono', fontSize: 9, fill: '#4a3570' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="amount" stroke="#9d5eff" strokeWidth={2} dot={{ fill: '#9d5eff', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div style={styles.chartPanel}>
          <div style={styles.chartTitle}>CATEGORY DISTRIBUTION</div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <PieChart width={160} height={160}>
              <Pie data={catData} cx={75} cy={75} innerRadius={45} outerRadius={75} dataKey="value" strokeWidth={0}>
                {catData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
            <div style={styles.pieList}>
              {catData.slice(0, 6).map((d) => (
                <div key={d.name} style={styles.pieLegend}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: d.color, flexShrink: 0 }} />
                  <span style={styles.pieName}>{d.name}</span>
                  <span style={{ ...styles.pieVal, color: d.color }}>{((d.value/total)*100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={styles.chartsRow}>
        {/* Top Vendors */}
        <div style={styles.chartPanel}>
          <div style={styles.chartTitle}>TOP VENDORS BY SPEND</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topVendors} layout="vertical">
              <XAxis type="number" tick={{ fontFamily: 'Share Tech Mono', fontSize: 9, fill: '#4a3570' }} />
              <YAxis dataKey="name" type="category" tick={{ fontFamily: 'Rajdhani', fontSize: 12, fill: '#9d7fc8' }} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill="#7c3aed" radius={[0, 2, 2, 0]}>
                {topVendors.map((_, i) => <Cell key={i} fill={`hsl(${260 + i * 15}, 70%, ${50 + i * 3}%)`} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hour Heatmap */}
        <div style={styles.chartPanel}>
          <div style={styles.chartTitle}>SPENDING BY HOUR OF DAY</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourData.filter(h => h.amount > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
              <XAxis dataKey="hour" tick={{ fontFamily: 'Share Tech Mono', fontSize: 8, fill: '#4a3570' }} />
              <YAxis tick={{ fontFamily: 'Share Tech Mono', fontSize: 9, fill: '#4a3570' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill="#ff1a6e" radius={[2, 2, 0, 0]}>
                {hourData.map((d, i) => {
                  const h = i;
                  const isNight = h >= 22 || h < 6;
                  const isEvening = h >= 18 && h < 22;
                  return <Cell key={i} fill={isNight ? '#ff1a6e' : isEvening ? '#8b5cf6' : '#00d4ff'} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={styles.legend}>
            {[['#00d4ff', 'DAY'], ['#8b5cf6', 'EVENING'], ['#ff1a6e', 'NIGHT']].map(([color, label]) => (
              <div key={label} style={styles.legendItem}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }} />
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: '#4a3570' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div style={styles.insightPanel}>
        <div style={styles.insightTitle}>⚡ AI INSIGHTS</div>
        <div style={styles.insights}>
          {catData[0] && <div style={styles.insight}>Your highest spending category is <span style={{ color: catColors[catData[0].name] }}>{catData[0].name}</span> at ₹{catData[0].value.toLocaleString('en-IN')} ({((catData[0].value/total)*100).toFixed(0)}% of total)</div>}
          {topVendors[0] && <div style={styles.insight}>Most visited vendor: <span style={{ color: '#9d5eff' }}>{topVendors[0].name}</span> with ₹{topVendors[0].value?.toLocaleString('en-IN') || topVendors[0].amount?.toLocaleString('en-IN')}</div>}
          {hourData.reduce((max, h) => h.amount > max.amount ? h : max, hourData[0])?.hour && (
            <div style={styles.insight}>Peak spending hour: <span style={{ color: '#ff1a6e' }}>{hourData.reduce((max, h) => h.amount > max.amount ? h : max, hourData[0]).hour}</span></div>
          )}
          <div style={styles.insight}>Total transactions analyzed: <span style={{ color: '#00ff88' }}>{transactions.length}</span> across <span style={{ color: '#00d4ff' }}>{catData.length}</span> categories</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '80px 32px 32px', minHeight: '100vh', animation: 'fade-in-up 0.5s ease' },
  header: { marginBottom: '32px' },
  headerSub: { fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: '#4a3570', letterSpacing: '2px', marginBottom: '4px' },
  headerTitle: { fontFamily: 'Orbitron, monospace', fontSize: '28px', fontWeight: 900, color: '#e8d5ff', letterSpacing: '6px', textShadow: '0 0 30px rgba(157, 94, 255, 0.4)' },
  summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  summaryCard: { background: 'rgba(13, 8, 32, 0.8)', border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: '8px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  summaryLabel: { fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: '#4a3570', letterSpacing: '2px' },
  summaryValue: { fontFamily: 'Orbitron, monospace', fontSize: '16px', fontWeight: 700 },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' },
  chartPanel: { background: 'rgba(13, 8, 32, 0.8)', border: '1px solid rgba(124, 58, 237, 0.15)', borderRadius: '8px', padding: '20px' },
  chartTitle: { fontFamily: 'Orbitron, monospace', fontSize: '9px', color: '#7c3aed', letterSpacing: '3px', marginBottom: '16px' },
  pieList: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  pieLegend: { display: 'flex', alignItems: 'center', gap: '8px' },
  pieName: { fontFamily: 'Rajdhani, sans-serif', fontSize: '13px', color: '#9d7fc8', flex: 1 },
  pieVal: { fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', fontWeight: 700 },
  legend: { display: 'flex', gap: '16px', marginTop: '8px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  insightPanel: { background: 'rgba(13, 8, 32, 0.8)', border: '1px solid rgba(157, 94, 255, 0.2)', borderRadius: '8px', padding: '20px', boxShadow: '0 0 30px rgba(124, 58, 237, 0.1)' },
  insightTitle: { fontFamily: 'Orbitron, monospace', fontSize: '10px', color: '#9d5eff', letterSpacing: '3px', marginBottom: '12px' },
  insights: { display: 'flex', flexDirection: 'column', gap: '8px' },
  insight: { fontFamily: 'Rajdhani, sans-serif', fontSize: '15px', color: '#9d7fc8', paddingLeft: '12px', borderLeft: '2px solid rgba(124, 58, 237, 0.3)' },
};
