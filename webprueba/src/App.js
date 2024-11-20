import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Register from './pages/Register';
import RegisterEmpresa from './pages/RegisterEmpresa';
import Login from './pages/Login';
import Main from './pages/Main';

function App() {
  return (
    <Router>

      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/register-empresa" element={<RegisterEmpresa />} />
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={<Main />} />
        {/* Otras rutas de la aplicación */}
      </Routes>
    </Router>
  );
}

export default App;
