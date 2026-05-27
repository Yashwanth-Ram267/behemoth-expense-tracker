// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingDown, Clock, Zap, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { getTransactions, getCategoryColors, CATEGORIES } from '../lib/store';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  const catColors = getCategoryColors();
  const total = transactions.reduce((s, t) => s + t.amount, 0);

  // Category breakdown
  const byCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = transactions.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0);
    return acc;
  }, {});
  const topCategories = Object.entries(byCategory).filter(([,v]) => v > 0).sort((a,b) => b[1]-a[1]).slice(0, 5);

  // Recent transactions
  const recent = transactions.slice(0, 8);

  // Time breakdown
  const morning = transactions.filter(t => { const h = parseInt(t.time); return h >= 6 && h < 12; });
  const afternoon = transactions.filter(t => { const h = parseInt(t.time); return h >= 12 && h < 18; });
  const evening = transactions.filter(t => { const h = parseInt(t.time); return h >= 18 && h < 22; });
  const night = transactions.filter(t => { const h = parseInt(t.time); return h >= 22 || h < 6; });

  const timeData = [
    { label: 'MORNING', color: '#fbbf24', txns: morning, emoji: '☀️' },
    { label: 'AFTERNOON', color: '#f97316', txns: afternoon, emoji: '🌤️' },
    { label: 'EVENING', color: '#8b5cf6', txns: evening, emoji: '🌆' },
    { label: 'NIGHT', color: '#ff1a6e', txns: night, emoji: '🌙' },
  ];

  return (
    <div style={styles.page}>
      {/* Scanline effect */}
      <div style={styles.scanline} />

      {/* Header */}
      <div style={styles.header}>
        <div>
          <p style={styles.headerSub}>// NEURAL FINANCE INTERFACE v2.1</p>
          <h1 style={styles.headerTitle}>COMMAND CENTER</h1>
        </div>
        <Link to="/upload" style={styles.uploadBtn}>
          <Zap size={14} /> UPLOAD DATA
        </Link>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        {[
          { label: 'TOTAL SPENT', value: `₹${total.toLocaleString('en-IN')}`, color: '#ff4444', icon: TrendingDown },
          { label: 'TRANSACTIONS', value: transactions.length, color: '#9d5eff', icon: Zap },
          { label: 'CATEGORIES', value: topCategories.length, color: '#00d4ff', icon: AlertTriangle },
          { label: 'LARGEST', value: `₹${Math.max(...transactions.map(t=>t.amount)||[0]).toLocaleString('en-IN')}`, color: '#00ff88', icon: ArrowUpRight },
        ].map((s, i) => (
          <div key={i} style={{ ...styles.statCard, animationDelay: `${i * 0.1}s` }}>
            <div style={styles.statTop}>
              <span style={{ ...styles.statLabel }}>{s.label}</span>
              <s.icon size={16} color={s.color} />
            </div>
            <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
            <div style={{ ...styles.statBar, background: `linear-gradient(90deg, ${s.color}33, transparent)` }} />
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={styles.grid}>
        {/* Recent Transactions */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>RECENT TRANSACTIONS</span>
            <Clock size={12} color="#4a3570" />
          </div>
          <div style={styles.txnList}>
            {recent.map((txn, i) => (
              <div key={txn.id} style={{ ...styles.txnRow, animationDelay: `${i * 0.05}s` }}>
                <div style={{ ...styles.txnDot, background: catColors[txn.category] || '#6b7280' }} />
                <div style={styles.txnInfo}>
                  <span style={styles.txnVendor}>{txn.nickname || txn.vendor}</span>
                  <span style={styles.txnTime}>{txn.date} {txn.time && `@ ${txn.time}`}</span>
                </div>
                <div style={styles.txnRight}>
                  <span style={{ ...styles.txnAmount, color: catColors[txn.category] || '#9d5eff' }}>
                    -₹{txn.amount.toLocaleString('en-IN')}
                  </span>
                  <span style={{ ...styles.txnCat, borderColor: `${catColors[txn.category]}44`, color: catColors[txn.category] }}>
                    {txn.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={styles.rightCol}>
          {/* Category Bars */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <span style={styles.panelTitle}>SPENDING BY CATEGORY</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topCategories.map(([cat, val]) => (
                <div key={cat}>
                  <div style={styles.catBarHeader}>
                    <span style={styles.catName}>{cat}</span>
                    <span style={{ ...styles.catVal, color: catColors[cat] }}>₹{val.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={styles.catBarBg}>
                    <div style={{
                      ...styles.catBarFill,
                      width: `${(val / total * 100).toFixed(1)}%`,
                      background: catColors[cat],
                      boxShadow: `0 0 8px ${catColors[cat]}88`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Patterns */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <span style={styles.panelTitle}>TIME PATTERNS</span>
            </div>
            <div style={styles.timeGrid}>
              {timeData.map(({ label, color, txns, emoji }) => (
                <div key={label} style={{ ...styles.timeCard, borderColor: `${color}33` }}>
                  <div style={styles.timeEmoji}>{emoji}</div>
                  <div style={{ ...styles.timeLabel, color }}>{label}</div>
                  <div style={styles.timeCount}>{txns.length} TXN</div>
                  <div style={{ ...styles.timeAmt, color }}>
                    ₹{txns.reduce((s,t)=>s+t.amount,0).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '80px 32px 32px',
    minHeight: '100vh',
    position: 'relative',
    animation: 'fade-in-up 0.5s ease',
  },
  scanline: {
    position: 'fixed', top: 0, left: 0, right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)',
    animation: 'scanline 4s linear infinite',
    pointerEvents: 'none', zIndex: 50,
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    marginBottom: '32px',
  },
  headerSub: {
    fontFamily: 'Share Tech Mono, monospace', fontSize: '11px',
    color: '#4a3570', letterSpacing: '2px', marginBottom: '4px',
  },
  headerTitle: {
    fontFamily: 'Orbitron, monospace', fontSize: '28px', fontWeight: 900,
    color: '#e8d5ff', letterSpacing: '6px',
    textShadow: '0 0 30px rgba(157, 94, 255, 0.4)',
  },
  uploadBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 20px',
    background: 'rgba(124, 58, 237, 0.15)',
    border: '1px solid rgba(124, 58, 237, 0.5)',
    borderRadius: '4px', color: '#9d5eff',
    fontFamily: 'Orbitron, monospace', fontSize: '10px',
    letterSpacing: '2px', textDecoration: 'none',
    boxShadow: '0 0 20px rgba(124, 58, 237, 0.2)',
    transition: 'all 0.2s',
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px', marginBottom: '24px',
  },
  statCard: {
    background: 'rgba(13, 8, 32, 0.8)',
    border: '1px solid rgba(124, 58, 237, 0.2)',
    borderRadius: '8px', padding: '20px',
    position: 'relative', overflow: 'hidden',
    animation: 'fade-in-up 0.5s ease forwards',
    opacity: 0,
  },
  statTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  statLabel: {
    fontFamily: 'Share Tech Mono, monospace', fontSize: '9px',
    color: '#4a3570', letterSpacing: '2px',
  },
  statValue: {
    fontFamily: 'Orbitron, monospace', fontSize: '22px',
    fontWeight: 700, letterSpacing: '1px',
  },
  statBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '2px',
  },
  grid: {
    display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px',
  },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
  panel: {
    background: 'rgba(13, 8, 32, 0.8)',
    border: '1px solid rgba(124, 58, 237, 0.15)',
    borderRadius: '8px', padding: '20px',
  },
  panelHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '16px', paddingBottom: '12px',
    borderBottom: '1px solid rgba(124, 58, 237, 0.1)',
  },
  panelTitle: {
    fontFamily: 'Orbitron, monospace', fontSize: '10px',
    color: '#7c3aed', letterSpacing: '3px',
  },
  txnList: { display: 'flex', flexDirection: 'column', gap: '4px' },
  txnRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 12px', borderRadius: '6px',
    border: '1px solid transparent',
    transition: 'all 0.2s',
    cursor: 'default',
    animation: 'slide-in-left 0.4s ease forwards',
    opacity: 0,
  },
  txnDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  txnInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
  txnVendor: { fontFamily: 'Rajdhani, sans-serif', fontSize: '14px', fontWeight: 600, color: '#e8d5ff' },
  txnTime: { fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: '#4a3570' },
  txnRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
  txnAmount: { fontFamily: 'Orbitron, monospace', fontSize: '13px', fontWeight: 700 },
  txnCat: {
    fontFamily: 'Share Tech Mono, monospace', fontSize: '8px',
    padding: '2px 6px', borderRadius: '2px', border: '1px solid',
    letterSpacing: '1px',
  },
  catBarHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' },
  catName: { fontFamily: 'Rajdhani, sans-serif', fontSize: '13px', color: '#9d7fc8', fontWeight: 600 },
  catVal: { fontFamily: 'Share Tech Mono, monospace', fontSize: '11px' },
  catBarBg: { height: '4px', background: 'rgba(124,58,237,0.1)', borderRadius: '2px' },
  catBarFill: { height: '100%', borderRadius: '2px', transition: 'width 1s ease' },
  timeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  timeCard: {
    padding: '14px', borderRadius: '6px',
    border: '1px solid', background: 'rgba(0,0,0,0.3)',
    display: 'flex', flexDirection: 'column', gap: '4px',
  },
  timeEmoji: { fontSize: '18px' },
  timeLabel: { fontFamily: 'Orbitron, monospace', fontSize: '8px', fontWeight: 700, letterSpacing: '2px' },
  timeCount: { fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: '#4a3570' },
  timeAmt: { fontFamily: 'Orbitron, monospace', fontSize: '13px', fontWeight: 700 },
};
