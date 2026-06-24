import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Client from "./pages/Client";
import Register from "./pages/Register"

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
        {/* Əsas Səhifə Marşrutları */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/client" element={<Client />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;