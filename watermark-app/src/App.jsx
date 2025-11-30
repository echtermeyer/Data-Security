import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Landing from "./pages/Landing";
import ChallengeMode from "./pages/ChallengeMode";
import BenchmarkMode from "./pages/BenchmarkMode";
import Ownership from "./pages/Ownership";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/challenge" element={<ChallengeMode />} />
          <Route path="/benchmark" element={<BenchmarkMode />} />
          <Route path="/ownership" element={<Ownership />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
