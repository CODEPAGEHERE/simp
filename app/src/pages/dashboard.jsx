// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css'; // Assuming this has your main app background styles
import Nav from '../components/Nav'; // Correctly importing Nav for protected routes

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');
  const [lastLogin, setLastLogin] = useState('N/A');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_SIMP_API_POINT;

  // Function to handle logout - Defined within Dashboard to manage its state and navigation
  const handleLogout = () => {
    console.log("DEBUG: Logging out from Dashboard page..."); // Added for debugging
    localStorage.removeItem('jwtToken'); // **Crucial:** Remove the token from local storage
    navigate('/login'); // **Crucial:** Redirect to the login page
  };

  // Function to fetch user data and other dashboard info
  useEffect(() => {
    const fetchDashboardData = async () => {
      // **CRITICAL CHECK 1: Token Retrieval**
      const token = localStorage.getItem('jwtToken');
      console.log("DEBUG: Dashboard useEffect: Checking for token. Token found:", !!token); // Debug log
      if (!token) {
        console.warn("DEBUG: Dashboard useEffect: No token found, redirecting to login."); // Debug log
        navigate('/login'); // Redirect to login if no token is found
        return; // Stop execution of this useEffect
      }

      try {
        console.log("DEBUG: Dashboard useEffect: Attempting to fetch /auth/me with token..."); // Debug log
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Ensure 'Bearer ' prefix and correct token
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("DEBUG: Dashboard fetch successful, data:", data); // Debug log
          setUserName(data.name || data.username || 'User');
          setLastLogin(data.lastLogin ? new Date(data.lastLogin).toLocaleString() : 'Just now');
          setError(null);
        } else {
          // **CRITICAL CHECK 2: Unauthorized/Forbidden Redirect Logic**
          const errorData = await response.json();
          console.error("DEBUG: Dashboard fetch failed:", response.status, errorData); // Debug log
          setError(errorData.message || 'Failed to load dashboard data.');
          if (response.status === 401 || response.status === 403) {
            console.warn("DEBUG: Dashboard fetch: Received 401/403, removing token and redirecting to login."); // Debug log
            localStorage.removeItem('jwtToken'); // Remove the invalid/expired token
            navigate('/login'); // Redirect to login
          }
        }
      } catch (err) {
        console.error('DEBUG: Dashboard fetch: Network or unexpected error:', err); // Debug log
        setError('Network error or server unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, API_BASE_URL]); // Dependencies for useEffect

  // Conditional rendering for loading state
  if (loading) {
    return (
      <>
        {/* **CRITICAL FIX 3: Pass handleLogout to Nav component** */}
        <Nav onLogout={handleLogout} />
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#333333' }}>
          <Spinner animation="border" role="status" variant="light">
            <span className="visually-hidden">Loading dashboard...</span>
          </Spinner>
        </div>
      </>
    );
  }

  // Main Dashboard content for loaded state
  return (
    <>
      {/* **CRITICAL FIX 3: Pass handleLogout to Nav component** */}
      <Nav onLogout={handleLogout} /> {/* Render the Nav component */}
      <div className="dashboard-page-background"> {/* Apply background styles */}
        <Container className="py-4 dashboard-container"> {/* Container for content */}
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={8}> {/* Adjust column width for central content */}
              <h1 className="text-light text-center mb-4">Hello, {userName}!</h1>
              {error && <Alert variant="danger" className="mb-4 text-center">{error}</Alert>}

              <Card className="mb-4 shadow-sm dashboard-card">
                <Card.Body>
                  <Card.Title className="text-dark">Last Login</Card.Title>
                  <Card.Text className="text-muted">
                    Your last login was: **{lastLogin}**
                  </Card.Text>
                </Card.Body>
              </Card>

              <Row className="mb-4">
                <Col md={6} className="mb-4">
                  <Card className="h-100 shadow-sm dashboard-card">
                    <Card.Body>
                      <Card.Title className="text-dark">Ongoing Tasks</Card.Title>
                      <Card.Text className="text-muted">
                        <ul className="list-unstyled">
                          <li><i className="bi bi-circle-fill text-warning me-2"></i> Prepare Q3 financial report (Due: 25/06)</li>
                          <li><i className="bi bi-circle-fill text-warning me-2"></i> Call John about project alpha</li>
                          <li><i className="bi bi-circle-fill text-warning me-2"></i> Review client feedback for redesign</li>
                        </ul>
                        <Link to="/tasks/ongoing" className="card-link">View All Ongoing Tasks</Link>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} className="mb-4">
                  <Card className="h-100 shadow-sm dashboard-card">
                    <Card.Body>
                      <Card.Title className="text-dark">Finished Tasks</Card.Title>
                      <Card.Text className="text-muted">
                        <ul className="list-unstyled">
                          <li><i className="bi bi-check-circle-fill text-success me-2"></i> Complete onboarding module (20/05)</li>
                          <li><i className="bi bi-check-circle-fill text-success me-2"></i> Schedule team meeting for June</li>
                          <li><i className="bi bi-check-circle-fill text-success me-2"></i> Send out monthly newsletter</li>
                        </ul>
                        <Link to="/tasks/finished" className="card-link">View All Finished Tasks</Link>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* This dedicated logout button here is now redundant because the Nav component handles it */}
              {/* <div className="text-center mt-4">
                <Button variant="outline-danger" onClick={handleLogout} size="lg">
                  Logout
                </Button>
              </div> */}

            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Dashboard;