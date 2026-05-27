// src/pages/Vendors.jsx
import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { getVendorRules, saveVendorRules, CATEGORIES, getCategoryColors, getTransactions, updateTransaction } from '../lib/store';

export default function Vendors() {
  const [rules, setRules] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [newRule, setNewRule] = useState({ keyword: '', category: 'Food', nickname: '', color: '#7c3aed' });
  const [transactions, setTransactions] = useState([]);
  const catColors = getCategoryColors();
  const COLORS = ['#ff6b35','#00d4ff','#c084fc','#ff1a6e','#00ff88','#ff4444','#fbbf24','#06b6d4','#8b5cf6','#6b7280'];

  useEffect(() => {
    setRules(getVendorRules());
    setTransactions(getTransactions());
  }, []);

  const save = (r) => { saveVendorRules(r); setRules(r); };

  const addRule = () => {
    if (!newRule.keyword) return;
    const updated = [...rules, { ...newRule, id: Date.now().toString() }];
    save(updated);
    setNewRule({ keyword: '', category: 'Food', nickname: '', color: '#7c3aed' });
  };

  const deleteRule = (idx) => save(rules.filter((_, i) => i !== idx));

  const startEdit = (idx) => { setEditId(idx); setEditData({ ...rules[idx] }); };

  const saveEdit = (idx) => {
    const updated = rules.map((r, i) => i === idx ? editData : r);
    save(updated);
    // Re-apply rule to matching transactions
    transactions.forEach(t => {
      if (t.vendor?.toLowerCase().includes(editData.keyword.toLowerCase())) {
        updateTransaction(t.id, { category: editData.category, nickname: editData.nickname });
      }
    });
    setEditId(null);
  };

  // Group transactions by vendor
  const vendorMap = {};
  transactions.forEach(t => {
    const key = t.vendor || 'Unknown';
    if (!vendorMap[key]) vendorMap[key] = { count: 0, total: 0, category: t.category, nickname: t.nickname };
    vendorMap[key].count++;
    vendorMap[key].total += t.amount;
  });
  const vendorList = Object.entries(vendorMap).sort((a,b) => b[1].total - a[1].total);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.headerSub}>// VENDOR INTELLIGENCE LAYER</p>
        <h1 style={styles.headerTitle}>VENDOR MANAGEMENT</h1>
      </div>

      <div style={styles.grid}>
        {/* Rules Panel */}
        <div>
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <span style={styles.panelTitle}>AUTO-CATEGORIZATION RULES</span>
              <span style={styles.count}>{rules.length} RULES</span>
            </div>
            <div style={styles.rulesList}>
              {rules.map((rule, idx) => (
                <div key={idx} style={styles.ruleRow}>
                  {editId === idx ? (
                    <div style={styles.editRow}>
                      <input style={styles.editInput} value={editData.keyword} onChange={e => setEditData({...editData, keyword: e.target.value})} placeholder="Keyword" />
                      <input style={styles.editInput} value={editData.nickname} onChange={e => setEditData({...editData, nickname: e.target.value})} placeholder="Nickname" />
                      <select style={styles.editSelect} value={editData.category} onChange={e => setEditData({...editData, category: e.target.value})}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div style={styles.colorRow}>
                        {COLORS.map(c => (
                          <div key={c} onClick={() => setEditData({...editData, color: c})}
                            style={{ ...styles.colorDot, background: c, outline: editData.color === c ? `2px solid white` : 'none' }} />
                        ))}
                      </div>
                      <div style={styles.actionBtns}>
                        <button style={styles.saveBtn} onClick={() => saveEdit(idx)}><Save size={12} /></button>
                        <button style={styles.cancelBtn} onClick={() => setEditId(null)}><X size={12} /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ ...styles.ruleColor, background: rule.color || catColors[rule.category] }} />
                      <div style={styles.ruleInfo}>
                        <span style={styles.ruleKeyword}>{rule.keyword}</span>
                        <span style={styles.ruleNickname}>{rule.nickname || '—'}</span>
                      </div>
                      <span style={{ ...styles.ruleCat, color: catColors[rule.category], borderColor: `${catColors[rule.category]}44` }}>
                        {rule.category}
                      </span>
                      <div style={styles.ruleActions}>
                        <button style={styles.iconBtn} onClick={() => startEdit(idx)}><Edit3 size={12} color="#9d7fc8" /></button>
                        <button style={styles.iconBtn} onClick={() => deleteRule(idx)}><Trash2 size={12} color="#ff4444" /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Rule */}
            <div style={styles.addSection}>
              <div style={styles.panelTitle} style={{ fontFamily: 'Orbitron, monospace', fontSize: '9px', color: '#4a3570', letterSpacing: '2px', marginBottom: '12px' }}>ADD NEW RULE</div>
              <div style={styles.addGrid}>
                <input style={styles.formInput} placeholder="Vendor keyword (e.g. swiggy)" value={newRule.keyword} onChange={e => setNewRule({...newRule, keyword: e.target.value})} />
                <input style={styles.formInput} placeholder="Nickname (e.g. Late Night Food)" value={newRule.nickname} onChange={e => setNewRule({...newRule, nickname: e.target.value})} />
                <select style={styles.formInput} value={newRule.category} onChange={e => setNewRule({...newRule, category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div style={styles.colorRow}>
                  {COLORS.map(c => (
                    <div key={c} onClick={() => setNewRule({...newRule, color: c})}
                      style={{ ...styles.colorDot, background: c, outline: newRule.color === c ? `2px solid white` : 'none' }} />
                  ))}
                </div>
              </div>
              <button style={styles.addBtn} onClick={addRule}>
                <Plus size={14} /> ADD RULE
              </button>
            </div>
          </div>
        </div>

        {/* Vendor Activity */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>VENDOR ACTIVITY</span>
          </div>
          <div style={styles.vendorList}>
            {vendorList.map(([vendor, data], i) => {
              const color = catColors[data.category] || '#9d5eff';
              return (
                <div key={vendor} style={styles.vendorRow}>
                  <div style={{ ...styles.vendorRank, color: i < 3 ? '#fbbf24' : '#4a3570' }}>#{i+1}</div>
                  <div style={styles.vendorInfo}>
                    <span style={styles.vendorName}>{data.nickname || vendor}</span>
                    <span style={styles.vendorOrig}>{vendor}</span>
                  </div>
                  <div style={styles.vendorStats}>
                    <span style={{ ...styles.vendorCat, color, borderColor: `${color}33` }}>{data.category}</span>
                    <span style={styles.vendorCount}>{data.count}x</span>
                    <span style={{ ...styles.vendorTotal, color }}>₹{data.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
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
  grid: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' },
  panel: { background: 'rgba(13, 8, 32, 0.8)', border: '1px solid rgba(124, 58, 237, 0.15)', borderRadius: '8px', padding: '20px' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(124, 58, 237, 0.1)' },
  panelTitle: { fontFamily: 'Orbitron, monospace', fontSize: '10px', color: '#7c3aed', letterSpacing: '3px' },
  count: { fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: '#4a3570' },
  rulesList: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' },
  ruleRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(124,58,237,0.08)', flexWrap: 'wrap' },
  ruleColor: { width: '10px', height: '10px', borderRadius: '3px', flexShrink: 0 },
  ruleInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
  ruleKeyword: { fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: '#e8d5ff' },
  ruleNickname: { fontFamily: 'Rajdhani, sans-serif', fontSize: '12px', color: '#4a3570' },
  ruleCat: { fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', padding: '2px 8px', border: '1px solid', borderRadius: '2px' },
  ruleActions: { display: 'flex', gap: '6px' },
  iconBtn: { background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' },
  editRow: { display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' },
  editInput: { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '4px', padding: '6px 10px', color: '#e8d5ff', fontFamily: 'Rajdhani, sans-serif', fontSize: '13px', outline: 'none' },
  editSelect: { background: 'rgba(13, 8, 32, 0.9)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '4px', padding: '6px 10px', color: '#9d7fc8', fontFamily: 'Share Tech Mono, monospace', fontSize: '10px' },
  colorRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  colorDot: { width: '16px', height: '16px', borderRadius: '4px', cursor: 'pointer', outlineOffset: '2px' },
  actionBtns: { display: 'flex', gap: '8px' },
  saveBtn: { padding: '6px 12px', background: 'rgba(0, 255, 136, 0.15)', border: '1px solid rgba(0, 255, 136, 0.3)', borderRadius: '4px', color: '#00ff88', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  cancelBtn: { padding: '6px 12px', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.3)', borderRadius: '4px', color: '#ff4444', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  addSection: { paddingTop: '16px', borderTop: '1px solid rgba(124,58,237,0.1)' },
  addGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' },
  formInput: { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '4px', padding: '8px 12px', color: '#e8d5ff', fontFamily: 'Rajdhani, sans-serif', fontSize: '13px', outline: 'none' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: 'rgba(124, 58, 237, 0.2)', border: '1px solid rgba(124, 58, 237, 0.5)', borderRadius: '4px', color: '#9d5eff', fontFamily: 'Orbitron, monospace', fontSize: '9px', letterSpacing: '2px', cursor: 'pointer' },
  vendorList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  vendorRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(124,58,237,0.08)' },
  vendorRank: { fontFamily: 'Orbitron, monospace', fontSize: '10px', fontWeight: 700, minWidth: '28px' },
  vendorInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
  vendorName: { fontFamily: 'Rajdhani, sans-serif', fontSize: '14px', fontWeight: 600, color: '#e8d5ff' },
  vendorOrig: { fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: '#4a3570' },
  vendorStats: { display: 'flex', alignItems: 'center', gap: '8px' },
  vendorCat: { fontFamily: 'Share Tech Mono, monospace', fontSize: '8px', padding: '2px 6px', border: '1px solid', borderRadius: '2px' },
  vendorCount: { fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: '#4a3570' },
  vendorTotal: { fontFamily: 'Orbitron, monospace', fontSize: '12px', fontWeight: 700 },
};
