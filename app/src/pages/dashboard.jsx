import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css'; // Assuming this has your main app background styles

const Dashboard = () => {
  const navigate = useNavigate();

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the token from local storage
    navigate('/login'); // Redirect to the login page
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Container className="text-center p-5 rounded shadow-sm bg-white">
        <Row className="justify-content-center">
          <Col md={8}>
            <h1 className="display-4 text-success mb-3">Welcome to your Dashboard!</h1>
            <p className="lead mb-4">
              You are successfully logged in. This is your personal space.
            </p>
            <Button variant="outline-danger" onClick={handleLogout} size="lg">
              Logout
            </Button>
            <p className="mt-3 text-muted">
              <Link to="/">Go to Homepage</Link>
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;