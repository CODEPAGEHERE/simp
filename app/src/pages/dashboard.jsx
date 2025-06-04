import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css'; // Assuming this has your main app background styles
import Nav from '../components/nav'; // Import the Navbar component

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User'); // Default name
  const [lastLogin, setLastLogin] = useState('N/A'); // Placeholder for last login time
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define your API base URL
  const API_BASE_URL = import.meta.env.VITE_SIMP_API_POINT;

  // Function to fetch user data and other dashboard info
  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login'); // Redirect to login if no token
        return;
      }

      try {
        // Assuming your backend has an endpoint like /api/user/dashboard or /api/auth/me
        // that returns user's name, last login, and maybe task summaries
        const response = await fetch(`${API_BASE_URL}/auth/me`, { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Assuming your user data has 'name' or 'username' and 'lastLogin' fields
          setUserName(data.name || data.username || 'User');
          setLastLogin(data.lastLogin ? new Date(data.lastLogin).toLocaleString() : 'Just now'); // Format date
          setError(null);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to load dashboard data.');
          if (response.status === 401 || response.status === 403) {
             localStorage.removeItem('token');
             navigate('/login');
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Network error or server unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, API_BASE_URL]);

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the token from local storage
    navigate('/login'); // Redirect to the login page
  };

  if (loading) {
    return (
      <>
        <Nav />
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#333333' }}>
          <Spinner animation="border" role="status" variant="light">
            <span className="visually-hidden">Loading dashboard...</span>
          </Spinner>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav /> {/* Render the Navbar component */}
      <div className="dashboard-page-background"> {/* Apply background styles */}
        <Container className="py-4 dashboard-container"> {/* Container for content */}
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={8}> {/* Adjust column width for central content */}
              {/* Custom Name Greeting */}
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
                {/* Ongoing Tasks */}
                <Col md={6} className="mb-4">
                  <Card className="h-100 shadow-sm dashboard-card">
                    <Card.Body>
                      <Card.Title className="text-dark">Ongoing Tasks</Card.Title>
                      <Card.Text className="text-muted">
                        <ul className="list-unstyled">
                          <li><i className="bi bi-circle-fill text-warning me-2"></i> Prepare Q3 financial report (Due: 25/06)</li>
                          <li><i className="bi bi-circle-fill text-warning me-2"></i> Call John about project alpha</li>
                          <li><i className="bi bi-circle-fill text-warning me-2"></i> Review client feedback for redesign</li>
                          {/* More ongoing tasks would come from API */}
                        </ul>
                        <Link to="/tasks/ongoing" className="card-link">View All Ongoing Tasks</Link>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Finished Tasks */}
                <Col md={6} className="mb-4">
                  <Card className="h-100 shadow-sm dashboard-card">
                    <Card.Body>
                      <Card.Title className="text-dark">Finished Tasks</Card.Title>
                      <Card.Text className="text-muted">
                        <ul className="list-unstyled">
                          <li><i className="bi bi-check-circle-fill text-success me-2"></i> Complete onboarding module (20/05)</li>
                          <li><i className="bi bi-check-circle-fill text-success me-2"></i> Schedule team meeting for June</li>
                          <li><i className="bi bi-check-circle-fill text-success me-2"></i> Send out monthly newsletter</li>
                          {/* More finished tasks would come from API */}
                        </ul>
                        <Link to="/tasks/finished" className="card-link">View All Finished Tasks</Link>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Logout Button */}
              <div className="text-center mt-4">
                <Button variant="outline-danger" onClick={handleLogout} size="lg">
                  Logout
                </Button>

              </div>

            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Dashboard;