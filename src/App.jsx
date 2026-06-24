import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register"
import ClientView from "./pages/ClientView";

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
          <Route path="/client" element={<ClientView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;