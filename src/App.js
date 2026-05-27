import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Vendors from "./pages/Vendors";
import Navbar from "./components/Navbar";
import { useState } from "react";

function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div>
      <Navbar setPage={setPage} />

      {page === "dashboard" && <Dashboard />}
      {page === "analytics" && <Analytics />}
      {page === "vendors" && <Vendors />}
    </div>
  );
}

export default App;