// src/lib/store.js
// Simple in-memory store using localStorage for persistence

const STORAGE_KEY = 'behemoth_expenses';
const VENDOR_KEY = 'behemoth_vendors';

export function getTransactions() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getSampleData();
  } catch { return getSampleData(); }
}

export function saveTransactions(txns) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
}

export function getVendorRules() {
  try {
    const data = localStorage.getItem(VENDOR_KEY);
    return data ? JSON.parse(data) : getDefaultVendors();
  } catch { return getDefaultVendors(); }
}

export function saveVendorRules(rules) {
  localStorage.setItem(VENDOR_KEY, JSON.stringify(rules));
}

export function addTransaction(txn) {
  const txns = getTransactions();
  const newTxn = { ...txn, id: Date.now().toString() + Math.random().toString(36).slice(2) };
  txns.unshift(newTxn);
  saveTransactions(txns);
  return newTxn;
}

export function deleteTransaction(id) {
  const txns = getTransactions().filter(t => t.id !== id);
  saveTransactions(txns);
}

export function updateTransaction(id, updates) {
  const txns = getTransactions().map(t => t.id === id ? { ...t, ...updates } : t);
  saveTransactions(txns);
}

export function getCategoryColors() {
  return {
    'Food': '#ff6b35',
    'Transport': '#00d4ff',
    'Shopping': '#c084fc',
    'Entertainment': '#ff1a6e',
    'Utilities': '#00ff88',
    'Healthcare': '#ff4444',
    'Education': '#fbbf24',
    'Travel': '#06b6d4',
    'Subscription': '#8b5cf6',
    'Other': '#6b7280',
  };
}

export const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Healthcare', 'Education', 'Travel', 'Subscription', 'Other'];

function getDefaultVendors() {
  return [
    { keyword: 'swiggy', category: 'Food', nickname: 'Late Night Food', color: '#ff6b35' },
    { keyword: 'zomato', category: 'Food', nickname: 'Zomato Orders', color: '#ff6b35' },
    { keyword: 'uber', category: 'Transport', nickname: 'Rides', color: '#00d4ff' },
    { keyword: 'ola', category: 'Transport', nickname: 'Cab Service', color: '#00d4ff' },
    { keyword: 'amazon', category: 'Shopping', nickname: 'Amazon Haul', color: '#c084fc' },
    { keyword: 'flipkart', category: 'Shopping', nickname: 'Flipkart Buys', color: '#c084fc' },
    { keyword: 'netflix', category: 'Subscription', nickname: 'Netflix', color: '#8b5cf6' },
    { keyword: 'spotify', category: 'Subscription', nickname: 'Music', color: '#8b5cf6' },
    { keyword: 'dominos', category: 'Food', nickname: 'Pizza Night', color: '#ff6b35' },
  ];
}

function getSampleData() {
  const now = new Date();
  const sample = [
    { id: '1', date: fmt(now, -1), time: '22:43', vendor: 'Swiggy', amount: 450, category: 'Food', nickname: 'Late Night Food', paymentMethod: 'UPI' },
    { id: '2', date: fmt(now, -1), time: '09:15', vendor: 'Uber', amount: 230, category: 'Transport', nickname: 'Rides', paymentMethod: 'UPI' },
    { id: '3', date: fmt(now, -2), time: '14:20', vendor: 'Amazon', amount: 1299, category: 'Shopping', nickname: 'Amazon Haul', paymentMethod: 'Card' },
    { id: '4', date: fmt(now, -2), time: '19:05', vendor: 'Zomato', amount: 380, category: 'Food', nickname: 'Zomato Orders', paymentMethod: 'UPI' },
    { id: '5', date: fmt(now, -3), time: '08:00', vendor: 'Spotify', amount: 119, category: 'Subscription', nickname: 'Music', paymentMethod: 'Card' },
    { id: '6', date: fmt(now, -3), time: '11:30', vendor: 'Flipkart', amount: 799, category: 'Shopping', nickname: 'Flipkart Buys', paymentMethod: 'UPI' },
    { id: '7', date: fmt(now, -4), time: '20:10', vendor: 'Dominos', amount: 599, category: 'Food', nickname: 'Pizza Night', paymentMethod: 'Card' },
    { id: '8', date: fmt(now, -5), time: '13:45', vendor: 'Ola', amount: 180, category: 'Transport', nickname: 'Cab Service', paymentMethod: 'UPI' },
    { id: '9', date: fmt(now, -5), time: '16:22', vendor: 'Netflix', amount: 649, category: 'Subscription', nickname: 'Netflix', paymentMethod: 'Card' },
    { id: '10', date: fmt(now, -6), time: '10:00', vendor: 'BigBasket', amount: 2100, category: 'Shopping', nickname: 'Groceries', paymentMethod: 'UPI' },
    { id: '11', date: fmt(now, -7), time: '23:15', vendor: 'Swiggy', amount: 320, category: 'Food', nickname: 'Late Night Food', paymentMethod: 'UPI' },
    { id: '12', date: fmt(now, -8), time: '07:30', vendor: 'Petrol Pump', amount: 1500, category: 'Transport', nickname: 'Fuel', paymentMethod: 'Card' },
  ];
  saveTransactions(sample);
  return sample;
}

function fmt(date, daysOffset) {
  const d = new Date(date);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}
