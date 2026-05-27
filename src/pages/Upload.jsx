// src/pages/Upload.jsx
import { useState, useRef } from 'react';
import { Upload, FileText, Image, CheckCircle, AlertCircle, Loader, Plus, FileSearch } from 'lucide-react';
import { categorizeTransaction } from '../lib/aiCategorize';
import { addTransaction, getVendorRules, CATEGORIES, getCategoryColors } from '../lib/store';

const PAYMENT_METHODS = ['UPI', 'Card', 'Cash', 'NetBanking', 'Unknown'];

export default function UploadPage() {
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [savedIds, setSavedIds] = useState(new Set());
  const [successMsg, setSuccessMsg] = useState('');
  const fileRef = useRef();

  const [manual, setManual] = useState({
    vendor: '', amount: '', date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5), category: 'Other',
    paymentMethod: 'UPI', nickname: ''
  });

  const catColors = getCategoryColors();

  const handleFile = async (file) => {
    setError(''); setResults([]); setProcessing(true); setSuccessMsg('');
    try {
      let text = '';
      let fileType = 'text';

      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        setProcessingMsg('READING CSV...');
        text = await file.text();
        fileType = 'csv';
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setProcessingMsg('EXTRACTING PDF TEXT...');
        // Read PDF as text (works for text-based PDFs)
        try {
          text = await file.text();
        } catch {
          text = '';
        }
        // If PDF text is garbled/empty, ask user to paste text
        if (!text || text.length < 20 || /[\x00-\x08\x0E-\x1F]/.test(text.slice(0, 100))) {
          setError('PDF is image-based or encrypted. Please open the PDF, select all text (Ctrl+A), copy it (Ctrl+C), then paste it in the text box below.');
          setProcessing(false);
          return;
        }
        fileType = 'text';
      } else if (file.type.startsWith('image/')) {
        setProcessingMsg('READING IMAGE...');
        setError('Images cannot be read directly in the browser. Please take a screenshot of the text in the image and paste it in the text box below, or use a CSV/text file instead.');
        setProcessing(false);
        return;
      } else {
        setProcessingMsg('PARSING TEXT...');
        text = await file.text();
        fileType = 'text';
      }

      setProcessingMsg('DETECTING TRANSACTIONS...');
      const parsed = await categorizeTransaction(text, fileType);

      if (parsed && parsed.length > 0) {
        const rules = getVendorRules();
        const enriched = parsed.map((p, i) => {
          const rule = rules.find(r => p.vendor?.toLowerCase().includes(r.keyword.toLowerCase()));
          return {
            ...p,
            id: `parsed-${i}-${Date.now()}`,
            amount: p.amount || 0,
            date: p.date || new Date().toISOString().split('T')[0],
            time: p.time || null,
            nickname: rule?.nickname || p.vendor || '',
            category: rule?.category || p.category || 'Other',
            paymentMethod: p.paymentMethod || 'UPI',
          };
        });
        setResults(enriched);
      } else {
        setError(`No transactions detected. Tips: For PDFs — open the PDF, Ctrl+A, Ctrl+C, paste below. For bank statements — try downloading as CSV instead.`);
      }
    } catch (e) {
      setError('Error reading file: ' + e.message);
    }
    setProcessing(false);
  };

  const handlePasteText = async (text) => {
    if (!text.trim()) return;
    setError(''); setResults([]); setProcessing(true);
    setProcessingMsg('ANALYZING PASTED TEXT...');
    try {
      const parsed = await categorizeTransaction(text, 'text');
      if (parsed && parsed.length > 0) {
        const rules = getVendorRules();
        const enriched = parsed.map((p, i) => {
          const rule = rules.find(r => p.vendor?.toLowerCase().includes(r.keyword.toLowerCase()));
          return {
            ...p,
            id: `paste-${i}-${Date.now()}`,
            amount: p.amount || 0,
            date: p.date || new Date().toISOString().split('T')[0],
            time: p.time || null,
            nickname: rule?.nickname || p.vendor || '',
            category: rule?.category || p.category || 'Other',
            paymentMethod: p.paymentMethod || 'UPI',
          };
        });
        setResults(enriched);
      } else {
        setError('No transactions found in pasted text. Make sure it contains amounts like ₹450 or Rs.450.');
      }
    } catch (e) {
      setError('Error: ' + e.message);
    }
    setProcessing(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const saveResult = (result) => {
    addTransaction(result);
    setSavedIds(prev => new Set([...prev, result.id]));
  };

  const saveAll = () => {
    results.forEach(r => { if (!savedIds.has(r.id)) saveResult(r); });
    setSuccessMsg(`✓ ${results.length} transactions saved!`);
  };

  const handleManualSave = () => {
    if (!manual.vendor || !manual.amount) {
      setError('Please fill in Vendor and Amount');
      return;
    }
    addTransaction({ ...manual, amount: parseFloat(manual.amount) });
    setManual({
      vendor: '', amount: '', date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5), category: 'Other',
      paymentMethod: 'UPI', nickname: ''
    });
    setSuccessMsg('✓ Transaction saved!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.headerSub}>// DATA INGESTION MODULE</p>
        <h1 style={styles.headerTitle}>UPLOAD TRANSACTIONS</h1>
      </div>

      {/* Upload Zone */}
      <div
        style={{ ...styles.dropZone, ...(dragOver ? styles.dropZoneActive : {}) }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: 'none' }}
          onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />

        {processing ? (
          <div style={styles.processingState}>
            <Loader size={32} color="#9d5eff" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={styles.processingText}>{processingMsg}</p>
          </div>
        ) : (
          <div style={styles.dropContent}>
            <Upload size={40} color="#7c3aed" />
            <p style={styles.dropTitle}>DROP FILE OR CLICK TO UPLOAD</p>
            <p style={styles.dropSub}>Best support: CSV bank statements — auto-detects all transactions instantly</p>
            <div style={styles.fileTypes}>
              {[['CSV', FileText, '#00ff88'], ['TXT', FileText, '#00d4ff']].map(([type, Icon, color]) => (
                <div key={type} style={{ ...styles.fileType, borderColor: `${color}44`, color }}>
                  <Icon size={12} /> {type}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Paste Text Box */}
      <div style={styles.pastePanel}>
        <div style={styles.pastePanelHeader}>
          <FileSearch size={14} color="#7c3aed" />
          <span style={styles.panelTitle}>PASTE TEXT (for PDFs / SMS / Screenshots)</span>
        </div>
        <p style={styles.pasteHint}>Open your PDF → Ctrl+A → Ctrl+C → paste here. Or paste copied SMS transaction texts.</p>
        <textarea
          style={styles.pasteArea}
          placeholder={`Paste your bank statement text or SMS messages here...\n\nExample:\n28/10/2025 - SWIGGY - Rs.450 debited\n27/10/2025 - UBER - Rs.230 UPI payment\n26/10/2025 - AMAZON - Rs.1299 debit card`}
          rows={6}
          onPaste={e => {
            setTimeout(() => {
              const text = e.target.value;
              if (text.trim()) handlePasteText(text);
            }, 100);
          }}
        />
        <button style={styles.parseBtn} onClick={e => {
          const ta = e.target.closest('div').querySelector('textarea');
          if (ta?.value) handlePasteText(ta.value);
        }}>
          <FileSearch size={14} /> PARSE TEXT
        </button>
      </div>

      {/* Error / Success */}
      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={16} color="#ff4444" style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div style={styles.successBox}>
          <CheckCircle size={16} color="#00ff88" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Parsed Results */}
      {results.length > 0 && (
        <div style={styles.resultsPanel}>
          <div style={styles.resultHeader}>
            <span style={styles.panelTitle}>{results.length} TRANSACTIONS DETECTED</span>
            <button style={styles.saveAllBtn} onClick={saveAll}>SAVE ALL</button>
          </div>
          <div style={styles.resultsList}>
            {results.map((r) => {
              const saved = savedIds.has(r.id);
              return (
                <div key={r.id} style={{ ...styles.resultRow, opacity: saved ? 0.4 : 1 }}>
                  <div style={{ ...styles.resultDot, background: catColors[r.category] || '#6b7280' }} />
                  <div style={styles.resultInfo}>
                    <input style={styles.resultInput} value={r.vendor}
                      onChange={e => setResults(results.map(x => x.id === r.id ? { ...x, vendor: e.target.value } : x))} />
                    <input style={{ ...styles.resultInput, color: '#4a3570', fontSize: '11px' }}
                      value={r.nickname || ''} placeholder="Nickname..."
                      onChange={e => setResults(results.map(x => x.id === r.id ? { ...x, nickname: e.target.value } : x))} />
                  </div>
                  <select style={styles.resultSelect} value={r.category}
                    onChange={e => setResults(results.map(x => x.id === r.id ? { ...x, category: e.target.value } : x))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div style={styles.resultDatetime}>
                    <input type="date" style={{ ...styles.resultInput, fontSize: '10px', color: '#4a3570' }}
                      value={r.date}
                      onChange={e => setResults(results.map(x => x.id === r.id ? { ...x, date: e.target.value } : x))} />
                    <input type="time" style={{ ...styles.resultInput, fontSize: '10px', color: '#7c3aed' }}
                      value={r.time || ''}
                      onChange={e => setResults(results.map(x => x.id === r.id ? { ...x, time: e.target.value } : x))} />
                  </div>
                  <span style={{ ...styles.resultAmount, color: catColors[r.category] }}>
                    ₹{(r.amount||0).toLocaleString('en-IN')}
                  </span>
                  <button style={{ ...styles.saveBtn, ...(saved ? styles.savedBtn : {}) }}
                    onClick={() => !saved && saveResult(r)} disabled={saved}>
                    {saved ? <CheckCircle size={14} /> : 'SAVE'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual Entry */}
      <div style={styles.manualPanel}>
        <div style={styles.resultHeader}>
          <span style={styles.panelTitle}>MANUAL ENTRY</span>
          <Plus size={14} color="#4a3570" />
        </div>
        <div style={styles.manualGrid}>
          {[
            { key: 'vendor', label: 'VENDOR', placeholder: 'e.g. Swiggy' },
            { key: 'nickname', label: 'NICKNAME', placeholder: 'e.g. Late Night Food' },
            { key: 'amount', label: 'AMOUNT (₹)', placeholder: '0', type: 'number' },
            { key: 'date', label: 'DATE', type: 'date' },
            { key: 'time', label: 'TIME', type: 'time' },
          ].map(({ key, label, placeholder, type = 'text' }) => (
            <div key={key} style={styles.formField}>
              <label style={styles.formLabel}>{label}</label>
              <input style={styles.formInput} type={type} value={manual[key]}
                placeholder={placeholder}
                onChange={e => setManual({ ...manual, [key]: e.target.value })} />
            </div>
          ))}
          <div style={styles.formField}>
            <label style={styles.formLabel}>CATEGORY</label>
            <select style={styles.formInput} value={manual.category}
              onChange={e => setManual({ ...manual, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={styles.formField}>
            <label style={styles.formLabel}>PAYMENT</label>
            <select style={styles.formInput} value={manual.paymentMethod}
              onChange={e => setManual({ ...manual, paymentMethod: e.target.value })}>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <button style={styles.manualSaveBtn} onClick={handleManualSave}>
          <Plus size={14} /> ADD TRANSACTION
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '80px 32px 32px', minHeight: '100vh', animation: 'fade-in-up 0.5s ease' },
  header: { marginBottom: '32px' },
  headerSub: { fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: '#4a3570', letterSpacing: '2px', marginBottom: '4px' },
  headerTitle: { fontFamily: 'Orbitron, monospace', fontSize: '28px', fontWeight: 900, color: '#e8d5ff', letterSpacing: '6px', textShadow: '0 0 30px rgba(157, 94, 255, 0.4)' },
  dropZone: { border: '2px dashed rgba(124, 58, 237, 0.3)', borderRadius: '12px', padding: '48px', textAlign: 'center', cursor: 'pointer', background: 'rgba(13, 8, 32, 0.5)', marginBottom: '16px', transition: 'all 0.3s' },
  dropZoneActive: { borderColor: '#9d5eff', background: 'rgba(124, 58, 237, 0.1)', boxShadow: '0 0 30px rgba(124, 58, 237, 0.2)' },
  dropContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  dropTitle: { fontFamily: 'Orbitron, monospace', fontSize: '14px', color: '#9d5eff', letterSpacing: '3px', marginTop: '8px' },
  dropSub: { fontFamily: 'Rajdhani, sans-serif', fontSize: '14px', color: '#4a3570', maxWidth: '400px' },
  fileTypes: { display: 'flex', gap: '12px', marginTop: '4px' },
  fileType: { display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', border: '1px solid', borderRadius: '4px', fontFamily: 'Share Tech Mono, monospace', fontSize: '10px' },
  processingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  processingText: { fontFamily: 'Orbitron, monospace', fontSize: '13px', color: '#9d5eff', letterSpacing: '3px' },
  pastePanel: { background: 'rgba(13, 8, 32, 0.8)', border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: '8px', padding: '20px', marginBottom: '16px' },
  pastePanelHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  panelTitle: { fontFamily: 'Orbitron, monospace', fontSize: '10px', color: '#7c3aed', letterSpacing: '3px' },
  pasteHint: { fontFamily: 'Rajdhani, sans-serif', fontSize: '13px', color: '#4a3570', marginBottom: '12px' },
  pasteArea: { width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '4px', padding: '12px', color: '#e8d5ff', fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', outline: 'none', resize: 'vertical', marginBottom: '12px' },
  parseBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.3)', borderRadius: '4px', color: '#00d4ff', fontFamily: 'Orbitron, monospace', fontSize: '9px', letterSpacing: '2px', cursor: 'pointer' },
  errorBox: { display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '12px 16px', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.3)', borderRadius: '6px', marginBottom: '16px', fontFamily: 'Rajdhani, sans-serif', fontSize: '14px', color: '#ff8888' },
  successBox: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)', borderRadius: '6px', marginBottom: '16px', fontFamily: 'Rajdhani, sans-serif', fontSize: '14px', color: '#00ff88' },
  resultsPanel: { background: 'rgba(13, 8, 32, 0.8)', border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: '8px', padding: '20px', marginBottom: '24px' },
  resultHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(124, 58, 237, 0.1)' },
  saveAllBtn: { padding: '6px 16px', background: 'rgba(124, 58, 237, 0.2)', border: '1px solid rgba(124, 58, 237, 0.4)', borderRadius: '4px', color: '#9d5eff', fontFamily: 'Orbitron, monospace', fontSize: '9px', letterSpacing: '2px', cursor: 'pointer' },
  resultsList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  resultRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(124,58,237,0.1)', flexWrap: 'wrap' },
  resultDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  resultInfo: { flex: 1, minWidth: '120px', display: 'flex', flexDirection: 'column', gap: '4px' },
  resultInput: { background: 'transparent', border: 'none', outline: 'none', color: '#e8d5ff', fontFamily: 'Rajdhani, sans-serif', fontSize: '14px', fontWeight: 600, width: '100%' },
  resultSelect: { background: 'rgba(13, 8, 32, 0.9)', border: '1px solid rgba(124, 58, 237, 0.3)', borderRadius: '4px', color: '#9d7fc8', fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', padding: '4px 8px', cursor: 'pointer' },
  resultDatetime: { display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '90px' },
  resultAmount: { fontFamily: 'Orbitron, monospace', fontSize: '13px', fontWeight: 700, minWidth: '80px', textAlign: 'right' },
  saveBtn: { padding: '6px 12px', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)', borderRadius: '4px', color: '#00ff88', fontFamily: 'Orbitron, monospace', fontSize: '9px', cursor: 'pointer' },
  savedBtn: { background: 'rgba(74, 53, 112, 0.2)', borderColor: 'rgba(74, 53, 112, 0.3)', color: '#4a3570', cursor: 'not-allowed' },
  manualPanel: { background: 'rgba(13, 8, 32, 0.8)', border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: '8px', padding: '20px' },
  manualGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' },
  formField: { display: 'flex', flexDirection: 'column', gap: '6px' },
  formLabel: { fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: '#4a3570', letterSpacing: '2px' },
  formInput: { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(124, 58, 237, 0.25)', borderRadius: '4px', padding: '8px 12px', color: '#e8d5ff', fontFamily: 'Rajdhani, sans-serif', fontSize: '14px', outline: 'none' },
  manualSaveBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: 'rgba(124, 58, 237, 0.2)', border: '1px solid rgba(124, 58, 237, 0.5)', borderRadius: '4px', color: '#9d5eff', fontFamily: 'Orbitron, monospace', fontSize: '10px', letterSpacing: '2px', cursor: 'pointer', boxShadow: '0 0 20px rgba(124, 58, 237, 0.15)' },
};
