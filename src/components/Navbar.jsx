export default function Navbar({ setPage }) {
  return (
    <nav className="navbar">
      <h2>💰 Expense Tracker</h2>

      <div className="nav-buttons">
        <button onClick={() => setPage("dashboard")}>Dashboard</button>
        <button onClick={() => setPage("analytics")}>Categories</button>
        <button onClick={() => setPage("vendors")}>Transactions</button>
      </div>
    </nav>
  );
}