const allTransactions = [
  "Amazon Pay - ₹718",
  "Zomato - ₹183",
  "Myntra - ₹1822",
  "Google Play - ₹2",
  "PayZapp - ₹400",
  "Jio Recharge - ₹19",
  "Smoothie Cafe - ₹79",
  "PhonePe - ₹583",
  "Sarita Paytm - ₹90",
];

export default function Vendors() {
  return (
    <div className="container">
      <h1>🧾 All Transactions</h1>

      {allTransactions.map((item, index) => (
        <div className="transaction" key={index}>
          <h3>{item}</h3>
        </div>
      ))}
    </div>
  );
}