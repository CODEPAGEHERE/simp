import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'; 
import Home from './pages/Home';
import Signup from './pages/signup';
import './App.css';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Dashboard from './pages/dashboard'; 
import MakeSchedule from './pages/MakeSchedule'; 
import ProtectedRoute from './components/ProtectedRoute'; 
import SaveSchedule from './pages/SaveSchedule'; 

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
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
		  
          <Route
            path="/make-schedule"
            element={
              <ProtectedRoute>
                <MakeSchedule />
              </ProtectedRoute>
            }
          />
		  
		  
		   {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <SaveSchedule />
              </ProtectedRoute>
            }
          />

          {/* Add more protected routes here as needed */}

          {/* This is the 404 catch-all route - MUST BE LAST! */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;