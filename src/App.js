import React from 'react';
import { BrowserRouter as Router, Routes , Route } from 'react-router-dom';
import Call from "./components/Call";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Call />}  />
      </Routes>
    </Router>
  );
}

export default App;