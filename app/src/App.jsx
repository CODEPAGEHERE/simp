// src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';


import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Keep all these imports, but verify their PascalCase consistency below!
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MakeSchedule from './pages/MakeSchedule';
import SavedSchedule from './pages/SavedSchedule';
import NotFound from './pages/NotFound';

const ForgotPassword = () => (
    <div className="d-flex align-items-center justify-content-center vh-100">
        <h1>Forgot Password Page Under Construction!</h1>
    </div>
);

function App() {
    return (
        // REMOVE THE <AuthProvider> AND </AuthProvider> TAGS HERE
        // The Layout component will now be the direct child of the App component's return.
        <Layout>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected Routes */}
                {/* ProtectedRoute should wrap the OUTLET for nested routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/make-schedule" element={<MakeSchedule />} />
                    <Route path="/saved-schedule" element={<SavedSchedule />} />

                    {/* Add more protected routes here */}
                    <Route path="/schedule/:id" element={<div>Schedule Detail (Protected)</div>} />
                    <Route path="/schedule/edit/:id" element={<div>Schedule Edit (Protected)</div>} />
                </Route>

                {/* 404 Catch-all Route - MUST BE THE LAST ROUTE */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Layout>
    );
}

export default App;