<template>
  <div class="app">
    <header class="header">
      <h1>💰 Behemoth Expense Tracker</h1>
      <p>Track your expenses and income</p>
    </header>

    <div class="summary-grid">
      <div class="card balance">
        <h3>Current Balance</h3>
        <h2>₹54,892.88</h2>
      </div>

      <div class="card income">
        <h3>Total Credits</h3>
        <h2>₹52,989.01</h2>
      </div>

      <div class="card expense">
        <h3>Total Debits</h3>
        <h2>₹18,109.13</h2>
      </div>
    </div>

    <div class="transactions">
      <h2>Recent Transactions</h2>

      <div
        class="transaction"
        v-for="(item, index) in transactions"
        :key="index"
      >
        <div>
          <h4>{{ item.title }}</h4>
          <p>{{ item.date }}</p>
        </div>

        <div
          :class="item.type === 'credit' ? 'credit-text' : 'debit-text'"
        >
          {{ item.type === 'credit' ? '+' : '-' }}₹{{ item.amount }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const transactions = [
  {
    title: "Amazon Pay",
    amount: 718,
    type: "debit",
    date: "21 Aug 2025",
  },
  {
    title: "Rent Credit",
    amount: 50000,
    type: "credit",
    date: "29 Aug 2025",
  },
  {
    title: "Zomato",
    amount: 183.33,
    type: "debit",
    date: "22 Aug 2025",
  },
  {
    title: "Myntra",
    amount: 1822,
    type: "debit",
    date: "20 Sep 2025",
  },
  {
    title: "Google Pay Credit",
    amount: 583.01,
    type: "credit",
    date: "26 Sep 2025",
  },
];
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Arial;
}

body {
  background: #0f172a;
  color: white;
}

.app {
  max-width: 900px;
  margin: auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 40px;
  margin-bottom: 10px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  padding: 25px;
  border-radius: 16px;
  background: #1e293b;
  box-shadow: 0 0 10px rgba(0,0,0,0.3);
}

.card h3 {
  margin-bottom: 10px;
  color: #cbd5e1;
}

.balance {
  border-left: 5px solid #38bdf8;
}

.income {
  border-left: 5px solid #22c55e;
}

.expense {
  border-left: 5px solid #ef4444;
}

.transactions {
  background: #1e293b;
  padding: 20px;
  border-radius: 16px;
}

.transactions h2 {
  margin-bottom: 20px;
}

.transaction {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #334155;
}

.credit-text {
  color: #22c55e;
  font-weight: bold;
}

.debit-text {
  color: #ef4444;
  font-weight: bold;
}
</style>