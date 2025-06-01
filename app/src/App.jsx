import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/signup'; 
import './App.css';
import NotFound from './pages/NotFound';
import Login from './pages/Login'; 
import Dashboard from './pages/dashboard';
// Placeholder for ForgotPassword
const ForgotPassword = () => (
    <div className="d-flex align-items-center justify-content-center vh-100">
        <h1>Forgot Password Page Under Construction!</h1>
    </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
		   <Route path="/register" element={<Signup />} />
           <Route path="/login" element={<Login />} />
		   <Route path="/dashboard" element={<Dashboard />} /> 
           <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* We will add /login and /register routes here later */}
		  
         {/* This is the 404 catch-all route - MUST BE LAST! */}	 
          <Route path="*" element={<NotFound />} /> {/* <-- NEW 404 ROUTE */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;