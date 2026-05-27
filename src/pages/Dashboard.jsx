const transactions = [
  { name: "Amazon", amount: 718, type: "Shopping" },
  { name: "Zomato", amount: 183, type: "Food" },
  { name: "Jio Recharge", amount: 19, type: "Recharge" },
  { name: "Myntra", amount: 1822, type: "Shopping" },
  { name: "Google Play", amount: 2, type: "Entertainment" },
  { name: "PayZapp", amount: 400, type: "Transfer" },
];

export default function Dashboard() {
  return (
    <div className="container">
      <h1>📊 Dashboard</h1>

      <div className="cards">
        <div className="card">
          <h3>Current Balance</h3>
          <h2>₹54,892.88</h2>
        </div>

        <div className="card green">
          <h3>Total Credits</h3>
          <h2>₹52,989.01</h2>
        </div>

        <div className="card red">
          <h3>Total Debits</h3>
          <h2>₹18,109.13</h2>
        </div>
      </div>

      <div className="transactions">
        <h2>Recent Transactions</h2>

        {transactions.map((item, index) => (
          <div className="transaction" key={index}>
            <div>
              <h3>{item.name}</h3>
              <p>{item.type}</p>
            </div>

            <h3>₹{item.amount}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}