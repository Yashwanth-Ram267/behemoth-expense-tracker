// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, BarChart3, Settings, Zap } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'DASHBOARD' },
  { path: '/upload', icon: Upload, label: 'UPLOAD' },
  { path: '/analytics', icon: BarChart3, label: 'ANALYTICS' },
  { path: '/vendors', icon: Settings, label: 'VENDORS' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}><Zap size={16} color="#ff1a1a" /></div>
        <span style={styles.logoText}>BEHEMOTH</span>
        <span style={styles.logoSub}>FINANCE</span>
      </div>
      <div style={styles.links}>
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} style={{ textDecoration: 'none' }}>
              <div style={{ ...styles.link, ...(active ? styles.linkActive : {}) }}>
                <Icon size={14} color={active ? '#9d5eff' : '#4a3570'} />
                <span style={{ ...styles.linkLabel, color: active ? '#9d5eff' : '#4a3570' }}>{label}</span>
                {active && <div style={styles.activeDot} />}
              </div>
            </Link>
          );
        })}
      </div>
      <div style={styles.status}>
        <div style={styles.statusDot} />
        <span style={styles.statusText}>SYSTEM ONLINE</span>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 32px', height: '60px',
    background: 'rgba(8, 4, 20, 0.95)',
    borderBottom: '1px solid rgba(124, 58, 237, 0.2)',
    backdropFilter: 'blur(20px)',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '8px' },
  logoIcon: {
    width: '28px', height: '28px', borderRadius: '4px',
    background: 'rgba(255, 26, 26, 0.1)',
    border: '1px solid rgba(255, 26, 26, 0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 12px rgba(255, 26, 26, 0.3)',
  },
  logoText: {
    fontFamily: 'Orbitron, monospace', fontSize: '14px', fontWeight: 800,
    letterSpacing: '4px', color: '#e8d5ff',
  },
  logoSub: {
    fontFamily: 'Share Tech Mono, monospace', fontSize: '9px',
    color: '#4a3570', letterSpacing: '2px',
  },
  links: { display: 'flex', gap: '4px' },
  link: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '6px 14px', borderRadius: '4px',
    border: '1px solid transparent',
    cursor: 'pointer', position: 'relative',
    transition: 'all 0.2s',
  },
  linkActive: {
    background: 'rgba(124, 58, 237, 0.1)',
    border: '1px solid rgba(124, 58, 237, 0.3)',
    boxShadow: '0 0 12px rgba(124, 58, 237, 0.15)',
  },
  linkLabel: {
    fontFamily: 'Orbitron, monospace', fontSize: '9px',
    fontWeight: 600, letterSpacing: '2px',
  },
  activeDot: {
    position: 'absolute', bottom: '-1px', left: '50%',
    transform: 'translateX(-50%)',
    width: '4px', height: '2px', borderRadius: '1px',
    background: '#9d5eff', boxShadow: '0 0 6px #9d5eff',
  },
  status: { display: 'flex', alignItems: 'center', gap: '8px' },
  statusDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    background: '#00ff88', boxShadow: '0 0 8px #00ff88',
    animation: 'pulse-glow 2s infinite',
  },
  statusText: {
    fontFamily: 'Share Tech Mono, monospace', fontSize: '9px',
    color: '#006633', letterSpacing: '2px',
  },
};
