import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Import the AuthProvider to wrap the entire application
import { AuthProvider } from './context/AuthContext';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import SignUp from './pages/SignUp';
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
    // Removed:
    // const navigate = useNavigate();
    // const [isAuthenticated, setIsAuthenticated] = useState(false);
    // useEffect to check token on mount
    // HandleLogout function

    return (
        // Wrap your entire application with AuthProvider.
        // This makes the AuthContext available to all nested components.
        <AuthProvider>
            {/* Layout no longer needs isAuthenticated or onLogout props passed from App */}
            <Layout>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<SignUp />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    {/* Protected Routes */}
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
        </AuthProvider>
    );
}

export default App;