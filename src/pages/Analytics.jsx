export default function Analytics() {
  const categories = [
    { name: "Food", amount: 1200 },
    { name: "Shopping", amount: 3200 },
    { name: "Recharge", amount: 200 },
    { name: "Entertainment", amount: 500 },
    { name: "Transfers", amount: 4500 },
  ];

  return (
    <div className="container">
      <h1>📈 Expense Categories</h1>

      {categories.map((item, index) => (
        <div className="transaction" key={index}>
          <h3>{item.name}</h3>
          <h3>₹{item.amount}</h3>
        </div>
      ))}
    </div>
  );
}